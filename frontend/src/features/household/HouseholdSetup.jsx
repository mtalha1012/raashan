import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorText, Field } from '@/components/Feedback';
import { setHouseholdId } from '@/features/auth/authSlice';
import { showToast } from '@/features/ui/uiSlice';
import { createHousehold, joinHousehold } from './householdSlice';

export default function HouseholdSetup() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({ name: `${user.name}'s Family`, inviteCode: '', nickname: user.name });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setBusy(true);
        try {
            const action =
                mode === 'create'
                    ? createHousehold({ name: form.name, nickname: form.nickname })
                    : joinHousehold({ inviteCode: form.inviteCode, nickname: form.nickname });
            const { household } = await dispatch(action).unwrap();
            dispatch(setHouseholdId(household._id));
            dispatch(showToast(mode === 'create' ? 'Family list started' : `You joined ${household.name}`));
        } catch (reason) {
            setError(reason);
            setBusy(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl">
            <p className="eyebrow">One list per household</p>
            <h1 className="mt-2 text-4xl sm:text-5xl">Start your family list</h1>
            <p className="mt-3 text-muted">
                Everyone in the house writes on the same parchi. Start one and share the invite code, or join the one
                your family already has.
            </p>

            <div className="mt-6 inline-flex rounded-full border border-line bg-white p-1" role="tablist">
                {[
                    ['create', 'Start a new list'],
                    ['join', 'Join with a code'],
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={mode === value}
                        className={`btn btn-sm ${mode === value ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => {
                            setMode(value);
                            setError('');
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="card mt-4 space-y-4 p-5">
                {mode === 'create' ? (
                    <Field label="Household name">
                        <input className="input" name="name" value={form.name} onChange={handleChange} required maxLength={40} />
                    </Field>
                ) : (
                    <Field label="Invite code" hint="Six letters and numbers, ask whoever started the list">
                        <input
                            className="input price uppercase tracking-[0.3em]"
                            name="inviteCode"
                            value={form.inviteCode}
                            onChange={handleChange}
                            required
                            maxLength={6}
                            placeholder="KHAN26"
                        />
                    </Field>
                )}
                <Field label="What does the family call you?" hint="Shown next to the items you add, e.g. Ammi, Abbu, Bhai">
                    <input className="input" name="nickname" value={form.nickname} onChange={handleChange} required maxLength={20} />
                </Field>
                <ErrorText>{error}</ErrorText>
                <button className="btn btn-primary" disabled={busy}>
                    {mode === 'create' ? 'Start the list' : 'Join household'}
                </button>
            </form>
        </div>
    );
}
