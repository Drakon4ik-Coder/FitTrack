import { useState, useEffect } from "react";
import API_BASE from "./utils/api";

function FoodListManager() {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [servingWeight, setServingWeight] = useState("");
  const [isMeal, setIsMeal] = useState(false);
  const [protein, setProtein] = useState("");
  const [fatsSaturated, setFatsSaturated] = useState("");
  const [fatsUnsaturated, setFatsUnsaturated] = useState("");
  const [carbsSugar, setCarbsSugar] = useState("");
  const [carbsFiber, setCarbsFiber] = useState("");
  const [carbsStarch, setCarbsStarch] = useState("");
  const [foodList, setFoodList] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("g");
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    Promise.all([
      fetch(`${API_BASE}/items/`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE}/recipes/`, { headers: { 'Authorization': `Bearer ${token}` } })
    ])
      .then(([itemsRes, recipesRes]) => Promise.all([itemsRes.json(), recipesRes.json()]))
      .then(([items]) => setFoodList(items))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleAddFood = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isMeal && ingredients.length > 0) {
        const mealResponse = await fetch(`${API_BASE}/items/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            name: foodName, is_meal: true,
            serving_weight: ingredients.reduce((sum, ing) => sum + ing.quantity, 0),
            calories: 0, protein: 0, fats_saturated: 0, fats_unsaturated: 0, carbs_sugar: 0, carbs_fiber: 0, carbs_starch: 0
          }),
        });
        const newMeal = await mealResponse.json();
        for (const ingredient of ingredients) {
          await fetch(`${API_BASE}/recipes/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ meal: newMeal.item_id, ingredient: ingredient.ingredientId, quantity: ingredient.quantity }),
          });
        }
        setFoodList(prev => [...prev, newMeal]);
      } else {
        const itemResponse = await fetch(`${API_BASE}/items/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            name: foodName, is_meal: false,
            calories: Number(calories), serving_weight: Number(servingWeight),
            protein: Number(protein), fats_saturated: Number(fatsSaturated), fats_unsaturated: Number(fatsUnsaturated),
            carbs_sugar: Number(carbsSugar), carbs_fiber: Number(carbsFiber), carbs_starch: Number(carbsStarch)
          }),
        });
        const newItem = await itemResponse.json();
        setFoodList(prev => [...prev, newItem]);
      }
      setFoodName(""); setCalories(""); setServingWeight(""); setProtein("");
      setFatsSaturated(""); setFatsUnsaturated(""); setCarbsSugar(""); setCarbsFiber(""); setCarbsStarch("");
      setIsMeal(false); setIngredients([]);
    } catch (error) {
      console.error("Error adding food:", error);
    }
  };

  const handleAddIngredient = () => {
    if (selectedIngredient && ingredientQuantity) {
      const ingredient = foodList.find(f => f.item_id === parseInt(selectedIngredient));
      setIngredients(prev => [...prev, {
        ingredientId: ingredient.item_id, name: ingredient.name,
        quantity: parseFloat(ingredientQuantity), unit: ingredientUnit
      }]);
      setSelectedIngredient(""); setIngredientQuantity("");
    }
  };

  const fieldClass = "input-dark text-sm";
  const labelClass = "label-text";

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Foods</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Add New Food</h2>
          <form onSubmit={handleAddFood} className="space-y-4">
            <div>
              <label className={labelClass}>Food Name</label>
              <input type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} required className={fieldClass} placeholder="e.g. Chicken Breast" />
            </div>

            {/* Is Meal Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm font-medium text-white">Is Meal / Recipe</span>
              <button
                type="button"
                onClick={() => setIsMeal(!isMeal)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isMeal ? 'bg-accent-teal' : 'bg-white/10'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isMeal ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {!isMeal && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Calories (kcal)</label>
                    <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} required className={fieldClass} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Serving Weight (g)</label>
                    <input type="number" value={servingWeight} onChange={(e) => setServingWeight(e.target.value)} required className={fieldClass} placeholder="100" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Protein (g)</label>
                  <input type="number" step="0.1" value={protein} onChange={(e) => setProtein(e.target.value)} required className={fieldClass} placeholder="0.0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Saturated Fats (g)</label>
                    <input type="number" step="0.1" value={fatsSaturated} onChange={(e) => setFatsSaturated(e.target.value)} required className={fieldClass} placeholder="0.0" />
                  </div>
                  <div>
                    <label className={labelClass}>Unsaturated Fats (g)</label>
                    <input type="number" step="0.1" value={fatsUnsaturated} onChange={(e) => setFatsUnsaturated(e.target.value)} required className={fieldClass} placeholder="0.0" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Sugar (g)</label>
                    <input type="number" step="0.1" value={carbsSugar} onChange={(e) => setCarbsSugar(e.target.value)} required className={fieldClass} placeholder="0.0" />
                  </div>
                  <div>
                    <label className={labelClass}>Fiber (g)</label>
                    <input type="number" step="0.1" value={carbsFiber} onChange={(e) => setCarbsFiber(e.target.value)} required className={fieldClass} placeholder="0.0" />
                  </div>
                  <div>
                    <label className={labelClass}>Starch (g)</label>
                    <input type="number" step="0.1" value={carbsStarch} onChange={(e) => setCarbsStarch(e.target.value)} required className={fieldClass} placeholder="0.0" />
                  </div>
                </div>
              </>
            )}

            {isMeal && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Ingredients</h3>
                <div className="flex gap-2">
                  <select value={selectedIngredient} onChange={(e) => setSelectedIngredient(e.target.value)} className="input-dark text-sm flex-1">
                    <option value="">Select Ingredient</option>
                    {foodList.filter(f => !f.is_meal).map((food) => (
                      <option key={food.item_id} value={food.item_id} className="bg-surface-start">{food.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={ingredientQuantity}
                    onChange={(e) => setIngredientQuantity(e.target.value)}
                    placeholder="qty"
                    className="input-dark text-sm w-20"
                  />
                  <input
                    type="text"
                    value={ingredientUnit}
                    onChange={(e) => setIngredientUnit(e.target.value)}
                    placeholder="g"
                    className="input-dark text-sm w-14"
                  />
                  <button type="button" onClick={handleAddIngredient} className="btn-primary px-3 py-2 text-sm">+</button>
                </div>
                {ingredients.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-sm text-white">{ing.name}</span>
                        <span className="text-sm text-text-muted">{ing.quantity}{ing.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn-green w-full mt-2">
              Save Food
            </button>
          </form>
        </div>

        {/* Food List Panel */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Your Foods <span className="text-text-muted text-sm font-normal">({foodList.length})</span></h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {foodList.map((food) => (
              <div
                key={food.item_id}
                className="card p-4 hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-white">{food.name}</span>
                  {food.is_meal && (
                    <span className="pill bg-accent-teal/15 text-accent-teal ml-2">Meal</span>
                  )}
                </div>
                {!food.is_meal && (
                  <div className="flex flex-wrap gap-2">
                    <span className="pill bg-accent-green/15 text-accent-green">{food.calories} kcal</span>
                    <span className="pill bg-white/5 text-text-muted">{food.serving_weight}g serving</span>
                    <span className="pill bg-accent-red/15 text-accent-red">P {food.protein}g</span>
                    <span className="pill bg-accent-teal/15 text-accent-teal">
                      C {(food.carbs_sugar + food.carbs_fiber + food.carbs_starch).toFixed(1)}g
                    </span>
                    <span className="pill bg-accent-yellow/15 text-accent-yellow">
                      F {(food.fats_saturated + food.fats_unsaturated).toFixed(1)}g
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodListManager;
