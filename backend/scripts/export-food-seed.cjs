const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.resolve(__dirname, '../seeds/foods.raw.json');
const outputPath = path.resolve(__dirname, '../seeds/foods.seed.json');

const quantityUnits = new Map([
  ['g', 'g'],
  ['gram', 'g'],
  ['grams', 'g'],
  ['গ্রাম', 'g'],
  ['ml', 'ml'],
  ['milliliter', 'ml'],
  ['milliliters', 'ml'],
  ['মিলিলিটার', 'ml'],
  ['মি.লি.', 'ml'],
  ['piece', 'pc'],
  ['pieces', 'pc'],
  ['pc', 'pc'],
  ['পিস', 'pc'],
  ['টি', 'pc'],
  ['slice', 'slice'],
  ['slices', 'slice'],
  ['স্লাইস', 'slice'],
  ['টুকরা', 'slice'],
]);

const nutrientUnits = new Map([
  ['g', 'g'],
  ['gram', 'g'],
  ['grams', 'g'],
  ['গ্রাম', 'g'],
  ['mg', 'mg'],
  ['milligram', 'mg'],
  ['milligrams', 'mg'],
  ['মিলিগ্রাম', 'mg'],
  ['μg', 'µg'],
  ['µg', 'µg'],
  ['mcg', 'µg'],
  ['microgram', 'µg'],
  ['micrograms', 'µg'],
  ['মাইক্রোগ্রাম', 'µg'],
  ['kcal', 'kcal'],
  ['kilocalorie', 'kcal'],
  ['kilocalories', 'kcal'],
  ['কিলোক্যালরি', 'kcal'],
  ['IU', 'IU'],
  ['iu', 'IU'],
  ['আইইউ', 'IU'],
]);

function normalizeUnit(unit, units, field) {
  const normalized = units.get(String(unit).trim());
  if (!normalized) throw new Error(`${field} has unsupported unit: ${unit}`);
  return normalized;
}

function valueOf(measurement, expectedUnit, field) {
  if (!measurement || typeof measurement !== 'object') {
    throw new Error(`${field} is missing`);
  }
  const unit = normalizeUnit(measurement.unit, nutrientUnits, field);
  if (unit !== expectedUnit) {
    throw new Error(`${field} must use ${expectedUnit}; received ${measurement.unit}`);
  }
  const value = Number(measurement.value);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must contain a non-negative number`);
  }
  return value;
}

function biotinValueOf(measurement, field) {
  if (!measurement || typeof measurement !== 'object') {
    throw new Error(`${field} is missing`);
  }
  const sourceUnit = normalizeUnit(measurement.unit, nutrientUnits, field);
  // The supplied source labels B7 as mg, but its values (including 30 for the
  // multivitamin) are microgram-scale. Preserve the numbers and correct the label.
  if (sourceUnit !== 'mg' && sourceUnit !== 'µg') {
    throw new Error(`${field} must use a mass unit; received ${measurement.unit}`);
  }
  const value = Number(measurement.value);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must contain a non-negative number`);
  }
  return value;
}

const rawFoods = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (!Array.isArray(rawFoods)) throw new Error('Raw food data must be a JSON array.');

const foods = rawFoods.map((raw, index) => {
  const field = (name) => `foods[${index}].${name}`;
  const unit = normalizeUnit(raw.quantity?.unit, quantityUnits, field('quantity.unit'));
  const nutritionPer = Number(raw.quantity?.value);
  if (!Number.isFinite(nutritionPer) || nutritionPer <= 0) {
    throw new Error(`${field('quantity.value')} must be greater than zero`);
  }

  const b = raw.vitamins?.b_complex;
  return {
    name: String(raw.name).trim(),
    addedBy: 'system',
    selectedBy: 0,
    unit,
    nutritionPer,
    nutrition: {
      calories: valueOf(raw.macronutrients?.calories, 'kcal', field('macronutrients.calories')),
      protein: valueOf(raw.macronutrients?.protein, 'g', field('macronutrients.protein')),
      carbs: valueOf(raw.macronutrients?.carbohydrates?.total, 'g', field('macronutrients.carbohydrates.total')),
      fiber: valueOf(raw.macronutrients?.carbohydrates?.fiber, 'g', field('macronutrients.carbohydrates.fiber')),
      netCarbs: valueOf(raw.macronutrients?.carbohydrates?.net, 'g', field('macronutrients.carbohydrates.net')),
      fats: valueOf(raw.macronutrients?.fat, 'g', field('macronutrients.fat')),
      vitamins: {
        b1: valueOf(b?.b1, 'mg', field('vitamins.b1')),
        b2: valueOf(b?.b2, 'mg', field('vitamins.b2')),
        b3: valueOf(b?.b3, 'mg', field('vitamins.b3')),
        b5: valueOf(b?.b5, 'mg', field('vitamins.b5')),
        b6: valueOf(b?.b6, 'mg', field('vitamins.b6')),
        b7: biotinValueOf(b?.b7, field('vitamins.b7')),
        b8: valueOf(b?.b8, 'mg', field('vitamins.b8')),
        b9: valueOf(b?.b9, 'µg', field('vitamins.b9')),
        b12: valueOf(b?.b12, 'µg', field('vitamins.b12')),
        a: valueOf(raw.vitamins?.vitamin_a, 'µg', field('vitamins.a')),
        c: valueOf(raw.vitamins?.vitamin_c, 'mg', field('vitamins.c')),
        d: valueOf(raw.vitamins?.vitamin_d, 'IU', field('vitamins.d')),
        e: valueOf(raw.vitamins?.vitamin_e, 'mg', field('vitamins.e')),
        k: valueOf(raw.vitamins?.vitamin_k, 'µg', field('vitamins.k')),
      },
      minerals: {
        calcium: valueOf(raw.minerals?.calcium, 'mg', field('minerals.calcium')),
        copper: valueOf(raw.minerals?.copper, 'mg', field('minerals.copper')),
        iron: valueOf(raw.minerals?.iron, 'mg', field('minerals.iron')),
        magnesium: valueOf(raw.minerals?.magnesium, 'mg', field('minerals.magnesium')),
        manganese: valueOf(raw.minerals?.manganese, 'mg', field('minerals.manganese')),
        phosphorus: valueOf(raw.minerals?.phosphorus, 'mg', field('minerals.phosphorus')),
        potassium: valueOf(raw.minerals?.potassium, 'mg', field('minerals.potassium')),
        selenium: valueOf(raw.minerals?.selenium, 'µg', field('minerals.selenium')),
        sodium: valueOf(raw.minerals?.sodium, 'mg', field('minerals.sodium')),
        zinc: valueOf(raw.minerals?.zinc, 'mg', field('minerals.zinc')),
      },
    },
    approved: true,
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify(foods, null, 2)}\n`);
console.log(`Validated and exported ${foods.length} foods to ${outputPath}`);
console.log('Normalized B7/biotin to µg and vitamin A to µg RAE.');
