import React, { useState, useEffect } from "react";
import API_BASE from "./utils/api";

function Pantry() {
  const [foodList, setFoodList] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState({});
  const [selectedFood, setSelectedFood] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [selectedMealRecipe, setSelectedMealRecipe] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [adjustedQuantities, setAdjustedQuantities] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsResponse, availableResponse, recipesResponse] = await Promise.all([
          fetch(`${API_BASE}/items/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/available-ingredients/`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/recipes/`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const [items, available, recipeData] = await Promise.all([
          itemsResponse.json(), availableResponse.json(), recipesResponse.json()
        ]);
        setFoodList(items); setAvailableIngredients(available); setRecipes(recipeData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedFood) {
      const selectedItem = foodList.find(item => item.item_id === parseInt(selectedFood));
      if (selectedItem?.is_meal) {
        const mealRecipes = recipes.filter(r => r.meal === selectedItem.item_id);
        setSelectedMealRecipe(mealRecipes);
        setRecipeIngredients(mealRecipes.map(recipe => ({ ...recipe, available: availableIngredients[recipe.ingredient] || 0 })));
        setAdjustedQuantities(mealRecipes.reduce((acc, recipe) => ({ ...acc, [recipe.ingredient]: recipe.quantity }), {}));
      } else {
        setSelectedMealRecipe(null); setRecipeIngredients([]);
      }
    }
  }, [selectedFood, foodList, recipes, availableIngredients]);

  const handleAddToPantry = () => {
    const token = localStorage.getItem('token');
    const food = foodList.find((item) => item.item_id === parseInt(selectedFood));
    if (food) {
      fetch(`${API_BASE}/actions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ item: food.item_id, ingredient: food.item_id, action_type: "ADD", quantity }),
      })
        .then(r => r.json())
        .then(() => setAvailableIngredients(prev => ({ ...prev, [food.item_id]: (prev[food.item_id] || 0) + quantity })))
        .catch(err => console.error("Error adding to pantry:", err));
    }
  };

  const handleDisposeFromPantry = () => {
    const token = localStorage.getItem('token');
    const food = foodList.find((item) => item.item_id === parseInt(selectedFood));
    if (food && availableIngredients[food.item_id] >= quantity) {
      fetch(`${API_BASE}/actions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ item: food.item_id, ingredient: food.item_id, action_type: "DISPOSE", quantity }),
      })
        .then(r => r.json())
        .then(() => setAvailableIngredients(prev => ({ ...prev, [food.item_id]: prev[food.item_id] - quantity })))
        .catch(err => console.error("Error disposing:", err));
    }
  };

  const handleCookMeal = async () => {
    const token = localStorage.getItem('token');
    const food = foodList.find((item) => item.item_id === parseInt(selectedFood));
    if (food && food.is_meal) {
      try {
        for (const recipe of recipeIngredients) {
          if (availableIngredients[recipe.ingredient] < adjustedQuantities[recipe.ingredient]) {
            throw new Error(`Insufficient quantity of ingredient`);
          }
          await fetch(`${API_BASE}/actions/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ item: food.item_id, ingredient: recipe.ingredient, action_type: "COOK", quantity: adjustedQuantities[recipe.ingredient] }),
          });
        }
        setAvailableIngredients(prev => {
          const updated = { ...prev };
          for (const recipe of recipeIngredients) {
            updated[recipe.ingredient] -= adjustedQuantities[recipe.ingredient];
          }
          return updated;
        });
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const fetchRecommendations = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/meal-recommendations/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 204) {
        setRecommendations([]); setShowRecommendations(true); return;
      }
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data); setShowRecommendations(true);
    } catch (error) {
      alert('Failed to get meal recommendations');
    }
  };

  const availableItems = Object.entries(availableIngredients).filter(([, amt]) => amt > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-accent-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Pantry</h1>
        <button
          onClick={fetchRecommendations}
          className="bg-gradient-to-r from-accent-yellow to-orange-400 text-app font-bold px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-glow-yellow cursor-pointer border-0 flex items-center gap-2"
        >
          <span>🔥</span> Get Recommendations
        </button>
      </div>

      {/* Recommendations */}
      {showRecommendations && (
        <div className="card p-5">
          <h2 className="text-lg font-bold text-white mb-4">Recommended Meals</h2>
          {recommendations.length === 0 ? (
            <p className="text-text-muted">No recommendations available right now.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recommendations.map(meal => (
                <div
                  key={meal.item_id}
                  className="flex-shrink-0 w-56 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-accent-teal/50 transition-all duration-200"
                >
                  <h3 className="font-bold text-white mb-2 truncate">{meal.name}</h3>
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Calories</span>
                      <span className="text-accent-green font-semibold">{Math.round(meal.calories)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Protein</span>
                      <span className="text-accent-red font-semibold">{Math.round(meal.protein)}g</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Carbs</span>
                      <span className="text-accent-teal font-semibold">{Math.round(meal.carbs_sugar + meal.carbs_fiber + meal.carbs_starch)}g</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Fats</span>
                      <span className="text-accent-yellow font-semibold">{Math.round(meal.fats_saturated + meal.fats_unsaturated)}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedFood(meal.item_id.toString()); setShowRecommendations(false); }}
                    className="w-full bg-accent-teal/20 text-accent-teal text-sm font-semibold py-2 rounded-lg hover:bg-accent-teal hover:text-app transition-all duration-200 border-0 cursor-pointer"
                  >
                    Cook This
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pantry Action */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Manage Pantry</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            value={selectedFood}
            onChange={(e) => setSelectedFood(e.target.value)}
            className="input-dark flex-1"
          >
            <option value="" disabled>Select Food</option>
            {foodList.map((food) => (
              <option key={food.item_id} value={food.item_id} className="bg-surface-start">
                {food.name} {food.is_meal ? "(Meal)" : ""}
              </option>
            ))}
          </select>

          {!selectedMealRecipe && (
            <>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                min="1"
                step="1"
                className="input-dark w-28"
                placeholder="Amount (g)"
              />
              <button onClick={handleAddToPantry} className="btn-green">Add</button>
              <button
                onClick={handleDisposeFromPantry}
                disabled={!selectedFood || !availableIngredients[selectedFood] || availableIngredients[parseInt(selectedFood)] < quantity}
                className="btn-ghost-red disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Dispose
              </button>
            </>
          )}
        </div>

        {/* Meal cooking interface */}
        {selectedMealRecipe && recipeIngredients.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">Recipe Ingredients</h3>
            <div className="space-y-3">
              {recipeIngredients.map(recipe => {
                const ingName = foodList.find(f => f.item_id === recipe.ingredient)?.name || 'Unknown';
                const pct = Math.min((adjustedQuantities[recipe.ingredient] / recipe.available) * 100, 100);
                return (
                  <div key={recipe.ingredient} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-sm text-white flex-1">{ingName}</span>
                    <input
                      type="number"
                      value={adjustedQuantities[recipe.ingredient]}
                      onChange={(e) => setAdjustedQuantities(prev => ({ ...prev, [recipe.ingredient]: Number(e.target.value) }))}
                      min="0"
                      max={recipe.available}
                      className="input-dark text-sm w-24 py-1.5"
                    />
                    <span className="text-xs text-text-muted w-24 text-right">
                      {recipe.available}g avail
                    </span>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-teal rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleCookMeal}
              disabled={recipeIngredients.some(recipe => recipe.available < adjustedQuantities[recipe.ingredient])}
              className="btn-green mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cook Meal
            </button>
          </div>
        )}
      </div>

      {/* Available Ingredients Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">
          Available Ingredients <span className="text-text-muted text-sm font-normal">({availableItems.length})</span>
        </h2>
        {availableItems.length === 0 ? (
          <div className="card p-8 text-center text-text-muted">
            Your pantry is empty. Add some ingredients above!
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {availableItems.map(([itemId, amount]) => {
              const food = foodList.find(f => f.item_id === parseInt(itemId));
              if (!food) return null;
              return (
                <div
                  key={itemId}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-accent-teal/50 transition-all duration-200"
                >
                  <span className="text-sm font-medium text-white">{food.name}</span>
                  <span className="text-xs font-bold text-accent-teal">{amount}g</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pantry;
