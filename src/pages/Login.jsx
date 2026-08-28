import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { login } from '../lib/auth';
import { useAuth } from '../lib/AuthContext';
import MobileInput from '../components/MobileInput';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const profile = await login(mobile, password);
      await refreshProfile();
      navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
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
        <ul className="auth-features">
          <li><CheckCircle2 size={18} /> Instant room booking</li>
          <li><CheckCircle2 size={18} /> Live occupancy &amp; check-in tracking</li>
          <li><CheckCircle2 size={18} /> Guest self-registration</li>
          <li><CheckCircle2 size={18} /> Admin dashboard &amp; reports</li>
        </ul>
      </div>

      <div className="auth-panel">
        <div className="auth-container">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">Login with your mobile number to continue.</p>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Mobile Number</label>
              <MobileInput value={mobile} onChange={setMobile} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input
                placeholder="Enter password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ marginTop: 12 }}>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </p>
          <p>New guest? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}
