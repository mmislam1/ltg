export type WeightUnit = "kg" | "lb";
export type HeightUnit = "cm" | "ft";

const KG_PER_LB = 0.45359237;
const METERS_PER_FOOT = 0.3048;
const CENTIMETERS_PER_FOOT = 30.48;

const trimNumber = (value: number, maximumFractionDigits = 2) =>
  Number(value.toFixed(maximumFractionDigits)).toString();

export const feetInchesToFeet = (feet: number, inches: number) =>
  feet + inches / 12;

export const feetInchesToCentimeters = (feet: number, inches: number) =>
  feetInchesToFeet(feet, inches) * CENTIMETERS_PER_FOOT;

export const centimetersToFeet = (centimeters: number) =>
  centimeters / CENTIMETERS_PER_FOOT;

export const feetToFeetInches = (heightFeet: number) => {
  if (!Number.isFinite(heightFeet) || heightFeet <= 0) {
    return { feet: 0, inches: 0 };
  }

  let feet = Math.floor(heightFeet);
  let inches = Math.round((heightFeet - feet) * 12);

  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }

  return { feet, inches };
};

export const bmiFromMeasurements = ({
  weight,
  weightUnit,
  height,
  heightUnit,
}: {
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
}) => {
  const weightKg = weightUnit === "lb" ? weight * KG_PER_LB : weight;
  const heightMeters = heightUnit === "ft" ? height * METERS_PER_FOOT : height / 100;

  if (
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightMeters) ||
    weightKg <= 0 ||
    heightMeters <= 0
  ) {
    return null;
  }

  return weightKg / heightMeters ** 2;
};

export const formatBmi = (value: number | null) =>
  value === null || !Number.isFinite(value)
    ? "N/A"
    : value.toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });

export const formatHeight = (height: number, unit: HeightUnit) => {
  if (!Number.isFinite(height) || height <= 0) return "N/A";

  if (unit === "ft") {
    const { feet, inches } = feetToFeetInches(height);
    return `${feet} ft ${inches} in`;
  }

  return `${trimNumber(height, 1)} cm`;
};

export const inputNumber = (value: number, maximumFractionDigits = 2) =>
  Number.isFinite(value) && value > 0 ? trimNumber(value, maximumFractionDigits) : "";
