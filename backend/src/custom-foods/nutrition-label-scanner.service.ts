import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateFoodDto } from '../foods/dto/create-food.dto';
import { FoodUnit } from '../foods/schemas/food.schema';

interface UploadedNutritionImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

interface GeminiTextContent {
  type?: string;
  text?: string;
}

interface GeminiStep {
  type?: string;
  content?: GeminiTextContent[];
}

interface GeminiInteractionResponse {
  output_text?: string;
  steps?: GeminiStep[];
}

interface GeminiErrorResponse {
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

type CoreKey = 'calories' | 'protein' | 'carbs' | 'fiber' | 'netCarbs' | 'fats';
type VitaminKey = keyof NonNullable<CreateFoodDto['nutrition']['vitamins']>;
type MineralKey = keyof NonNullable<CreateFoodDto['nutrition']['minerals']>;

const CORE_KEYS: CoreKey[] = ['calories', 'protein', 'carbs', 'fiber', 'netCarbs', 'fats'];
const VITAMIN_KEYS: VitaminKey[] = [
  'b1',
  'b2',
  'b3',
  'b5',
  'b6',
  'b7',
  'b8',
  'b9',
  'b12',
  'a',
  'c',
  'd',
  'e',
  'k',
];
const MINERAL_KEYS: MineralKey[] = [
  'calcium',
  'copper',
  'iron',
  'magnesium',
  'manganese',
  'phosphorus',
  'potassium',
  'selenium',
  'sodium',
  'zinc',
];

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const SCAN_TIMEOUT_MS = 45_000;

const numberField = { type: 'number', minimum: 0 };
const scanResponseSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    unit: { type: 'string', enum: ['g', 'ml', 'pc', 'slice'] },
    nutritionPer: { type: 'number', minimum: 0.001 },
    nutrition: {
      type: 'object',
      properties: {
        calories: numberField,
        protein: numberField,
        carbs: numberField,
        fiber: numberField,
        netCarbs: numberField,
        fats: numberField,
        vitamins: {
          type: 'object',
          properties: Object.fromEntries(VITAMIN_KEYS.map((key) => [key, numberField])),
          required: VITAMIN_KEYS,
        },
        minerals: {
          type: 'object',
          properties: Object.fromEntries(MINERAL_KEYS.map((key) => [key, numberField])),
          required: MINERAL_KEYS,
        },
      },
      required: [...CORE_KEYS, 'vitamins', 'minerals'],
    },
  },
  required: ['name', 'unit', 'nutritionPer', 'nutrition'],
};

const scanPrompt = `Extract the packaged food nutrition facts from this image.

Return the JSON object only.

Use this app contract:
- name: product name if visible, otherwise an empty string.
- unit: "g", "ml", "pc", or "slice".
- nutritionPer: amount that the nutrition values apply to.
- Prefer per 100 g or per 100 ml values when the label shows them.
- If only one serving is shown, use the serving size. For "1 bar (40 g)", return unit "g" and nutritionPer 40. If no gram or ml amount is visible, return unit "pc" and nutritionPer 1.
- calories are kcal.
- protein, fiber, netCarbs, and fats are grams.
- netCarbs is the single carbohydrate field this app displays. Use the label's total carbohydrate value when visible; if only net carbs is visible, use that.
- carbs is a legacy mirror of netCarbs. Return the same number for carbs and netCarbs.
- fats means total fat.
- Vitamins B1, B2, B3, B5, B6, B8, C, and E are mg.
- Vitamins B7, B9, B12, and K are micrograms.
- Vitamin A is micrograms RAE.
- Vitamin D is IU.
- Minerals are mg except selenium is micrograms.
- Use 0 for nutrients that are not visible.
- Do not estimate vitamins or minerals from daily value percentages unless the actual amount is printed.`;

@Injectable()
export class NutritionLabelScannerService {
  private readonly logger = new Logger(NutritionLabelScannerService.name);

  constructor(private readonly config: ConfigService) {}

  isEnabled() {
    return this.booleanConfig('NUTRITION_LABEL_SCAN_ENABLED');
  }

  getStatus() {
    return {
      enabled: this.isEnabled(),
      hasApiKey: Boolean(this.getApiKey()),
      model: this.normalizeModelName(this.config.get<string>('GEMINI_NUTRITION_MODEL', 'gemini-3.5-flash')),
    };
  }

