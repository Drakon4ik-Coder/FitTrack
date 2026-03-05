import React, { useState, useEffect } from "react";
import { useAuth } from './AuthContext';
import API_BASE from './utils/api';
import { useNavigate } from 'react-router-dom';

const goalCards = [
  { key: 'goal_calories', label: 'Daily Calories', unit: 'kcal', color: '#4CAF50', bg: 'bg-accent-green/10', border: 'border-accent-green/20', icon: '🔥' },
  { key: 'goal_protein', label: 'Daily Protein', unit: 'g', color: '#FF6B6B', bg: 'bg-accent-red/10', border: 'border-accent-red/20', icon: '🥩' },
  { key: 'goal_carbs', label: 'Daily Carbs', unit: 'g', color: '#4ECDC4', bg: 'bg-accent-teal/10', border: 'border-accent-teal/20', icon: '🌾' },
  { key: 'goal_fats', label: 'Daily Fats', unit: 'g', color: '#FFD93D', bg: 'bg-accent-yellow/10', border: 'border-accent-yellow/20', icon: '🥑' },
];

function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tempGoals, setTempGoals] = useState({
    goal_calories: 2000, goal_protein: 150, goal_carbs: 250, goal_fats: 45
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_BASE}/user-settings/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(settings => { setTempGoals(settings); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateGoals = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/user-settings/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(tempGoals)
      });
      if (!response.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert('Failed to update goals');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Nutrition Goals</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {goalCards.map(({ key, label, unit, color, bg, border, icon }) => (
          <div key={key} className={`card p-5 ${bg} border ${border}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-semibold text-text-muted">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <input
                type="number"
                value={tempGoals[key]}
                onChange={(e) => setTempGoals(prev => ({ ...prev, [key]: parseInt(e.target.value, 10) }))}
                className="bg-transparent border-0 border-b-2 text-3xl font-bold focus:outline-none w-full transition-colors duration-200"
                style={{ color, borderColor: `${color}40` }}
              />
              <span className="text-text-muted text-sm font-medium">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleUpdateGoals}
          className={`btn-green flex-1 transition-all ${saved ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' : ''}`}
        >
          {saved ? '✓ Saved!' : 'Update Goals'}
        </button>
        <button onClick={handleLogout} className="btn-ghost-red px-6 py-3">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;
