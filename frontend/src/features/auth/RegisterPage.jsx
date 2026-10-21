import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorText, Field } from '@/components/Feedback';
import { showToast } from '@/features/ui/uiSlice';
import { register } from './authSlice';
import AuthCard from './AuthCard';

export default function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to="/list" replace />;

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await dispatch(register(form)).unwrap();
            dispatch(showToast('Account created'));
            // Next step is setting up or joining the family list
            navigate('/list', { replace: true });
        } catch (message) {
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Create account"
            subtitle="Then start a family list, or join one with an invite code."
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
                        Log in
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Name">
                    <input className="input" name="name" value={form.name} onChange={handleChange} autoComplete="name" required minLength={2} />
                </Field>
                <Field label="Email">
                    <input className="input" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                </Field>
                <Field label="Phone (optional)">
                    <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" placeholder="0300 1234567" />
                </Field>
                <Field label="Password" hint="At least 8 characters">
                    <input
                        className="input"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        minLength={8}
                    />
                </Field>
                <ErrorText>{error}</ErrorText>
                <button className="btn btn-primary w-full" disabled={submitting}>
                    {submitting ? 'Creating account…' : 'Create account'}
                </button>
            </form>
        </AuthCard>
    );
}
