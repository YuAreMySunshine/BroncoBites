import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import '../style/home/Home.css';
import Navbar from '../components/Navbar';

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
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Beverage';
  price: number;
  nutrition: Nutrition;
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
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
      await refresh();
    } catch (e: any) {
      alert(`Failed to update: ${e.message || e}`);
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
    <div className="bb">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text)' }}>Manage Restaurants</h1>
        <p style={{ color: 'var(--text-muted, #b7c2d6)' }}>
          View every restaurant entry and all associated menu items
        </p>
        {/* Create */}
        <form onSubmit={onCreateRestaurant} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New restaurant name"
            aria-label="New restaurant name"
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', flex: '0 1 320px' }}
          />
          <button className="btn primary" disabled={creating || !newName.trim()}>
            {creating ? 'Creating...' : 'Add Restaurant'}
          </button>
        </form>
      </header>

      <main>
        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading restaurants...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ padding: '2rem', border: '2px solid #ff4444' }}>
            <h3 style={{ color: '#ff4444', marginTop: 0 }}>Error</h3>
            <p>{error}</p>
            <button
              className="btn primary"
              style={{ marginTop: '1rem' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No restaurants found</h3>
            <p style={{ color: 'var(--text-muted, #b7c2d6)' }}>The database doesn't contain any restaurant entries yet.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: '600' }}>
                Total Restaurants: <span style={{ color: '#605bfd' }}>{restaurants.length}</span>
                <span style={{ marginLeft: '1rem', color: '#555', fontWeight: 400 }}>
                  Total Menu Items: <strong>{totalMenuItems}</strong>
                </span>
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {restaurants.map((restaurant) => (
                <div key={restaurant._id} className="card" style={{ padding: '1.5rem' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input
                          defaultValue={restaurant.name}
                          onBlur={(e) => {
                            const next = e.target.value.trim();
                            if (next && next !== restaurant.name) onUpdateRestaurant(restaurant._id, { name: next });
                          }}
                          aria-label="Restaurant name"
                          style={{ fontSize: '1.25rem', fontWeight: 700, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderRadius: 6, padding: '0.25rem 0.5rem', minWidth: 200 }}
                        />
                        {savingMap[restaurant._id] && <span style={{ color: '#999' }}>Saving...</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: '#999' }}>ID: {restaurant._id}</span>
                        {typeof restaurant.isOpen === 'boolean' && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              background: restaurant.isOpen ? '#e8f5e9' : '#ffebee',
                              color: restaurant.isOpen ? '#2e7d32' : '#c62828',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            {restaurant.isOpen ? 'Open now' : 'Closed'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', color: '#777', fontSize: '0.85rem' }}>
                      <div>Created: {formatDate(restaurant.createdAt)}</div>
                      <div>Updated: {formatDate(restaurant.updatedAt)}</div>
                    </div>
                  </div>

                  {/* Hours */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>Hours</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
                      {dayOrder.map((day) => {
                        const slot = restaurant.hours?.[day];
                        return (
                          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }}>
                            <span style={{ color: 'var(--text)', fontWeight: 500, minWidth: '90px' }}>{day}</span>
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
                              style={{ border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderRadius: 4, padding: '0.25rem 0.5rem', width: '110px' }}
                            />
                            <span style={{ color: 'var(--text-muted, #b7c2d6)' }}>—</span>
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
                              style={{ border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderRadius: 4, padding: '0.25rem 0.5rem', width: '110px' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0 }}>Menu Items ({restaurant.menuItems?.length || 0})</h4>
                      <button
                        className="btn primary"
                        onClick={() => onAddMenuItem(restaurant._id, {
                          itemName: 'New Item',
                          category: 'Lunch',
                          price: 0,
                          nutrition: { protein: 0, carbs: 0, fats: 0 }
                        })}
                        disabled={!!addingItemMap[restaurant._id]}
                        style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                      >
                        {addingItemMap[restaurant._id] ? 'Adding...' : 'Add Item'}
                      </button>
                    </div>

                    {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
                      <div className="table-container">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.05)' }}>
                              <th style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Item</th>
                              <th style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Category</th>
                              <th style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Price ($)</th>
                              <th style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Protein (g)</th>
                              <th style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Carbs (g)</th>
                              <th style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Fats (g)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {restaurant.menuItems.map((mi: any, i: number) => {
                              const itemId = mi._id || `${i}`;
                              const savingKey = `${restaurant._id}:${itemId}`;
                              return (
                                <tr key={`${restaurant._id}-mi-${itemId}`}>
                                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f1f1' }}>
                                    <InlineEdit
                                      value={mi.itemName}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { itemName: v })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f1f1' }}>
                                    <InlineSelect
                                      value={mi.category}
                                      options={['Breakfast','Lunch','Dinner','Snack','Beverage']}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { category: v as MenuItem['category'] })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f1f1' }}>
                                    <InlineNumber
                                      value={mi.price}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { price: v })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f1f1' }}>
                                    <InlineNumber
                                      value={mi.nutrition?.protein}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { nutrition: { ...mi.nutrition, protein: v } })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f1f1' }}>
                                    <InlineNumber
                                      value={mi.nutrition?.carbs}
                                      onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { nutrition: { ...mi.nutrition, carbs: v } })}
                                      saving={!!savingMap[savingKey]}
                                    />
                                  </td>
                                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f1f1' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <InlineNumber
                                        value={mi.nutrition?.fats}
                                        onSave={(v) => onUpdateMenuItem(restaurant._id, itemId, { nutrition: { ...mi.nutrition, fats: v } })}
                                        saving={!!savingMap[savingKey]}
                                      />
                                      <button
                                        className="btn"
                                        style={{ background: '#ffebee', color: '#c62828' }}
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
                      <p style={{ color: 'var(--text-muted, #b7c2d6)' }}>No menu items for this restaurant.</p>
                    )}
                  </div>

                  {/* Admin actions */}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn"
                      style={{ fontSize: '0.9rem', background: '#ffebee', color: '#c62828' }}
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
      </div>
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
      style={{ border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderRadius: 6, padding: '0.25rem 0.5rem', minWidth: 180 }}
      aria-label="Edit text"
      disabled={saving}
    />
  );
}

function InlineSelect({ value, onSave, options, saving }: { value: string; onSave: (v: string) => void; options: string[]; saving?: boolean }) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);
  return (
    <select
      value={val}
      onChange={(e) => {
        const v = e.target.value;
        setVal(v);
        if (v !== value) onSave(v);
      }}
      disabled={saving}
      style={{ border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderRadius: 6, padding: '0.25rem 0.5rem' }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function InlineNumber({ value, onSave, saving }: { value?: number; onSave: (v: number) => void; saving?: boolean }) {
  const [val, setVal] = useState(value ?? 0);
  useEffect(() => setVal(value ?? 0), [value]);
  return (
    <input
      type="number"
      value={Number.isFinite(val) ? val : 0}
      min={0}
      step={1}
      onChange={(e) => setVal(Number(e.target.value))}
      onBlur={() => onSave(Number(val))}
      disabled={saving}
      style={{ width: 90, border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text)', borderRadius: 6, padding: '0.25rem 0.5rem' }}
    />
  );
}


