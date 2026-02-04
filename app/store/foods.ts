import { Food } from "./features/foodSlice";

export const foods: Food[] = [
  {
    id: "food_1",
    name: "Broccoli",
    addedBy: "system",
    selectedBy: 0,
    unit: "g",
    nutrition: {
      calories: 34,
      protein: 2.82,
      carbs: 6.64,
      fats: 0.37,
      vitamins: {
        b1: 0.07, b2: 0.12, b3: 0.64, b5: 0.57, b6: 0.18,
        b7: 0.95, b8: 18.7, b9: 63, b12: 0,
        a: 31.17, c: 89.2, d: 0,
        e: 1.44, k: 102
      },
      minerals: {
        calcium: 47, copper: 0.05, iron: 0.73, magnesium: 21,
        manganese: 0.21, phosphorus: 66, potassium: 316,
        selenium: 2.5, sodium: 33, zinc: 0.41
      }
    },
    approved: true
  },

  {
    id: "food_2",
    name: "Spinach",
    addedBy: "system",
    selectedBy: 0,
    unit: "g",
    nutrition: {
      calories: 23,
      protein: 2.86,
      carbs: 3.63,
      fats: 0.39,
      vitamins: {
        b1: 0.08, b2: 0.19, b3: 0.72, b5: 0.07, b6: 0.2,
        b7: 0, b8: 19.3, b9: 194, b12: 0,
        a: 468.83, c: 28.1, d: 0,
        e: 1.96, k: 482.9
      },
      minerals: {
        calcium: 99, copper: 0.13, iron: 2.71, magnesium: 79,
        manganese: 0.9, phosphorus: 49, potassium: 558,
        selenium: 1, sodium: 79, zinc: 0.53
      }
    },
    approved: true
  },

  {
    id: "food_3",
    name: "Cucumber",
    addedBy: "system",
    selectedBy: 0,
    unit: "g",
    nutrition: {
      calories: 15,
      protein: 0.65,
      carbs: 3.63,
      fats: 0.11,
      vitamins: {
        b1: 0.03, b2: 0.03, b3: 0.1, b5: 0.26, b6: 0.04,
        b7: 0, b8: 6, b9: 7, b12: 0,
        a: 5.29, c: 2.8, d: 0,
        e: 0.03, k: 16.4
      },
      minerals: {
        calcium: 16, copper: 0.04, iron: 0.28, magnesium: 13,
        manganese: 0.08, phosphorus: 24, potassium: 147,
        selenium: 0.3, sodium: 2, zinc: 0.2
      }
    },
    approved: true
  },

  {
    id: "food_4",
    name: "Banana",
    addedBy: "system",
    selectedBy: 0,
    unit: "g",
    nutrition: {
      calories: 89,
      protein: 1.09,
      carbs: 22.84,
      fats: 0.33,
      vitamins: {
        b1: 0.03, b2: 0.07, b3: 0.67, b5: 0.33, b6: 0.37,
        b7: 0.13, b8: 9.8, b9: 20, b12: 0,
        a: 3.21, c: 8.7, d: 0,
        e: 0.13, k: 0.5
      },
      minerals: {
        calcium: 5, copper: 0.08, iron: 0.26, magnesium: 27,
        manganese: 0.27, phosphorus: 22, potassium: 358,
        selenium: 1, sodium: 1, zinc: 0.15
      }
    },
    approved: true
  },

  {
    id: "food_5",
    name: "Sugar",
    addedBy: "system",
    selectedBy: 0,
    unit: "g",
    nutrition: {
      calories: 387,
      protein: 0,
      carbs: 99.98,
      fats: 0,
      vitamins: {
        b1: 0, b2: 0.02, b3: 0, b5: 0, b6: 0,
        b7: 0, b8: 0, b9: 0, b12: 0,
        a: 0, c: 0, d: 0,
        e: 0, k: 0
      },
      minerals: {
        calcium: 1, copper: 0.01, iron: 0.05, magnesium: 0,
        manganese: 0.01, phosphorus: 0, potassium: 2,
        selenium: 0.6, sodium: 1, zinc: 0.01
      }
    },
    approved: true
  }
  ,
  {
  id: "food_6",
  name: "Avocado",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 167,
    protein: 1.96,
    carbs: 8.64,
    fats: 15.41,
    vitamins: {
      b1: 0.08, b2: 0.14, b3: 1.91, b5: 1.46, b6: 0.29,
      b7: 0, b8: 14.2, b9: 89, b12: 0,
      a: 7.38, c: 8.8, d: 0,
      e: 1.93, k: 21
    },
    minerals: {
      calcium: 13, copper: 0.17, iron: 0.61, magnesium: 29,
      manganese: 0.15, phosphorus: 54, potassium: 507,
      selenium: 0.4, sodium: 8, zinc: 0.68
    }
  },
  approved: true
},

