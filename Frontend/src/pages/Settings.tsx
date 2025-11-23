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
      <div className="page">
        <Navbar />
        <main className="container" style={{ paddingTop: 'var(--space-16)', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Loading...</p>
        </main>
        <Footer />
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
    <div className="page">
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: '800px' }}>
        <header className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile and nutrition goals</p>
        </header>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Loading your profile...</p>
          </div>
        )}

        {!loading && (
          <form onSubmit={handleSubmit}>
            {message && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {message.text}
              </div>
            )}

            {/* Physical Stats */}
            <div className="settings-section">
              <h3 className="settings-section__title">Physical Stats</h3>
              <div className="settings-form">
                {/* Height */}
                <div className="form-group">
                  <label className="form-label">Height</label>
                  <div className="settings-row">
                    <div className="form-group">
                      <input
                        type="number"
                        min="0"
                        max="8"
                        value={heightFeet}
                        onChange={(e) => setHeightFeet(Number(e.target.value))}
                        required
                        className="form-input"
                      />
                      <span className="form-helper">Feet</span>
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        min="0"
                        max="11"
                        value={heightInches}
                        onChange={(e) => setHeightInches(Number(e.target.value))}
                        required
                        className="form-input"
                      />
                      <span className="form-helper">Inches</span>
                    </div>
                  </div>
                </div>

                {/* Weight */}
                <div className="form-group">
                  <label className="form-label">Weight (lbs)</label>
                  <input
                    type="number"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    required
                    className="form-input"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              </div>
            </div>

            {/* Nutrition Goals */}
            <div className="settings-section">
              <h3 className="settings-section__title">Daily Nutrition Goals</h3>
              <div className="settings-form">
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Calories</label>
                    <input
                      type="number"
                      min="0"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(Number(e.target.value))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(Number(e.target.value))}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="settings-row">
                  <div className="form-group">
                    <label className="form-label">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={carbsGoal}
                      onChange={(e) => setCarbsGoal(Number(e.target.value))}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fats (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={fatsGoal}
                      onChange={(e) => setFatsGoal(Number(e.target.value))}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="settings-section">
              <h3 className="settings-section__title">Dietary Restrictions</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                {availableRestrictions.map((restriction) => (
                  <label
                    key={restriction}
                    className={`chip ${restrictions.includes(restriction) ? 'chip--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={restrictions.includes(restriction)}
                      onChange={() => toggleRestriction(restriction)}
                      className="sr-only"
                    />
                    {restriction}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-lg"
              >
                {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
