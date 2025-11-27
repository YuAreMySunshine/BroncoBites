import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Ruler,
  Target,
  Flame,
  Beef,
  Wheat,
  Droplets,
  AlertTriangle,
  Check,
  Save
} from 'lucide-react';
import '../style/home/Home.css';
import '../style/pages/Settings.css';
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
          setLoading(false);
          return;
        }

        if (!res.ok) {
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

  if (!isLoaded) {
    return (
      <div className="page">
        <Navbar />
        <main className="settings-main">
          <div className="settings-loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const profileData = {
      height: { feet: heightFeet, inches: heightInches },
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
      <main className="settings-main">
        <div className="settings-container">
          <header className="settings-header">
            <div className="settings-header__content">
              <h1 className="settings-title">
                <SettingsIcon size={32} className="settings-title-icon" />
                Settings
              </h1>
              <p className="settings-subtitle">Manage your profile and preferences</p>
            </div>
          </header>

          {loading ? (
            <div className="settings-loading">
              <div className="spinner"></div>
              <p>Loading your profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="settings-form">
              {message && (
                <div className={`settings-alert ${message.type === 'success' ? 'settings-alert--success' : 'settings-alert--error'}`}>
                  <Check size={18} />
                  {message.text}
                </div>
              )}

              <div className="settings-layout">
                {/* Sidebar */}
                <aside className="settings-sidebar">
                  {/* User Info Card */}
                  <div className="sidebar-card">
                    <div className="sidebar-card__avatar">
                      <User size={32} />
                    </div>
                    <div className="sidebar-card__info">
                      <h3 className="sidebar-card__name">{user.fullName || 'User'}</h3>
                      <p className="sidebar-card__email">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>

                  {/* Physical Stats */}
                  <section className="sidebar-section">
                    <h3 className="sidebar-section__title">
                      <Ruler size={18} />
                      Physical Stats
                    </h3>

                    <div className="settings-field">
                      <label className="settings-label">Height</label>
                    <div className="height-inputs">
                      <div className="input-with-unit">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={heightFeet}
                          onChange={(e) => setHeightFeet(Number(e.target.value))}
                          required
                          className="settings-input"
                        />
                        <span className="input-unit">ft</span>
                      </div>
                      <div className="input-with-unit">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={heightInches}
                          onChange={(e) => setHeightInches(Number(e.target.value))}
                          required
                          className="settings-input"
                        />
                        <span className="input-unit">in</span>
                      </div>
                    </div>
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">Weight</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        min="0"
                        value={weight}
                        onChange={(e) => setWeight(Number(e.target.value))}
                        required
                        className="settings-input"
                      />
                      <span className="input-unit">lbs</span>
                    </div>
                    </div>
                  </section>
                </aside>

                {/* Main Content */}
                <div className="settings-main-content">
                  {/* Nutrition Goals */}
                  <section className="settings-section">
                <div className="settings-section__header">
                  <div className="settings-section__icon settings-section__icon--nutrition">
                    <Target size={20} />
                  </div>
                  <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Daily Nutrition Goals</h2>
                    <span className="settings-section__desc">Set your target macros</span>
                  </div>
                </div>
                <div className="macro-goals">
                  <div className="macro-goal macro-goal--calories">
                    <div className="macro-goal__icon">
                      <Flame size={20} />
                    </div>
                    <label className="macro-goal__label">Calories</label>
                    <input
                      type="number"
                      min="0"
                      value={calorieGoal}
                      onChange={(e) => setCalorieGoal(Number(e.target.value))}
                      required
                      className="settings-input"
                    />
                    <span className="macro-goal__unit">kcal</span>
                  </div>
                  <div className="macro-goal macro-goal--protein">
                    <div className="macro-goal__icon">
                      <Beef size={20} />
                    </div>
                    <label className="macro-goal__label">Protein</label>
                    <input
                      type="number"
                      min="0"
                      value={proteinGoal}
                      onChange={(e) => setProteinGoal(Number(e.target.value))}
                      required
                      className="settings-input"
                    />
                    <span className="macro-goal__unit">g</span>
                  </div>
                  <div className="macro-goal macro-goal--carbs">
                    <div className="macro-goal__icon">
                      <Wheat size={20} />
                    </div>
                    <label className="macro-goal__label">Carbs</label>
                    <input
                      type="number"
                      min="0"
                      value={carbsGoal}
                      onChange={(e) => setCarbsGoal(Number(e.target.value))}
                      required
                      className="settings-input"
                    />
                    <span className="macro-goal__unit">g</span>
                  </div>
                  <div className="macro-goal macro-goal--fats">
                    <div className="macro-goal__icon">
                      <Droplets size={20} />
                    </div>
                    <label className="macro-goal__label">Fats</label>
                    <input
                      type="number"
                      min="0"
                      value={fatsGoal}
                      onChange={(e) => setFatsGoal(Number(e.target.value))}
                      required
                      className="settings-input"
                    />
                    <span className="macro-goal__unit">g</span>
                  </div>
                </div>
              </section>

              {/* Dietary Restrictions */}
              <section className="settings-section">
                <div className="settings-section__header">
                  <div className="settings-section__icon settings-section__icon--restrictions">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="settings-section__title-group">
                    <h2 className="settings-section__title">Dietary Restrictions</h2>
                    <span className="settings-section__desc">Select any that apply</span>
                  </div>
                </div>
                <div className="restriction-chips">
                  {availableRestrictions.map((restriction) => (
                    <button
                      key={restriction}
                      type="button"
                      className={`restriction-chip ${restrictions.includes(restriction) ? 'restriction-chip--active' : ''}`}
                      onClick={() => toggleRestriction(restriction)}
                    >
                      {restrictions.includes(restriction) && <Check size={14} />}
                      {restriction}
                    </button>
                  ))}
                </div>
                  </section>

                  {/* Submit Button */}
                  <div className="settings-actions">
                <button
                  type="submit"
                  disabled={saving}
                  className="settings-save-btn"
                >
                  {saving ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {profile ? 'Update Profile' : 'Create Profile'}
                    </>
                  )}
                </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
