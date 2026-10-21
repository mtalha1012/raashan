import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorText, Field } from '@/components/Feedback';
import AddressBook from '@/features/addresses/AddressBook';
import { showToast } from '@/features/ui/uiSlice';
import { updatePassword, updateProfile } from './authSlice';

function ProfileForm({ user }) {
    const dispatch = useDispatch();
    const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
    const [error, setError] = useState('');

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await dispatch(updateProfile(form)).unwrap();
            dispatch(showToast('Profile saved'));
        } catch (message) {
            setError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Name">
                <input className="input" name="name" value={form.name} onChange={handleChange} required minLength={2} />
            </Field>
            <Field label="Email">
                <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
            </Field>
            <Field label="Phone">
                <input className="input" type="tel" name="phone" value={form.phone} onChange={handleChange} />
            </Field>
            <ErrorText>{error}</ErrorText>
            <button className="btn btn-primary">Save profile</button>
        </form>
    );
}

function PasswordForm() {
    const dispatch = useDispatch();
    const empty = { oldPassword: '', newPassword: '', confirmPassword: '' };
    const [form, setForm] = useState(empty);
    const [error, setError] = useState('');

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await dispatch(updatePassword(form)).unwrap();
            setForm(empty);
            dispatch(showToast('Password changed'));
        } catch (message) {
            setError(message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Current password">
                <input className="input" type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} required autoComplete="current-password" />
            </Field>
            <Field label="New password">
                <input className="input" type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={8} autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password">
                <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
            </Field>
            <ErrorText>{error}</ErrorText>
            <button className="btn btn-outline">Change password</button>
        </form>
    );
}

export default function AccountPage() {
    const user = useSelector((state) => state.auth.user);

    return (
        <div className="space-y-6">
            <h1 className="text-4xl">Account</h1>

            <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="space-y-6">
                    <section className="card p-5">
                        <h2 className="mb-4 text-xl">Profile</h2>
                        <ProfileForm user={user} />
                    </section>
                    <section className="card p-5">
                        <h2 className="mb-4 text-xl">Password</h2>
                        <PasswordForm />
                    </section>
                </div>

                <section className="card h-fit p-5">
                    <h2 className="mb-4 text-xl">Delivery addresses</h2>
                    <AddressBook />
                </section>
            </div>
        </div>
    );
}
