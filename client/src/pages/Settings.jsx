import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/Settings.scss';
import AvatarSelector from '../components/Avatar/AvatarSelector';

export default function Settings() {
    const [emailFrequency, setEmailFrequency] = useState('daily');
    const [emailTime, setEmailTime] = useState('08:00');
    const [emailDay, setEmailDay] = useState('1'); // 1 = Monday
    const [avatarIndex, setAvatarIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { token, user, refreshProfile } = useAuth();

    useEffect(() => {
        if (!token) return;

        fetch('http://localhost:5001/api/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (data.EmailFrequency) setEmailFrequency(data.EmailFrequency);
                if (data.EmailTime) setEmailTime(data.EmailTime);
                if (data.EmailDay !== undefined) setEmailDay(String(data.EmailDay));
                if (data.AvatarIndex !== undefined) setAvatarIndex(Number(data.AvatarIndex));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [token]);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('http://localhost:5001/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    emailFrequency,
                    emailTime,
                    emailDay,
                    avatarIndex
                })
            });

            if (res.ok) {
                setMessage('Settings saved successfully!');
                await refreshProfile(); // Refresh context
            } else {
                setMessage('Failed to save settings.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Error saving settings.');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

            <p><strong>Account Email:</strong> {user?.email}</p>

            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label>Choose Your Avatar</label>
                    <div style={{ marginBottom: '10px' }}>
                        <AvatarSelector
                            selectedIndex={avatarIndex}
                            onSelect={setAvatarIndex}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Frequency of Excerpts Emails</label>
                    <select
                        value={emailFrequency}
                        onChange={e => setEmailFrequency(e.target.value)}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="never">Never</option>
                    </select>
                </div>

                {emailFrequency !== 'never' && (
                    <div className="form-group">
                        <label>Time of Day</label>
                        <input
                            type="time"
                            value={emailTime}
                            onChange={e => setEmailTime(e.target.value)}
                        />
                    </div>
                )}

                {emailFrequency === 'weekly' && (
                    <div className="form-group">
                        <label>Day of Week</label>
                        <select
                            value={emailDay}
                            onChange={e => setEmailDay(e.target.value)}
                        >
                            <option value="0">Sunday</option>
                            <option value="1">Monday</option>
                            <option value="2">Tuesday</option>
                            <option value="3">Wednesday</option>
                            <option value="4">Thursday</option>
                            <option value="5">Friday</option>
                            <option value="6">Saturday</option>
                        </select>
                    </div>
                )}

                <button type="submit" className="save-btn">
                    Save Settings
                </button>
            </form>
        </div >
    );
}
