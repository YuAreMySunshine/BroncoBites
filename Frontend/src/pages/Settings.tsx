import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface UserProfile {
  userId: string;
  height: {
    feet: number;
    inches: number;
  };
  weight: number;
  goal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  restrictions: string[];
}

export default function Settings() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(0);
  const [weight, setWeight] = useState(150);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [carbsGoal, setCarbsGoal] = useState(200);
  const [fatsGoal, setFatsGoal] = useState(65);
  const [restrictions, setRestrictions] = useState<string[]>([]);

  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

  const availableRestrictions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Shellfish-Free'];

  // Wait for user to load
  if (!isLoaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not signed in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Fetch user profile
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/users/profile`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          // No profile exists yet
          setLoading(false);
          return;
        }
        
        if (!res.ok) {
          const text = await res.text();
          console.error('Response:', text);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (data) {
          setProfile(data);
          setHeightFeet(data.height.feet);
          setHeightInches(data.height.inches);
          setWeight(data.weight);
          setCalorieGoal(data.goal.calories);
          setProteinGoal(data.goal.protein);
          setCarbsGoal(data.goal.carbs);
          setFatsGoal(data.goal.fats);
          setRestrictions(data.restrictions || []);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setMessage({ type: 'error', text: 'Failed to load profile' });
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, API_BASE, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const profileData = {
      height: {
        feet: heightFeet,
        inches: heightInches,
      },
      weight: weight,
      goal: {
        calories: calorieGoal,
        protein: proteinGoal,
        carbs: carbsGoal,
        fats: fatsGoal,
      },
      restrictions: restrictions,
    };

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Response:', text);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const savedProfile = await res.json();
      setProfile(savedProfile);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleRestriction = (restriction: string) => {
    setRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  return (
    <div className="bb">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--text)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Settings
          </h1>
          <p style={{ color: 'var(--text-muted, #b7c2d6)', fontSize: '1.1rem' }}>
            Manage your profile and nutrition goals
          </p>
        </header>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading your profile...</p>
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
            {message && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  background: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${message.type === 'success' ? '#4ade80' : '#ef4444'}`,
                  color: message.type === 'success' ? '#4ade80' : '#ef4444',
                }}
              >
                {message.text}
              </div>
            )}

            {/* Physical Stats */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Physical Stats</h3>

              {/* Height */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Height
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="0"
                      max="8"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                      }}
                    />
                    <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>Feet</small>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text)',
                      }}
                    />
                    <small style={{ color: '#999', marginTop: '0.25rem', display: 'block' }}>Inches</small>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </section>

            {/* Nutrition Goals */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Daily Nutrition Goals</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {/* Calories */}
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Calories
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {/* Protein */}
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={proteinGoal}
                    onChange={(e) => setProteinGoal(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {/* Carbs */}
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={carbsGoal}
                    onChange={(e) => setCarbsGoal(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                {/* Fats */}
                <div>
                  <label style={{ display: 'block', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Fats (g)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={fatsGoal}
                    onChange={(e) => setFatsGoal(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text)',
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Dietary Restrictions */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--text)', marginBottom: '1rem' }}>Dietary Restrictions</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {availableRestrictions.map((restriction) => (
                  <label
                    key={restriction}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: restrictions.includes(restriction)
                        ? 'rgba(96, 91, 253, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={restrictions.includes(restriction)}
                      onChange={() => toggleRestriction(restriction)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ color: 'var(--text)' }}>{restriction}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn primary"
                style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
              >
                {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