{
  id: "food_7",
  name: "Peanut Butter",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 587,
    protein: 24.35,
    carbs: 21.26,
    fats: 49.66,
    vitamins: {
      b1: 0.15, b2: 0.2, b3: 14.36, b5: 1.01, b6: 0.47,
      b7: 0, b8: 64.6, b9: 97, b12: 0,
      a: 0, c: 0, d: 0,
      e: 4.93, k: 0
    },
    minerals: {
      calcium: 58.19, copper: 0.43, iron: 1.58, magnesium: 178.01,
      manganese: 1.79, phosphorus: 363, potassium: 634.06,
      selenium: 9.3, sodium: 312.43, zinc: 2.77
    }
  },
  approved: true
},

{
  id: "food_8",
  name: "Almond",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 579,
    protein: 21.15,
    carbs: 21.55,
    fats: 49.93,
    vitamins: {
      b1: 0.21, b2: 1.14, b3: 3.62, b5: 0.47, b6: 0.14,
      b7: 0, b8: 52.1, b9: 44, b12: 0,
      a: 0.08, c: 0, d: 0,
      e: 25.63, k: 0
    },
    minerals: {
      calcium: 269, copper: 1.03, iron: 3.71, magnesium: 270,
      manganese: 2.18, phosphorus: 481, potassium: 733,
      selenium: 4.1, sodium: 1, zinc: 3.12
    }
  },
  approved: true
},

{
  id: "food_9",
  name: "Chia Seed",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 486,
    protein: 16.54,
    carbs: 42.12,
    fats: 30.74,
    vitamins: {
      b1: 0.18, b2: 0.04, b3: 6.13, b5: 0.6, b6: 1.39,
      b7: 0, b8: 65.5, b9: 49, b12: 0,
      a: 2.2, c: 1.6, d: 0,
      e: 0.5, k: 708.9
    },
    minerals: {
      calcium: 631, copper: 0.92, iron: 16.4, magnesium: 390,
      manganese: 2.72, phosphorus: 860, potassium: 407,
      selenium: 55.2, sodium: 16, zinc: 4.58
    }
  },
  approved: true
},

{
  id: "food_10",
  name: "Full-Fat Milk",
  addedBy: "system",
  selectedBy: 0,
  unit: "ml",
  nutrition: {
    calories: 61,
    protein: 3.15,
    carbs: 4.8,
    fats: 3.25,
    vitamins: {
      b1: 0.05, b2: 0.17, b3: 0.9, b5: 0.37, b6: 0.04,
      b7: 0.09, b8: 14.3, b9: 5, b12: 0.45,
      a: 45.58, c: 0, d: 51,
      e: 0.07, k: 0.3
    },
    minerals: {
      calcium: 113, copper: 0.03, iron: 0.03, magnesium: 10,
      manganese: 0.01, phosphorus: 84, potassium: 132,
      selenium: 3.7, sodium: 43, zinc: 0.37
    }
  },
  approved: true
},

