import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import ProfileMenu from '../components/ProfileMenu';
import IdProofManager from '../components/IdProofManager';

const STATUS_LABELS = { checked_in: 'checked in', checked_out: 'checked out' };

function StatusPill({ status }) {
  return <span className={`status-pill status-${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export default function GuestDashboard() {
  const { profile } = useAuth();
  const [availableRooms, setAvailableRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ room_id: '', from_date: '', to_date: '' });
  const [message, setMessage] = useState('');
  const [hasIdProof, setHasIdProof] = useState(null);
  const todayISO = new Date().toISOString().slice(0, 10);

  async function loadBookings() {
    const bookingsData = await apiRequest('/api/bookings');
    setBookings(bookingsData);
  }

  // Fetch rooms available for the selected date range from the backend.
  // Falls back to all rooms when dates aren't chosen yet.
  async function loadAvailableRooms(from, to) {
    try {
      if (from && to && to >= from) {
        const data = await apiRequest(`/api/rooms/available?from=${from}&to=${to}`);
        setAvailableRooms(data);
      } else {
        const data = await apiRequest('/api/rooms');
        setAvailableRooms(data.filter((r) => r.status === 'available'));
      }
    } catch {
      setAvailableRooms([]);
    }
  }

  async function checkIdProof() {
    if (!profile?.id) return;
    try {
      const data = await apiRequest(`/api/guests/${profile.id}/id-proof`);
      setHasIdProof(Boolean(data.id_proof_type && data.id_proof_number && data.image_url));
    } catch {
      setHasIdProof(false);
    }
  }

  useEffect(() => {
    loadBookings();
    loadAvailableRooms('', '');
  }, []);

  useEffect(() => { checkIdProof(); }, [profile?.id]);

  // Re-fetch available rooms whenever dates change
  useEffect(() => {
    loadAvailableRooms(form.from_date, form.to_date);
    // Clear selected room if it's no longer in the available list
    setForm((prev) => ({ ...prev, room_id: '' }));
  }, [form.from_date, form.to_date]);

  async function handleBook(e) {
    e.preventDefault();
    setMessage('');
    try {
      await apiRequest('/api/bookings', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Room booked successfully!');
      setForm({ room_id: '', from_date: '', to_date: '' });
      loadBookings();
      loadAvailableRooms('', '');
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{
        background: 'linear-gradient(180deg, var(--teal-900), var(--teal-950))',
        color: 'white', padding: '16px 44px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <img src="/logo.jpg" alt="MA'Nivas" style={{ height: 52, borderRadius: 8, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, opacity: 0.9 }}>{profile?.full_name}</span>
          <ProfileMenu name={profile?.full_name} roleLabel="Guest" />
        </div>
      </div>

      <main className="main-content" style={{ margin: '0 auto' }}>
        <div className="welcome-block">
          <h2>Welcome, {profile?.full_name} 👋</h2>
          <p>Book a room or check your existing reservations below.</p>
        </div>

        <div className="card">
          <h3>Book a Room</h3>
          {hasIdProof === false && (
            <p style={{ fontSize: 13.5, color: 'var(--danger)', marginBottom: 12 }}>
              Please add your ID proof below before booking a room — it's required for check-in.
            </p>
          )}
          <form onSubmit={handleBook} className="booking-form">
            <label>
              From:{' '}
              <input
                type="date"
                min={todayISO}
                value={form.from_date}
                onChange={(e) => setForm({ ...form, from_date: e.target.value, to_date: '' })}
                required
                disabled={!hasIdProof}
              />
            </label>
            <label>
              To:{' '}
              <input
                type="date"
                min={form.from_date || todayISO}
                value={form.to_date}
                onChange={(e) => setForm({ ...form, to_date: e.target.value })}
                required
                disabled={!hasIdProof || !form.from_date}
              />
            </label>
            <select
              value={form.room_id}
              onChange={(e) => setForm({ ...form, room_id: e.target.value })}
              required
              disabled={!hasIdProof || !form.from_date || !form.to_date}
            >
              <option value="">
                {(!form.from_date || !form.to_date)
                  ? 'Select dates first'
                  : availableRooms.length === 0
                    ? 'No rooms available for these dates'
                    : 'Select a room'}
              </option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} — {r.room_type} (₹{r.price_per_night}/night)
                </option>
              ))}
            </select>
            <button type="submit" disabled={!hasIdProof || !form.room_id}>
              Book Now
            </button>
          </form>
          {message && (
            <p style={{ marginTop: 12, fontSize: 14, color: message.includes('success') ? 'var(--teal-700)' : 'var(--danger)' }}>
              {message}
            </p>
          )}
        </div>

        <div className="card">
          <h3>My Bookings</h3>
          <table>
            <thead>
              <tr><th>Room</th><th>From</th><th>To</th><th>Cost</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.rooms?.room_number}</td>
                  <td>{b.from_date}</td>
                  <td>{b.to_date}</td>
                  <td>₹{b.total_cost}</td>
                  <td><StatusPill status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {profile?.id && (
          <div className="card">
            <h3>ID Proof</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: -8, marginBottom: 14 }}>
              Add a government ID for faster check-in.
            </p>
            <IdProofManager guestId={profile.id} onSaved={checkIdProof} />
          </div>
        )}
      </main>
    </div>
  );
}
