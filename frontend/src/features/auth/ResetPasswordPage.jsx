import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorText, Field } from '@/components/Feedback';
import { showToast } from '@/features/ui/uiSlice';
import { resetPassword } from './authSlice';
import AuthCard from './AuthCard';

export default function ResetPasswordPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { token } = useParams();
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await dispatch(resetPassword({ token, ...form })).unwrap();
            dispatch(showToast('Password changed'));
            navigate('/list', { replace: true });
        } catch (message) {
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthCard title="Choose a new password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="New password" hint="At least 8 characters">
                    <input className="input" type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required />
                </Field>
                <Field label="Confirm new password">
                    <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
                </Field>
                <ErrorText>{error}</ErrorText>
                <button className="btn btn-primary w-full" disabled={submitting}>
                    {submitting ? 'Saving…' : 'Save password'}
                </button>
            </form>
        </AuthCard>
    );
}
