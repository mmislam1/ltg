

export interface IdealNutritionState {
  macros: {
    protein: number; // grams
    carbs: number; // grams
    fats: number; // grams
    energy: number; // kcal
  };
  vitamins: {
    b1: number; // mg (Thiamine)
    b2: number; // mg (Riboflavin)
    b3: number; // mg (Niacin)
    b5: number; // mg (Pantothenic Acid)
    b6: number; // mg (Pyridoxine)
    b7: number; // μg (Biotin)
    b8: number; // mg (Inositol - not officially established RDA)
    b9: number; // μg (Folate)
    b12: number; // μg (Cobalamin)
    a: number; // IU (International Units)
    c: number; // mg
    d: number; // IU
    e: number; // mg
    k: number; // μg
  };
  minerals: {
    calcium: number; // mg
    copper: number; // mg
    iron: number; // mg
    magnesium: number; // mg
    manganese: number; // mg
    phosphorus: number; // mg
    potassium: number; // mg
    selenium: number; // μg
    sodium: number; // mg
    zinc: number; // mg
  };
}

export const IDEAL_NUTRITION: IdealNutritionState = {
  macros: {
    protein: 112.3, // g (general recommendation: 0.8-1g per kg body weight)
    carbs: 202.1, // g (45-65% of total calories)
    fats: 59.9, // g (20-35% of total calories)
    energy: 1796.0, // kcal (average for adult males)
  },
  vitamins: {
    b1: 1.2, // mg
    b2: 1.3, // mg
    b3: 16.0, // mg
    b5: 5.0, // mg
    b6: 1.3, // mg
    b7: 30.0, // μg
    b8: 500.0, // mg (no established RDA, this is a common supplemental amount)
    b9: 400.0, // μg
    b12: 2.4, // μg
    a: 3000.0, // IU
    c: 90.0, // mg
    d: 600.0, // IU
    e: 15.0, // mg
    k: 120.0, // μg
  },
  minerals: {
    calcium: 1000.0, // mg
    copper: 0.9, // mg
    iron: 8.0, // mg
    magnesium: 400.0, // mg
    manganese: 2.3, // mg
    phosphorus: 700.0, // mg
    potassium: 3400.0, // mg
    selenium: 55.0, // μg
    sodium: 2300.0, // mg (upper limit)
    zinc: 11.0, // mg
  },
};