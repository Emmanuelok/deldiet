const compactDrinks = new Set(["Espresso", "Doppio", "Ristretto", "Macchiato", "Affogato", "Espresso con Panna"]);

// Navigation follows recipe prerequisites, so editing a previous step never traps a guest.
export function canVisitOriginBarStep(step, selection, submitting = false) {
  if (submitting || !Number.isInteger(step) || step < 0 || step > 6) return false;
  if (step <= 1) return true;
  if (!selection.origin) return false;
  return step === 2 || Boolean(selection.drink);
}

// Manual drink choices and Taste Match must begin with the same compatible recipe.
export function getDrinkDefaults(drink, previous, extractions) {
  return {
    drink,
    extraShots: 0,
    temp: drink.fam === "cold" || drink.iced ? "Iced" : drink.fam === "blended" ? "Blended" : "Hot",
    size: compactDrinks.has(drink.n) ? "seed" : previous.size,
    extraction: extractions[drink.fam][0],
    milk: drink.milk ? (previous.milkTouched ? previous.milk : "Organic whole") : "None — black",
    safetyAck: false,
  };
}
