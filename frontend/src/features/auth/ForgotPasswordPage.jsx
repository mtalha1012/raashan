import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ErrorText, Field } from '@/components/Feedback';
import { forgotPassword } from './authSlice';
import AuthCard from './AuthCard';

export default function ForgotPasswordPage() {
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [sentTo, setSentTo] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await dispatch(forgotPassword(email)).unwrap();
            setSentTo(email);
        } catch (message) {
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Reset password"
            subtitle="We'll email you a link that works for 15 minutes."
            footer={
                <Link to="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
                    Back to log in
                </Link>
            }
        >
            {sentTo ? (
                <p className="rounded-lg bg-leaf-soft px-4 py-3 text-leaf">
                    Check {sentTo} for the reset link.
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Email">
                        <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </Field>
                    <ErrorText>{error}</ErrorText>
                    <button className="btn btn-primary w-full" disabled={submitting}>
                        {submitting ? 'Sending…' : 'Send reset link'}
                    </button>
                </form>
            )}
        </AuthCard>
    );
}
