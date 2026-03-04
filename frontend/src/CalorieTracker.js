import React, { useState, useEffect } from "react";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import API_BASE from "./utils/api";
import "react-circular-progressbar/dist/styles.css";

function MacroBar({ label, current, goal, color, glowClass }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-text-muted">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {Math.round(current)}g <span className="text-text-muted font-normal">/ {goal}g</span>
        </span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${glowClass}`}
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
    </div>
  );
}

function CalorieTracker() {
  const [foodList, setFoodList] = useState([]);
  const [eatenFoods, setEatenFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState("");
  const [weight, setWeight] = useState(100);
  const [macros, setMacros] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [goal, setGoal] = useState({ goal_calories: 2000, goal_protein: 150, goal_carbs: 250, goal_fats: 45 });
  const [weightError, setWeightError] = useState('');
  const [availableIngredients, setAvailableIngredients] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allEatenFoods, setAllEatenFoods] = useState([]);

  const handleWeightChange = (e) => {
    setWeight(parseInt(e.target.value, 10));
    setWeightError('');
  };

  const isMatchingDate = (timestamp) => {
    const date = new Date(timestamp);
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsResponse, eatenResponse, settingsResponse, availableResponse] = await Promise.all([
          fetch(`${API_BASE}/items/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/eaten-food/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/user-settings/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/available-ingredients/`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const [items, eatenData, userSettings, available] = await Promise.all([
          itemsResponse.json(), eatenResponse.json(), settingsResponse.json(), availableResponse.json()
        ]);
        const safeItems = Array.isArray(items) ? items : [];
        const safeEaten = Array.isArray(eatenData) ? eatenData : [];
        setFoodList(safeItems);
        setGoal(userSettings);
        setAvailableIngredients(available);
        setAllEatenFoods(safeEaten);
        setEatenFoods(processEatenFoodsWith(safeEaten, safeItems, selectedDate));
      } catch (err) {
        console.error('Error fetching data:', err);
        setEatenFoods([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processEatenFoodsWith = (eatenData, items, date) => {
    return eatenData
      .filter(entry => {
        const d = new Date(entry.timestamp);
        const s = new Date(date);
        return d.toDateString() === s.toDateString();
      })
      .map(entry => ({
        action_id: entry.action_id,
        item: items.find(item => item.item_id === entry.item_id),
        quantity: entry.quantity,
        timestamp: entry.timestamp
      }))
      .filter(entry => entry.item);
  };

  useEffect(() => {
    if (allEatenFoods.length > 0) {
      setEatenFoods(processEatenFoodsWith(allEatenFoods, foodList, selectedDate));
    }
  }, [selectedDate, allEatenFoods]);

  const calculateItemMacros = (item, quantity) => {
    const ratio = quantity / item.serving_weight;
    return {
      calories: item.calories * ratio,
      protein: item.protein * ratio,
      carbs: (item.carbs_sugar + item.carbs_fiber + item.carbs_starch) * ratio,
      fats: (item.fats_saturated + item.fats_unsaturated) * ratio
    };
  };

  useEffect(() => {
    if (!Array.isArray(eatenFoods) || eatenFoods.length === 0) {
      setMacros({ calories: 0, protein: 0, carbs: 0, fats: 0 });
      return;
    }
    try {
      const totals = eatenFoods.reduce((sum, entry) => {
        if (!entry?.item) return sum;
        const m = calculateItemMacros(entry.item, entry.quantity);
        return {
          calories: sum.calories + (m.calories || 0),
          protein: sum.protein + (m.protein || 0),
          carbs: sum.carbs + (m.carbs || 0),
          fats: sum.fats + (m.fats || 0)
        };
      }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setMacros(totals);
    } catch (error) {
      setMacros({ calories: 0, protein: 0, carbs: 0, fats: 0 });
    }
  }, [eatenFoods]);

  const handleAddFood = () => {
    if (isNaN(weight) || weight <= 0) {
      setWeightError('Weight must be a positive number');
      return;
    }
    const food = foodList.find((item) => item.item_id === parseInt(selectedFood));
    if (food) {
      const availableAmount = availableIngredients[food.item_id] || 0;
      if (availableAmount < weight) {
        alert(`Not enough ${food.name} available. You only have ${availableAmount}g.`);
        return;
      }
      const token = localStorage.getItem('token');
      fetch(`${API_BASE}/actions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ item: food.item_id, ingredient: food.item_id, action_type: "EAT", quantity: weight, timestamp: selectedDate }),
      })
        .then(response => response.json())
        .then(() => {
          setAllEatenFoods(prev => [...prev, { item_id: food.item_id, quantity: weight, timestamp: new Date().toISOString() }]);
          setAvailableIngredients(prev => ({ ...prev, [food.item_id]: prev[food.item_id] - weight }));
          setWeightError('');
          setSelectedFood("");
          setWeight(100);
        })
        .catch(() => alert("Failed to add food"));
    }
  };

  const handleRemoveFood = async (actionId, itemId, quantity) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/actions/${actionId}/`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to remove food');
      setAllEatenFoods(prev => prev.filter(food => food.action_id !== actionId));
      setAvailableIngredients(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + quantity }));
    } catch (error) {
      alert("Failed to remove food");
    }
  };

  const changeDate = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const caloriePct = Math.min((macros.calories / goal.goal_calories) * 100, 100);
  const safeEatenFoods = Array.isArray(eatenFoods) ? eatenFoods : [];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Navigation Header */}
          <div className="card p-5 flex items-center justify-between">
            <button
              onClick={() => changeDate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all duration-200"
            >
              ←
            </button>
            <div className="text-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={today}
                className="bg-transparent text-white font-semibold text-lg text-center focus:outline-none cursor-pointer"
              />
              <p className="text-text-muted text-xs mt-0.5">
                {selectedDate === today ? "Today" : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              disabled={selectedDate >= today}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>

          {/* Calorie Circle + Macro Bars */}
          <div className="card p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circular Progress */}
              <div className="relative flex-shrink-0">
                <div className="w-44 h-44" style={{ filter: 'drop-shadow(0 0 16px rgba(76, 175, 80, 0.5))' }}>
                  <CircularProgressbar
                    value={caloriePct}
                    text={`${Math.round(macros.calories)}`}
                    styles={buildStyles({
                      pathColor: "#4CAF50",
                      textColor: "#ffffff",
                      trailColor: "rgba(255,255,255,0.05)",
                      textSize: "18px",
                      strokeLinecap: "round",
                    })}
                  />
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-xs text-text-muted">/ {goal.goal_calories} kcal</span>
                </div>
              </div>

              {/* Macro Bars */}
              <div className="flex-1 w-full space-y-4">
                <MacroBar label="Protein" current={macros.protein} goal={goal.goal_protein} color="#FF6B6B" />
                <MacroBar label="Carbs" current={macros.carbs} goal={goal.goal_carbs} color="#4ECDC4" />
                <MacroBar label="Fats" current={macros.fats} goal={goal.goal_fats} color="#FFD93D" />
              </div>
            </div>
          </div>

          {/* Add Food Section */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-4">Add Food</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedFood}
                onChange={(e) => setSelectedFood(e.target.value)}
                className="input-dark flex-1"
              >
                <option value="" disabled>Select Food</option>
                {foodList
                  .filter(food => (availableIngredients[food.item_id] || 0) > 0)
                  .map((food) => (
                    <option key={food.item_id} value={food.item_id} className="bg-surface-start">
                      {food.name} ({availableIngredients[food.item_id]}g available)
                    </option>
                  ))}
              </select>
              <div className="flex flex-col">
                <input
                  type="number"
                  value={weight}
                  onChange={handleWeightChange}
                  min="1"
                  step="1"
                  placeholder="Weight (g)"
                  className={`input-dark w-32 ${weightError ? 'border-accent-red' : ''}`}
                />
                {weightError && (
                  <span className="text-accent-red text-xs mt-1">{weightError}</span>
                )}
              </div>
              <button onClick={handleAddFood} className="btn-primary">
                Add
              </button>
            </div>
          </div>

          {/* Consumed Foods */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3">Consumed Today</h2>
            {safeEatenFoods.length === 0 ? (
              <div className="card p-8 text-center text-text-muted">
                No foods logged yet. Add some above!
              </div>
            ) : (
              <div className="space-y-3">
                {safeEatenFoods.map((entry) => {
                  if (!entry?.item) return null;
                  const m = calculateItemMacros(entry.item, entry.quantity);
                  return (
                    <div
                      key={entry.action_id}
                      className="card p-4 flex items-center justify-between hover:scale-[1.01] transition-transform duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">{entry.item.name}</span>
                          <span className="text-text-muted text-sm">{entry.quantity}g</span>
                          <span className="text-xs text-text-muted ml-auto">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="pill bg-accent-green/15 text-accent-green">
                            {Math.round(m.calories)} kcal
                          </span>
                          <span className="pill bg-accent-red/15 text-accent-red">
                            P {Math.round(m.protein)}g
                          </span>
                          <span className="pill bg-accent-teal/15 text-accent-teal">
                            C {Math.round(m.carbs)}g
                          </span>
                          <span className="pill bg-accent-yellow/15 text-accent-yellow">
                            F {Math.round(m.fats)}g
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFood(entry.action_id, entry.item.item_id, entry.quantity)}
                        className="ml-4 w-8 h-8 flex items-center justify-center rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-white transition-all duration-200 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalorieTracker;
