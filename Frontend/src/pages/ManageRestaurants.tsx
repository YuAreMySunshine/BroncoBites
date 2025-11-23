import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Admin email is read from VITE_ADMIN_EMAIL environment variable
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

// Types aligned with Backend/models/Restaurant.js
type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

interface DayHours {
  open: string; // e.g., '08:00 AM'
  close: string; // e.g., '08:00 PM'
}

type HoursMap = Partial<Record<DayName, DayHours>>;

interface Nutrition {
  protein: number;
  carbs: number;
  fats: number;
}

interface MenuItem {
  itemName: string;
  calories: number;
  nutrition: Nutrition;
  vegetarian: boolean;
  allergens: string[];
}

interface Restaurant {
  _id: string; // MongoDB id
  name: string;
  menuItems: MenuItem[];
  hours?: HoursMap;
  isOpen?: boolean; // virtual
  createdAt?: string;
  updatedAt?: string;
}

// currency helper removed (not used)

function formatDate(iso?: string) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

// Convert 12-hour format (08:00 AM) to 24-hour format (08:00)
function convertTo24Hour(time12h: string): string {
  const [timeStr, modifier] = time12h.split(' ');
  let [hours, minutes] = timeStr.split(':');
  if (hours === '12') {
    hours = '00';
  }
  if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  if (hours.length === 1) {
    hours = '0' + hours;
  }
  return `${hours}:${minutes}`;
}

