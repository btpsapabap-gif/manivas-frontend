import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import MobileInput from '../components/MobileInput';

export default function ForgotPassword() {
  const [mobile, setMobile] = useState('');
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          mobile_number: mobile,
          full_name: fullName,
          new_password: newPassword
        })
      });
      setSuccess(data.message || 'Password reset successfully. You can now log in.');
      setMobile('');
      setFullName('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <img src="/logo.jpg" alt="MA'Nivas" className="brand-logo" />
        <p className="auth-tagline">A Place to Live. A Feeling to Stay.</p>
      </div>

      <div className="auth-panel">
        <div className="auth-container">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">
            Enter your registered mobile number and full name to set a new password.
          </p>

          {success ? (
            <div className="success-box">
              <p>{success}</p>
              <Link to="/login">← Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div>
                <label className="field-label">Mobile Number</label>
                <MobileInput value={mobile} onChange={setMobile} />
              </div>
              <div>
                <label className="field-label">Full Name (as registered)</label>
                <input
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="field-label">New Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="field-label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p><Link to="/login">← Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}
