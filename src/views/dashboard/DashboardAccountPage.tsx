'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Shield, Calendar, CheckCircle, AlertCircle, Loader2, BadgeCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authClient } from '../../lib/auth-client';
import { Avatar } from '../../components/ui/Avatar';

/**
 * DashboardAccountPage - User profile and account settings
 *
 * Editorial-styled account page within the dashboard layout.
 * Allows users to view profile info, update display name, and change password.
 */
export function DashboardAccountPage() {
  const router = useRouter();
  const { user, isSystemAdmin, loading, logout } = useAuth();

  // Display name form state
  const [displayName, setDisplayName] = useState(user?.name || user?.user_metadata?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateDisplayName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setNameSuccess(false);
    setSavingName(true);

    try {
      const result = await authClient.updateUser({ name: displayName.trim() });
      if (result.error) throw new Error(result.error.message || 'Failed to update display name');
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error) {
      setNameError(error instanceof Error ? error.message : 'Failed to update display name');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      const result = await authClient.changePassword({ currentPassword, newPassword });
      if (result.error) throw new Error(result.error.message || 'Failed to change password');
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[800px]">
        <div className="animate-pulse">
          <div className="h-32 rounded-xl" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
          <div className="h-48 rounded-xl mt-6" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
          <div className="h-32 rounded-xl mt-6" style={{ backgroundColor: 'var(--editorial-border-light)' }} />
        </div>
      </div>
    );
  }

  const displayNameStr = user?.name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const roleLabel = isSystemAdmin ? 'System Administrator' : 'District Administrator';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[800px]">
      {/* Profile Header */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        {/* Accent strip */}
        <div className="h-1.5" style={{ backgroundColor: isSystemAdmin ? '#b85c38' : '#6b8f71' }} />

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar size="xl" name={displayNameStr} src={user?.image ?? undefined} />

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1
              className="text-2xl sm:text-[28px] font-medium tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
            >
              {displayNameStr}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--editorial-text-muted)' }}>
              {user?.email}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={
                  isSystemAdmin
                    ? { backgroundColor: 'rgba(184, 92, 56, 0.12)', color: '#b85c38' }
                    : { backgroundColor: 'rgba(107, 143, 113, 0.15)', color: 'var(--editorial-accent-success)' }
                }
              >
                <Shield size={12} />
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Display Name Section */}
      <section
        className="rounded-xl"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <User className="w-5 h-5" style={{ color: 'var(--editorial-accent-primary)' }} />
            </div>
            <div>
              <h2
                className="text-lg font-medium"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
              >
                Display Name
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
                This name appears across the platform
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateDisplayName}>
            {nameError && (
              <div
                className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: 'rgba(185, 28, 28, 0.06)', border: '1px solid rgba(185, 28, 28, 0.15)', color: '#b91c1c' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {nameError}
              </div>
            )}
            {nameSuccess && (
              <div
                className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: 'rgba(107, 143, 113, 0.1)', border: '1px solid rgba(107, 143, 113, 0.2)', color: '#6b8f71' }}
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                Display name updated successfully
              </div>
            )}

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-2.5 rounded-lg text-sm transition-colors focus:outline-hidden"
              style={{
                border: '1px solid var(--editorial-border)',
                backgroundColor: 'var(--editorial-surface)',
                color: 'var(--editorial-text-primary)',
              }}
            />
            <button
              type="submit"
              disabled={savingName}
              className="mt-4 px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: 'var(--editorial-accent-primary)' }}
              onMouseEnter={(e) => { if (!savingName) e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-accent-primary)'; }}
            >
              {savingName && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Name
            </button>
          </form>
        </div>
      </section>

      {/* Email Section (Read-only) */}
      <section
        className="rounded-xl"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <Mail className="w-5 h-5" style={{ color: 'var(--editorial-text-muted)' }} />
            </div>
            <div>
              <h2
                className="text-lg font-medium"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
              >
                Email Address
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
                Your email cannot be changed
              </p>
            </div>
          </div>

          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 rounded-lg text-sm cursor-not-allowed"
            style={{
              border: '1px solid var(--editorial-border-light)',
              backgroundColor: 'var(--editorial-surface-alt)',
              color: 'var(--editorial-text-muted)',
            }}
          />
        </div>
      </section>

      {/* Password Section */}
      <section
        className="rounded-xl"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)' }}
            >
              <Lock className="w-5 h-5" style={{ color: '#d97706' }} />
            </div>
            <div>
              <h2
                className="text-lg font-medium"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
              >
                Change Password
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
                Update your account password
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            {passwordError && (
              <div
                className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: 'rgba(185, 28, 28, 0.06)', border: '1px solid rgba(185, 28, 28, 0.15)', color: '#b91c1c' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div
                className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
                style={{ backgroundColor: 'rgba(107, 143, 113, 0.1)', border: '1px solid rgba(107, 143, 113, 0.2)', color: '#6b8f71' }}
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                Password changed successfully
              </div>
            )}

            <div className="space-y-4 mb-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-lg text-sm transition-colors focus:outline-hidden"
                  style={{
                    border: '1px solid var(--editorial-border)',
                    backgroundColor: 'var(--editorial-surface)',
                    color: 'var(--editorial-text-primary)',
                  }}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full px-4 py-2.5 rounded-lg text-sm transition-colors focus:outline-hidden"
                  style={{
                    border: '1px solid var(--editorial-border)',
                    backgroundColor: 'var(--editorial-surface)',
                    color: 'var(--editorial-text-primary)',
                  }}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--editorial-text-secondary)' }}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 rounded-lg text-sm transition-colors focus:outline-hidden"
                  style={{
                    border: '1px solid var(--editorial-border)',
                    backgroundColor: 'var(--editorial-surface)',
                    color: 'var(--editorial-text-primary)',
                  }}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: '#d97706' }}
              onMouseEnter={(e) => { if (!savingPassword) e.currentTarget.style.backgroundColor = '#b45309'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#d97706'; }}
            >
              {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Change Password
            </button>
          </form>
        </div>
      </section>

      {/* Account Info Section */}
      <section
        className="rounded-xl"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <div className="p-6">
          <h2
            className="text-lg font-medium mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
          >
            Account Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--editorial-text-muted)' }}>
                <Shield size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Role</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
                {isSystemAdmin ? 'System Admin' : 'District Admin'}
              </p>
            </div>

            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--editorial-text-muted)' }}>
                <Calendar size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Member Since</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--editorial-text-primary)' }}>
                {memberSince}
              </p>
            </div>

            <div
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--editorial-surface-alt)' }}
            >
              <div className="flex items-center gap-2 mb-1.5" style={{ color: 'var(--editorial-text-muted)' }}>
                <BadgeCheck size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">Email Verified</span>
              </div>
              <p className="text-sm font-medium" style={{ color: user?.emailVerified ? '#6b8f71' : 'var(--editorial-text-muted)' }}>
                {user?.emailVerified ? 'Verified' : 'Not verified'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sign Out */}
      <section
        className="rounded-xl"
        style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-medium"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--editorial-text-primary)' }}
              >
                Sign Out
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--editorial-text-muted)' }}>
                End your current session
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  await logout();
                  router.push('/');
                } catch (error) {
                  console.error('Logout failed:', error);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                border: '1px solid var(--editorial-border)',
                color: 'var(--editorial-text-secondary)',
                backgroundColor: 'var(--editorial-surface)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface-alt)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--editorial-surface)'; }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