// Convert 24-hour format (20:00) to 12-hour format (08:00 PM)
function convertTo12Hour(time24h: string): string {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const modifier = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${modifier}`;
}

// Parse 12-hour time format to minutes since midnight
function parseTime(timeStr: string): number {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Get current Pacific Time
function getPacificTime(): Date {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utcTime - (8 * 3600000));
}

// Get status message based on current time and restaurant hours
function getStatusMessage(restaurant: Restaurant): string {
  const days: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pacificTime = getPacificTime();
  const dayName = days[pacificTime.getDay()];
  const hoursToday = restaurant.hours?.[dayName];
  
  if (!hoursToday) return 'Closed';
  if (hoursToday.open === hoursToday.close) return 'Closed today';
  
  const nowMinutes = pacificTime.getHours() * 60 + pacificTime.getMinutes();
  const openMinutes = parseTime(hoursToday.open);
  const closeMinutes = parseTime(hoursToday.close);
  
  return nowMinutes >= openMinutes && nowMinutes <= closeMinutes
    ? `Open until ${hoursToday.close}`
    : `Closed until ${hoursToday.open}`;
}

export default function ManageRestaurants() {
  const { user, isLoaded } = useUser();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({}); // per-restaurant save state
  const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>({}); // per-restaurant delete state
  const [addingItemMap, setAddingItemMap] = useState<Record<string, boolean>>({});

  // Prefer relative /api (uses Vite proxy in dev). Fall back to VITE_API_URL if explicitly set.
  const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

  // Wait for user data to load
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

  // Check if user is the admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Fetch restaurants from API
  useEffect(() => {
  fetch(`${API_BASE}/api/restaurants`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const restaurantList: Restaurant[] = Array.isArray(data) ? data : data.restaurants || [];
        setRestaurants(restaurantList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching restaurants:', err);
        setError(err.message || 'Failed to load restaurants');
        setLoading(false);
      });
  }, [API_BASE]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
  const res = await fetch(`${API_BASE}/api/restaurants`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const restaurantList: Restaurant[] = Array.isArray(data) ? data : data.restaurants || [];
      setRestaurants(restaurantList);
    } catch (e: any) {
      setError(e.message || 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  }

  // Create restaurant
  async function onCreateRestaurant(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
  const res = await fetch(`${API_BASE}/api/restaurants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (res.status === 409) {
        const body = await res.json();
        throw new Error(body?.error || 'Name must be unique');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewName('');
      await refresh();
    } catch (e: any) {
      alert(`Failed to create: ${e.message || e}`);
    } finally {
      setCreating(false);
    }
  }

  // Update restaurant name
  async function onUpdateRestaurant(id: string, patch: Partial<Restaurant>) {
    setSavingMap((m) => ({ ...m, [id]: true }));
    try {
  const res = await fetch(`${API_BASE}/api/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (res.status === 409) {
        const body = await res.json();
        throw new Error(body?.error || 'Name must be unique');
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      // Update local state without full refresh
      const updatedRestaurant = await res.json();
      setRestaurants(prev => prev.map(r => r._id === id ? { ...r, ...updatedRestaurant } : r));
    } catch (e: any) {
      alert(`Failed to update: ${e.message || e}`);
      await refresh(); // Only refresh on error
    } finally {
      setSavingMap((m) => ({ ...m, [id]: false }));
    }
  }

  // Delete restaurant
  async function onDeleteRestaurant(id: string) {
    if (!confirm('Delete this restaurant? This cannot be undone.')) return;
    setDeletingMap((m) => ({ ...m, [id]: true }));
    try {
  const res = await fetch(`${API_BASE}/api/restaurants/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: any) {
      alert(`Failed to delete: ${e.message || e}`);
    } finally {
      setDeletingMap((m) => ({ ...m, [id]: false }));
    }
  }

  // Add menu item
  async function onAddMenuItem(id: string, data: MenuItem) {
    setAddingItemMap((m) => ({ ...m, [id]: true }));
    try {
  const res = await fetch(`${API_BASE}/api/restaurants/${id}/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: any) {
      alert(`Failed to add item: ${e.message || e}`);
    } finally {
      setAddingItemMap((m) => ({ ...m, [id]: false }));
    }
  }

  // Update menu item
  async function onUpdateMenuItem(id: string, itemId: string, patch: Partial<MenuItem>) {
    setSavingMap((m) => ({ ...m, [`${id}:${itemId}`]: true }));
    try {
  const res = await fetch(`${API_BASE}/api/restaurants/${id}/menu-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: any) {
      alert(`Failed to update item: ${e.message || e}`);
    } finally {
      setSavingMap((m) => ({ ...m, [`${id}:${itemId}`]: false }));
    }
  }

  // Delete menu item
  async function onDeleteMenuItem(id: string, itemId: string) {
    if (!confirm('Delete this menu item?')) return;
    setDeletingMap((m) => ({ ...m, [`${id}:${itemId}`]: true }));
    try {
  const res = await fetch(`${API_BASE}/api/restaurants/${id}/menu-items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
    } catch (e: any) {
      alert(`Failed to delete item: ${e.message || e}`);
    } finally {
      setDeletingMap((m) => ({ ...m, [`${id}:${itemId}`]: false }));
    }
  }

  const totalMenuItems = useMemo(
    () => restaurants.reduce((sum, r) => sum + (Array.isArray(r.menuItems) ? r.menuItems.length : 0), 0),
    [restaurants]
  );

  const dayOrder: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="page">
      <Navbar />
      <main className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        <header className="page-header">
          <h1 className="page-title">Manage Restaurants</h1>
          <p className="page-subtitle">
            View every restaurant entry and all associated menu items
          </p>
          {/* Create */}
          <form onSubmit={onCreateRestaurant} style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New restaurant name"
              aria-label="New restaurant name"
              className="form-input"
              style={{ flex: '0 1 320px' }}
            />
            <button className="btn btn-primary" disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Add Restaurant'}
            </button>
          </form>
        </header>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ marginTop: 'var(--space-4)' }}>
            <strong>Error:</strong> {error}
            <button
              className="btn btn-primary"
              style={{ marginTop: 'var(--space-4)' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <h3 className="card-title">No restaurants found</h3>
            <p className="card-subtitle">The database doesn't contain any restaurant entries yet.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <>
            <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
              <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Total Restaurants: <span style={{ color: 'var(--color-primary)' }}>{restaurants.length}</span>
                <span style={{ marginLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                  Total Menu Items: <strong>{totalMenuItems}</strong>
                </span>
              </p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
              {restaurants.map((restaurant) => (
                <div key={restaurant._id} className="card" style={{ padding: 'var(--space-6)' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-4)' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <input
                          defaultValue={restaurant.name}
                          onBlur={(e) => {
                            const next = e.target.value.trim();
                            if (next && next !== restaurant.name) onUpdateRestaurant(restaurant._id, { name: next });
                          }}
                          aria-label="Restaurant name"
                          className="form-input"
                          style={{ fontSize: '1.25rem', fontWeight: 700, minWidth: 200 }}
                        />
                        {savingMap[restaurant._id] && <span style={{ color: 'var(--color-text-tertiary)' }}>Saving...</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>ID: {restaurant._id}</span>
                        {typeof restaurant.isOpen === 'boolean' && (
                          <span className={`badge ${restaurant.isOpen ? 'badge-open' : 'badge-closed'}`}>
                            {getStatusMessage(restaurant)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                      <div>Created: {formatDate(restaurant.createdAt)}</div>
                      <div>Updated: {formatDate(restaurant.updatedAt)}</div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <h4 style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Hours</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-3)' }}>
                      {dayOrder.map((day) => {
                        const slot = restaurant.hours?.[day];
                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, minWidth: '90px' }}>{day}</span>
                            <input
                              type="time"
                              defaultValue={slot?.open ? convertTo24Hour(slot.open) : '08:00'}
                              onBlur={(e) => {
                                const newOpen = convertTo12Hour(e.target.value);
                                const currentClose = slot?.close || '08:00 PM';
                                onUpdateRestaurant(restaurant._id, {
                                  hours: { ...restaurant.hours, [day]: { open: newOpen, close: currentClose } }
                                });
                              }}
                              className="form-input"
                              style={{ width: '110px', padding: 'var(--space-1) var(--space-2)' }}
                            />
                            <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                            <input
                              type="time"
                              defaultValue={slot?.close ? convertTo24Hour(slot.close) : '20:00'}
                              onBlur={(e) => {
                                const newClose = convertTo12Hour(e.target.value);
                                const currentOpen = slot?.open || '08:00 AM';
                                onUpdateRestaurant(restaurant._id, {
                                  hours: { ...restaurant.hours, [day]: { open: currentOpen, close: newClose } }
                                });
                              }}
                              className="form-input"
                              style={{ width: '110px', padding: 'var(--space-1) var(--space-2)' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                      <h4 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Menu Items ({restaurant.menuItems?.length || 0})</h4>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onAddMenuItem(restaurant._id, {
                          itemName: 'New Item',
                          calories: 0,
                          nutrition: { protein: 0, carbs: 0, fats: 0 },
                          vegetarian: false,
                          allergens: []
                        })}
                        disabled={!!addingItemMap[restaurant._id]}
                      >
                        {addingItemMap[restaurant._id] ? 'Adding...' : 'Add Item'}
                      </button>
                    </div>

                    {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Item</th>
                              <th>Calories</th>
                              <th>Protein (g)</th>
                              <th>Carbs (g)</th>
                              <th>Fats (g)</th>
                              <th>Vegetarian</th>
                              <th>Allergens</th>
                            </tr>
                          </thead>
                          <tbody>
                            {restaurant.menuItems.map((mi: any, i: number) => {
                              const itemId = mi._id || `${i}`;
                              const savingKey = `${restaurant._id}:${itemId}`;
                              return (
                                <tr key={`${restaurant._id}-mi-${itemId}`}>
                                  <td>
                                    <InlineEdit
                                      value={mi.itemName}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { itemName: v })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td>
                                    <InlineNumber
                                      value={mi.calories}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { calories: v })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td>
                                    <InlineNumber
                                      value={mi.nutrition?.protein}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { nutrition: { ...mi.nutrition, protein: v } })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td>
                                    <InlineNumber
                                      value={mi.nutrition?.carbs}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { nutrition: { ...mi.nutrition, carbs: v } })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td>
                                    <InlineNumber
                                      value={mi.nutrition?.fats}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { nutrition: { ...mi.nutrition, fats: v } })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td>
                                    <InlineCheckbox
                                      value={mi.vegetarian ?? false}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { vegetarian: v })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                      <InlineEdit
                                        value={Array.isArray(mi.allergens) ? mi.allergens.join(', ') : ''}
                                        onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { allergens: v.split(',').map(a => a.trim()).filter(a => a) })}
                                        saving={!!savingMap[savingKey]}
                                      />
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => onDeleteMenuItem(restaurant._id, itemId)}
                                        disabled={!!deletingMap[`${restaurant._id}:${itemId}`]}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-secondary)' }}>No menu items for this restaurant.</p>
                    )}
                  </div>

                  {/* Admin actions */}
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDeleteRestaurant(restaurant._id)}
                      disabled={!!deletingMap[restaurant._id]}
                    >
                      {deletingMap[restaurant._id] ? 'Deleting...' : 'Delete Restaurant'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

// Inline helper components
function InlineEdit({ value, onSave, saving }: { value: string; onSave: (v: string) => void; saving?: boolean }) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        const next = val.trim();
        if (next && next !== value) onSave(next);
      }}
      className="form-input"
      style={{ minWidth: 200 }}
      aria-label="Edit text"
      disabled={saving}
    />
  );
}

function InlineNumber({ value, onSave, saving }: { value?: number; onSave: (v: number) => void; saving?: boolean }) {
  const [val, setVal] = useState(value !== undefined && value !== 0 ? String(value) : '');
  useEffect(() => setVal(value !== undefined && value !== 0 ? String(value) : ''), [value]);
  return (
    <input
      type="text"
      value={val}
      onChange={(e) => {
        const input = e.target.value;
        // Only allow digits and decimal point
        if (input === '' || /^\d*\.?\d*$/.test(input)) {
          setVal(input);
        }
      }}
      onBlur={() => {
        const num = val === '' ? 0 : Number(val);
        if (!isNaN(num) && num >= 0) {
          onSave(num);
        }
      }}
      disabled={saving}
      placeholder="0"
      className="form-input"
      style={{ width: 80 }}
    />
  );
}

function InlineCheckbox({ value, onSave, saving }: { value: boolean; onSave: (v: boolean) => void; saving?: boolean }) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  return (
    <input
      type="checkbox"
      checked={val}
      onChange={(e) => {
        const newVal = e.target.checked;
        setVal(newVal);
        onSave(newVal);
      }}
      disabled={saving}
      className="form-checkbox"
    />
  );
}



