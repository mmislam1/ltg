import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateFoodDto } from '../foods/dto/create-food.dto';
import { foodToResponse } from '../foods/food-response';
import {
  Food,
  FoodDocument,
  FoodKind,
  FoodUnit,
  Minerals,
  Nutrition,
  Vitamins,
} from '../foods/schemas/food.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';

type NutritionGroup = NonNullable<Nutrition['vitamins']> | NonNullable<Nutrition['minerals']>;

const CORE_NUTRIENTS = ['calories', 'protein', 'carbs', 'fiber', 'netCarbs', 'fats'] as const;
const VITAMINS = ['b1', 'b2', 'b3', 'b5', 'b6', 'b7', 'b8', 'b9', 'b12', 'a', 'c', 'd', 'e', 'k'] as const;
const MINERALS = ['calcium', 'copper', 'iron', 'magnesium', 'manganese', 'phosphorus', 'potassium', 'selenium', 'sodium', 'zinc'] as const;

@Injectable()
export class CustomFoodsService {
  constructor(@InjectModel(Food.name) private readonly foods: Model<Food>) {}

  async createFood(userId: string, dto: CreateFoodDto) {
    const item = await this.foods.create({
      ...dto,
      kind: FoodKind.FOOD,
      addedBy: userId,
      selectedBy: 0,
      approved: false,
    });
    return foodToResponse(item);
  }

  async createRecipe(userId: string, dto: CreateRecipeDto) {
    const ids = dto.ingredients.map((ingredient) => new Types.ObjectId(ingredient.foodId));
    const foods = await this.foods.find({
      _id: { $in: ids },
      $or: [{ approved: true }, { addedBy: userId }],
    }).exec();

    if (foods.length !== dto.ingredients.length) {
      throw new BadRequestException({
        message: 'One or more recipe ingredients are unavailable.',
        errors: { ingredients: ['Use approved foods or foods created by this user.'] },
      });
    }

    const byId = new Map(foods.map((food) => [food.id, food]));
    const nutrition = this.calculateNutrition(dto, byId);
    const item = await this.foods.create({
      name: dto.name,
      addedBy: userId,
      selectedBy: 0,
      kind: FoodKind.RECIPE,
      unit: FoodUnit.PIECE,
      nutritionPer: 1,
      nutrition,
      recipeServings: dto.servings,
      ingredients: dto.ingredients.map((ingredient) => ({
        foodId: new Types.ObjectId(ingredient.foodId),
        quantity: ingredient.quantity,
      })),
      approved: false,
    });
    return foodToResponse(item);
  }

  private calculateNutrition(dto: CreateRecipeDto, foods: Map<string, FoodDocument>) {
    const result: Nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fiber: 0,
      netCarbs: 0,
      fats: 0,
      vitamins: Object.fromEntries(VITAMINS.map((key) => [key, 0])) as unknown as Vitamins,
      minerals: Object.fromEntries(MINERALS.map((key) => [key, 0])) as unknown as Minerals,
    };

    for (const ingredient of dto.ingredients) {
      const food = foods.get(ingredient.foodId)!;
      const nutritionPer = food.nutritionPer ??
        (food.unit === FoodUnit.GRAM || food.unit === FoodUnit.MILLILITER ? 100 : 1);
      const multiplier = ingredient.quantity / nutritionPer / dto.servings;
      for (const key of CORE_NUTRIENTS) {
        result[key] += (food.nutrition[key] ?? 0) * multiplier;
      }
      this.addGroup(result.vitamins!, food.nutrition.vitamins, VITAMINS, multiplier);
      this.addGroup(result.minerals!, food.nutrition.minerals, MINERALS, multiplier);
    }

    for (const key of CORE_NUTRIENTS) result[key] = this.round(result[key]);
    for (const key of VITAMINS) result.vitamins![key] = this.round(result.vitamins![key]);
    for (const key of MINERALS) result.minerals![key] = this.round(result.minerals![key]);
    return result;
  }

  private addGroup<Key extends string>(
    target: NutritionGroup,
    source: NutritionGroup | undefined,
    keys: readonly Key[],
    multiplier: number,
  ) {
    for (const key of keys) {
      (target as unknown as Record<Key, number>)[key] +=
        ((source as unknown as Record<Key, number> | undefined)?.[key] ?? 0) * multiplier;
    }
  }

  private round(value: number) {
    return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
  }
}
