import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ErrorText, Field } from '@/components/Feedback';
import { showToast } from '@/features/ui/uiSlice';
import { login } from './authSlice';
import AuthCard from './AuthCard';

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const redirectTo = location.state?.from || '/list';

    if (user) return <Navigate to={redirectTo} replace />;

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const { user } = await dispatch(login(form)).unwrap();
            dispatch(showToast(`Welcome back, ${user.name}`));
            navigate(redirectTo, { replace: true });
        } catch (message) {
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthCard
            title="Log in"
            subtitle="Pick up your family's list where you left it."
            footer={
                <>
                    New here?{' '}
                    <Link to="/register" className="font-semibold text-ink underline-offset-2 hover:underline">
                        Create an account
                    </Link>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Email">
                    <input className="input" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                </Field>
                <Field label="Password">
                    <input
                        className="input"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />
                </Field>
                <ErrorText>{error}</ErrorText>
                <div className="flex items-center justify-between gap-3">
                    <Link to="/password/forgot" className="text-sm text-muted hover:text-text">
                        Forgot password?
                    </Link>
                    <button className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Logging in…' : 'Log in'}
                    </button>
                </div>
            </form>
        </AuthCard>
    );
}
