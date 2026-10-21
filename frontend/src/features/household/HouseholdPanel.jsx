import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHouseholdId } from '@/features/auth/authSlice';
import { showToast } from '@/features/ui/uiSlice';
import { deleteHousehold, leaveHousehold, newInviteCode, removeMember, renameHousehold, setNickname } from './householdSlice';

export default function HouseholdPanel({ household }) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const isOwner = household.owner === user._id;
    const me = household.members.find((member) => member.user?._id === user._id);
    const [name, setName] = useState(household.name);
    const [nickname, setNicknameValue] = useState(me?.nickname || '');

    const run = async (action, successMessage) => {
        try {
            await dispatch(action).unwrap();
            if (successMessage) dispatch(showToast(successMessage));
            return true;
        } catch (reason) {
            dispatch(showToast(reason, 'error'));
            return false;
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(household.inviteCode);
            dispatch(showToast('Invite code copied'));
        } catch {
            dispatch(showToast(`Invite code: ${household.inviteCode}`));
        }
    };

    const handleLeave = async () => {
        const lastOne = household.members.length === 1;
        const question = lastOne
            ? 'You are the only member, so leaving deletes this household and its list. Continue?'
            : `Leave ${household.name}? You can join again with the invite code.`;
        if (!window.confirm(question)) return;
        if (await run(leaveHousehold(), 'You left the household')) dispatch(setHouseholdId(null));
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete ${household.name} and its whole list for everyone?`)) return;
        if (await run(deleteHousehold(), 'Household deleted')) dispatch(setHouseholdId(null));
    };

    return (
        <section className="card p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="eyebrow">Household</p>
                    <h2 className="mt-1 text-xl">{household.name}</h2>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(!settingsOpen)} aria-expanded={settingsOpen}>
                    {settingsOpen ? 'Done' : 'Settings'}
                </button>
            </div>

            <ul className="mt-3 flex flex-wrap gap-2">
                {household.members.map((member) => (
                    <li key={member.user?._id} className="flex items-center gap-1.5 rounded-full bg-page py-1 pl-1 pr-3 text-sm">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-xs font-bold text-white">
                            {(member.nickname || member.user?.name || '?').charAt(0).toUpperCase()}
                        </span>
                        {member.nickname || member.user?.name}
                        {member.user?._id === household.owner && <span className="eyebrow">owner</span>}
                        {settingsOpen && isOwner && member.user?._id !== user._id && (
                            <button
                                type="button"
                                className="ml-1 text-margin"
                                onClick={() => window.confirm(`Remove ${member.nickname}?`) && run(removeMember(member.user._id), 'Member removed')}
                                aria-label={`Remove ${member.nickname}`}
                            >
                                ×
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-ink/40 bg-ink-soft/40 px-4 py-3">
                <div>
                    <p className="text-xs text-muted">Invite code</p>
                    <p className="price text-2xl tracking-[0.25em] text-ink">{household.inviteCode}</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={handleCopy}>
                    Copy
                </button>
            </div>

            {settingsOpen && (
                <div className="mt-4 space-y-4 border-t border-line pt-4">
                    <form
                        className="flex gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            run(setNickname(nickname), 'Nickname saved');
                        }}
                    >
                        <input className="input" value={nickname} onChange={(event) => setNicknameValue(event.target.value)} maxLength={20} aria-label="Your nickname" />
                        <button className="btn btn-outline btn-sm">Save nickname</button>
                    </form>

                    {isOwner && (
                        <>
                            <form
                                className="flex gap-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    run(renameHousehold(name), 'Household renamed');
                                }}
                            >
                                <input className="input" value={name} onChange={(event) => setName(event.target.value)} maxLength={40} aria-label="Household name" />
                                <button className="btn btn-outline btn-sm">Rename</button>
                            </form>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => run(newInviteCode(), 'New invite code made, the old one no longer works')}>
                                New invite code
                            </button>
                        </>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn btn-danger btn-sm" onClick={handleLeave}>
                            Leave household
                        </button>
                        {isOwner && (
                            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
                                Delete household
                            </button>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