{
  id: "food_11",
  name: "Yogurt",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 61,
    protein: 3.47,
    carbs: 4.66,
    fats: 3.25,
    vitamins: {
      b1: 0.03, b2: 0.14, b3: 0.08, b5: 0.39, b6: 0.03,
      b7: 0.08, b8: 15.2, b9: 7, b12: 0.37,
      a: 27.42, c: 0, d: 2,
      e: 0.06, k: 0.21
    },
    minerals: {
      calcium: 121, copper: 0.01, iron: 0.05, magnesium: 12,
      manganese: 0.01, phosphorus: 95, potassium: 155,
      selenium: 2.2, sodium: 46, zinc: 0.59
    }
  },
  approved: true
},

{
  id: "food_12",
  name: "Cheddar Cheese Slice",
  addedBy: "system",
  selectedBy: 0,
  unit: "slice",
  nutrition: {
    calories: 77.9,
    protein: 4.61,
    carbs: 0.4,
    fats: 6.43,
    vitamins: {
      b1: 0.01, b2: 0.08, b3: 0.01, b5: 0.09, b6: 0.01,
      b7: 0, b8: 3.14, b9: 5.13, b12: 0.17,
      a: 49.97, c: 0, d: 7.79,
      e: 0.15, k: 0.46
    },
    minerals: {
      calcium: 135.09, copper: 0.01, iron: 0.03, magnesium: 5.13,
      manganese: 0.01, phosphorus: 87.4, potassium: 14.44,
      selenium: 5.38, sodium: 122.36, zinc: 0.71
    }
  },
  approved: true
},

{
  id: "food_13",
  name: "Cooked Rice",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 130,
    protein: 2.69,
    carbs: 28.17,
    fats: 0.28,
    vitamins: {
      b1: 0.16, b2: 0.01, b3: 1.48, b5: 0.39, b6: 0.09,
      b7: 0, b8: 2.1, b9: 42.8, b12: 0,
      a: 0, c: 0, d: 0,
      e: 0.04, k: 0
    },
    minerals: {
      calcium: 10, copper: 0.07, iron: 1.2, magnesium: 12,
      manganese: 0.47, phosphorus: 43, potassium: 35,
      selenium: 7.5, sodium: 1, zinc: 0.49
    }
  },
  approved: true
},

{
  id: "food_14",
  name: "Oats",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 379,
    protein: 13.15,
    carbs: 67.7,
    fats: 6.52,
    vitamins: {
      b1: 0.46, b2: 0.16, b3: 1.13, b5: 1.12, b6: 0.1,
      b7: 0.19, b8: 40.4, b9: 32, b12: 0,
      a: 0, c: 0, d: 0,
      e: 0.42, k: 2
    },
    minerals: {
      calcium: 52, copper: 0.39, iron: 4.25, magnesium: 138,
      manganese: 3.63, phosphorus: 410, potassium: 362,
      selenium: 28.9, sodium: 6, zinc: 3.64
    }
  },
  approved: true
}
,{
  id: "food_15",
  name: "Roti (Flatbread)",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 285.12,
    protein: 8.47,
    carbs: 46.13,
    fats: 9.2,
    vitamins: {
      b1: 0.32,
      b2: 0.11,
      b3: 3.18,
      b5: 0.39,
      b6: 0.26,
      b7: 0,
      b8: 20.1,
      b9: 28.2,
      b12: 0,
      a: 0.27,
      c: 0,
      d: 0,
      e: 1.08,
      k: 15.19
    },
    minerals: {
      calcium: 22.51,
      copper: 0.26,
      iron: 2.31,
      magnesium: 87.95,
      manganese: 2.61,
      phosphorus: 228.84,
      potassium: 232.74,
      selenium: 43.1,
      sodium: 297.94,
      zinc: 1.67
    }
  },
  approved: true
},