  async scan(file?: UploadedNutritionImage): Promise<CreateFoodDto> {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException('Scan is disabled on the server.');
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Add an image to scan.');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Use an image file.');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException('Image must be 8 MB or smaller.');
    }

    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException('Gemini API key is missing on the server.');
    }

    const model = this.normalizeModelName(this.config.get<string>('GEMINI_NUTRITION_MODEL', 'gemini-3.5-flash'));
    const response = await this.requestGemini(model, apiKey, file);

    if (!response.ok) {
      throw await this.geminiFailure(response);
    }

    const body = (await response.json()) as GeminiInteractionResponse;
    return this.normalize(this.parseResponse(body));
  }

  private async requestGemini(model: string, apiKey: string, file: UploadedNutritionImage) {
    try {
      return await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        signal: AbortSignal.timeout(SCAN_TIMEOUT_MS),
        body: JSON.stringify({
          model,
          store: false,
          input: [
            { type: 'text', text: scanPrompt },
            {
              type: 'image',
              data: file.buffer.toString('base64'),
              mime_type: file.mimetype,
            },
          ],
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: scanResponseSchema,
          },
        }),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        throw new ServiceUnavailableException('Scan timed out. Try a clearer photo.');
      }
      throw new ServiceUnavailableException('Unable to scan image.');
    }
  }

  private normalizeModelName(model: string) {
    const trimmed = model.trim() || 'gemini-3.5-flash';
    return trimmed.replace(/^models\//, '');
  }

  private getApiKey() {
    return this.config.get<string>('GEMINI_API_KEY')?.trim() ?? '';
  }

  private booleanConfig(key: string) {
    const value = this.config.get<unknown>(key, false);
    if (typeof value === 'boolean') return value;
    if (typeof value !== 'string') return false;
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
  }

  private async geminiFailure(response: Response) {
    let geminiMessage = '';
    try {
      const body = (await response.json()) as GeminiErrorResponse;
      geminiMessage = body.error?.message ?? '';
    } catch {
      geminiMessage = response.statusText;
    }

    this.logger.warn(`Gemini scan failed (${response.status}): ${geminiMessage || 'No error body'}`);

    if (response.status === 401 || response.status === 403) {
      return new ServiceUnavailableException('Gemini access was rejected. Check the backend API key.');
    }
    if (response.status === 404) {
      return new ServiceUnavailableException('Gemini model was rejected. Check the backend model setting.');
    }
    if (response.status === 429) {
      return new ServiceUnavailableException('Gemini is rate limited. Try again shortly.');
    }
    if (response.status >= 500) {
      return new ServiceUnavailableException('Gemini is temporarily unavailable. Try again shortly.');
    }
    if (geminiMessage) {
      return new ServiceUnavailableException(`Gemini rejected the scan request: ${this.sanitizeGeminiMessage(geminiMessage)}`);
    }
    return new ServiceUnavailableException('Unable to scan image. Try a clearer nutrition label.');
  }

  private sanitizeGeminiMessage(message: string) {
    return message
      .replace(this.getApiKey(), '[redacted]')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 240);
  }

  private parseResponse(body: GeminiInteractionResponse) {
    const text =
      body.output_text ||
      body.steps
        ?.filter((step) => step.type === 'model_output')
        .flatMap((step) => step.content ?? [])
        .filter((content) => content.type === 'text' && content.text)
        .map((content) => content.text)
        .join('\n');

    if (!text) {
      throw new ServiceUnavailableException('Unable to scan image.');
    }

    try {
      return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) as Partial<CreateFoodDto>;
    } catch {
      throw new ServiceUnavailableException('Unable to scan image.');
    }
  }

  private normalize(scan: Partial<CreateFoodDto>): CreateFoodDto {
    const unit = this.normalizeUnit(scan.unit);
    const nutritionPer = this.roundPositive(
      scan.nutritionPer,
      unit === FoodUnit.GRAM || unit === FoodUnit.MILLILITER ? 100 : 1,
    );

    const core = this.normalizeGroup(scan.nutrition, CORE_KEYS);
    const carbGrams = this.roundPositive(scan.nutrition?.carbs ?? scan.nutrition?.netCarbs, 0);

    return {
      name: typeof scan.name === 'string' ? scan.name.trim().slice(0, 160) : '',
      unit,
      nutritionPer,
      nutrition: {
        ...core,
        carbs: carbGrams,
        netCarbs: carbGrams,
        vitamins: this.normalizeGroup(scan.nutrition?.vitamins, VITAMIN_KEYS),
        minerals: this.normalizeGroup(scan.nutrition?.minerals, MINERAL_KEYS),
      },
    };
  }

  private normalizeUnit(unit: unknown): FoodUnit {
    return Object.values(FoodUnit).includes(unit as FoodUnit) ? (unit as FoodUnit) : FoodUnit.GRAM;
  }

  private normalizeGroup<Key extends string>(
    source: Partial<Record<Key, unknown>> | undefined,
    keys: Key[],
  ) {
    return Object.fromEntries(keys.map((key) => [key, this.roundPositive(source?.[key], 0)])) as Record<Key, number>;
  }

  private roundPositive(value: unknown, fallback: number) {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue) || numberValue < 0) return fallback;
    return Math.min(100_000, Math.round((numberValue + Number.EPSILON) * 10_000) / 10_000);
  }
}