{
  id: "food_16",
  name: "Moshur Dal (Lentil)",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 358,
    protein: 23.91,
    carbs: 63.1,
    fats: 2.17,
    vitamins: {
      b1: 0.51,
      b2: 0.11,
      b3: 1.5,
      b5: 0.35,
      b6: 0.4,
      b7: 0,
      b8: 0,
      b9: 204,
      b12: 0,
      a: 3,
      c: 1.7,
      d: 0,
      e: 0,
      k: 0
    },
    minerals: {
      calcium: 48,
      copper: 1.3,
      iron: 7.39,
      magnesium: 59,
      manganese: 1.72,
      phosphorus: 294,
      potassium: 668,
      selenium: 0,
      sodium: 7,
      zinc: 3.6
    }
  },
  approved: true
},

{
  id: "food_17",
  name: "Butter",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 717,
    protein: 0.85,
    carbs: 0.6,
    fats: 81.11,
    vitamins: {
      b1: 0.01,
      b2: 0.03,
      b3: 0.04,
      b5: 0.11,
      b6: 0.01,
      b7: 0,
      b8: 18.8,
      b9: 3,
      b12: 0.17,
      a: 684.17,
      c: 0,
      d: 10.28,
      e: 2.32,
      k: 7
    },
    minerals: {
      calcium: 24,
      copper: 0,
      iron: 0.02,
      magnesium: 2,
      manganese: 0,
      phosphorus: 24,
      potassium: 24,
      selenium: 1,
      sodium: 643,
      zinc: 0.09
    }
  },
  approved: true
},

{
  id: "food_18",
  name: "Olive Oil",
  addedBy: "system",
  selectedBy: 0,
  unit: "ml",
  nutrition: {
    calories: 884,
    protein: 0,
    carbs: 0,
    fats: 100,
    vitamins: {
      b1: 0,
      b2: 0,
      b3: 0,
      b5: 0,
      b6: 0,
      b7: 0,
      b8: 0.3,
      b9: 0,
      b12: 0,
      a: 0,
      c: 0,
      d: 0,
      e: 14.35,
      k: 60.2
    },
    minerals: {
      calcium: 1,
      copper: 0,
      iron: 0.56,
      magnesium: 0,
      manganese: 0,
      phosphorus: 0,
      potassium: 1,
      selenium: 0,
      sodium: 2,
      zinc: 0
    }
  },
  approved: true
},

{
  id: "food_19",
  name: "Isubgul (Psyllium Seeds)",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 5.58,
    protein: 0.13,
    carbs: 0,
    fats: 0.01,
    vitamins: {
      b1: 0,
      b2: 0,
      b3: 0,
      b5: 0,
      b6: 0,
      b7: 0,
      b8: 0,
      b9: 0,
      b12: 0,
      a: 0,
      c: 0,
      d: 0,
      e: 0,
      k: 0
    },
    minerals: {
      calcium: 8.21,
      copper: 0,
      iron: 0,
      magnesium: 0,
      manganese: 0.01,
      phosphorus: 0,
      potassium: 0,
      selenium: 0,
      sodium: 3.49,
      zinc: 0
    }
  },
  approved: true
},

{
  id: "food_20",
  name: "Multivitamin A-Z",
  addedBy: "system",
  selectedBy: 0,
  unit: "piece",
  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    vitamins: {
      b1: 1.5,
      b2: 1.7,
      b3: 20,
      b5: 10,
      b6: 2,
      b7: 30,
      b8: 0,
      b9: 400,
      b12: 6,
      a: 1050,
      c: 60,
      d: 400,
      e: 13.3,
      k: 25
    },
    minerals: {
      calcium: 162,
      copper: 2,
      iron: 18,
      magnesium: 100,
      manganese: 2,
      phosphorus: 109,
      potassium: 80,
      selenium: 20,
      sodium: 0,
      zinc: 15
    }
  },
  approved: true
},

{
  id: "food_21",
  name: "Fish Oil",
  addedBy: "system",
  selectedBy: 0,
  unit: "piece",
  nutrition: {
    calories: 10.2,
    protein: 0,
    carbs: 0.1,
    fats: 1,
    vitamins: {
      b1: 0,
      b2: 0,
      b3: 0,
      b5: 0,
      b6: 0,
      b7: 0,
      b8: 0,
      b9: 0,
      b12: 0,
      a: 0,
      c: 0,
      d: 0,
      e: 15,
      k: 0
    },
    minerals: {
      calcium: 0,
      copper: 0,
      iron: 0,
      magnesium: 0,
      manganese: 0,
      phosphorus: 0,
      potassium: 0,
      selenium: 0,
      sodium: 0,
      zinc: 0
    }
  },
  approved: true
},

{
  id: "food_22",
  name: "Biscuit Rusk Cracker",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 408.87,
    protein: 11.82,
    carbs: 72.43,
    fats: 7.28,
    vitamins: {
      b1: 0.75,
      b2: 0.56,
      b3: 5.35,
      b5: 0.74,
      b6: 0.07,
      b7: 0.23,
      b8: 0,
      b9: 70.62,
      b12: 198.38,
      a: 31.21,
      c: 0.01,
      d: 18.2,
      e: 0.77,
      k: 1.52
    },
    minerals: {
      calcium: 23.81,
      copper: 0.13,
      iron: 4.3,
      magnesium: 21.51,
      manganese: 0.6,
      phosphorus: 133.09,
      potassium: 124.27,
      selenium: 35.98,
      sodium: 252.72,
      zinc: 0.87
    }
  },
  approved: true
},
{
  id: "food_23",
  name: "Oats",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 379,
    protein: 13.15,
    carbs: 67.7,
    fats: 6.52,
    vitamins: {
      b1: 0.46,
      b2: 0.16,
      b3: 1.13,
      b5: 1.12,
      b6: 0.1,
      b7: 0,
      b8: 0.19,
      b9: 40.4,
      b12: 32,
      a: 0,
      c: 0,
      d: 0,
      e: 0.42,
      k: 2
    },
    minerals: {
      calcium: 52,
      copper: 0.39,
      iron: 4.25,
      magnesium: 138,
      manganese: 3.63,
      phosphorus: 410,
      potassium: 362,
      selenium: 28.9,
      sodium: 6,
      zinc: 3.64
    }
  },
  approved: true
},
{
  id: "food_24",
  name: "Vat (Cooked Rice)",
  addedBy: "system",
  selectedBy: 0,
  unit: "g",
  nutrition: {
    calories: 130,
    protein: 2.69,
    carbs: 28.17,
    fats: 0.28,
    vitamins: {
      b1: 0.16,
      b2: 0.01,
      b3: 1.48,
      b5: 0.39,
      b6: 0.09,
      b7: 0,
      b8: 0,
      b9: 2.1,
      b12: 42.8,
      a: 0,
      c: 0,
      d: 0,
      e: 0.04,
      k: 0
    },
    minerals: {
      calcium: 10,
      copper: 0.07,
      iron: 1.2,
      magnesium: 12,
      manganese: 0.47,
      phosphorus: 43,
      potassium: 35,
      selenium: 7.5,
      sodium: 1,
      zinc: 0.49
    }
  },
  approved: true
}

  
];




export const microUnits = {
  vitamins:{
  b1: "mg", // Thiamine
  b2: "mg", // Riboflavin
  b3: "mg", // Niacin
  b5: "mg", // Pantothenic Acid
  b6: "mg", // Pyridoxine
  b7: "mg", // Biotin
  b8: "mg", // Choline
  b9: "μg", // Folate
  b12: "μg", // Cobalamin
  a: "μg", // Vitamin A
  c: "mg", // Vitamin C
  d: "IU", // Vitamin D
  e: "mg", // Vitamin E
  k: "μg", // Vitamin K
  },
  minerals:{
  calcium: "mg",
  copper: "mg",
  iron: "mg",
  magnesium: "mg",
  manganese: "mg",
  phosphorus: "mg",
  potassium: "mg",
  selenium: "μg",
  sodium: "mg",
  zinc: "mg",}
};
