import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {
  DietChartDocument,
  DietChartItem,
  DietChartMacroValues,
  DietChartNutritionTotals,
} from './diet-chart.types';
import { DIET_CHART_LOGO } from './diet-chart-logo';

const COLORS = {
  ink: '#172B2A',
  muted: '#657473',
  brand: '#0F766E',
  brandDark: '#115E59',
  brandSoft: '#DFF4F0',
  paper: '#FFFFFF',
  canvas: '#F5F8F7',
  line: '#DDE7E5',
  calories: '#c026d3',
  protein: '#059669',
  carbs: '#2563eb',
  fats: '#dc2626',
} as const;

const PAGE = { width: 595.28, height: 841.89, margin: 40, footerTop: 776 };
const FONT_REGULAR = require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff');
const FONT_BOLD = require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff');
type PdfDocumentWithArc = PDFKit.PDFDocument & {
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean,
  ): PDFKit.PDFDocument;
};

const VITAMIN_ENTRIES = [
  { key: 'a', label: 'Vitamin A', unit: 'µg RAE' },
  { key: 'b1', label: 'Vitamin B1', unit: 'mg' },
  { key: 'b2', label: 'Vitamin B2', unit: 'mg' },
  { key: 'b3', label: 'Vitamin B3', unit: 'mg' },
  { key: 'b5', label: 'Vitamin B5', unit: 'mg' },
  { key: 'b6', label: 'Vitamin B6', unit: 'mg' },
  { key: 'b7', label: 'Vitamin B7', unit: 'µg' },
  { key: 'b8', label: 'Vitamin B8', unit: 'mg' },
  { key: 'b9', label: 'Vitamin B9', unit: 'µg' },
  { key: 'b12', label: 'Vitamin B12', unit: 'µg' },
  { key: 'c', label: 'Vitamin C', unit: 'mg' },
  { key: 'd', label: 'Vitamin D', unit: 'IU' },
  { key: 'e', label: 'Vitamin E', unit: 'mg' },
  { key: 'k', label: 'Vitamin K', unit: 'µg' },
] as const;

const MINERAL_ENTRIES = [
  { key: 'calcium', label: 'Calcium', unit: 'mg' },
  { key: 'copper', label: 'Copper', unit: 'mg' },
  { key: 'iron', label: 'Iron', unit: 'mg' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
  { key: 'manganese', label: 'Manganese', unit: 'mg' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg' },
  { key: 'potassium', label: 'Potassium', unit: 'mg' },
  { key: 'selenium', label: 'Selenium', unit: 'µg' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'zinc', label: 'Zinc', unit: 'mg' },
] as const;

@Injectable()
export class DietChartPdfService {
  render(chart: DietChartDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({
        size: 'A4',
        margins: {
          top: PAGE.margin,
          right: PAGE.margin,
          bottom: 54,
          left: PAGE.margin,
        },
        bufferPages: true,
        info: {
          Title: `Diet chart - ${chart.date}`,
          Author: 'Lose To Gain',
          Subject: `Daily diet chart for ${chart.user.name}`,
          Creator: 'Lose To Gain API',
        },
      });
      const chunks: Buffer[] = [];

      document.registerFont('Inter', FONT_REGULAR);
      document.registerFont('Inter-Bold', FONT_BOLD);

      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      try {
        this.drawDocument(document, chart);
        document.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawDocument(document: PDFKit.PDFDocument, chart: DietChartDocument) {
    this.drawHero(document, chart);
    let y = 166;
    y = this.drawMacroOverview(document, chart, y);
    y = this.drawMeals(document, chart, y + 22);
    this.drawCompleteNutrition(document, chart.totals, y + 18);
    this.drawPageFooter(document, document.bufferedPageRange().count);
  }

  private drawHero(document: PDFKit.PDFDocument, chart: DietChartDocument) {
    document.rect(0, 0, PAGE.width, 138).fill(COLORS.brandDark);
    document.circle(534, 20, 70).fill('#147A72');
    document.circle(566, 116, 48).fill('#0D514D');

    document.roundedRect(PAGE.margin, 25, 112, 35, 7).fill(COLORS.paper);
    document.image(DIET_CHART_LOGO, PAGE.margin + 9, 30, {
      fit: [94, 25],
      align: 'center',
      valign: 'center',
    });
    document
      .fillColor(COLORS.paper)
      .font('Inter-Bold')
      .fontSize(27)
      .text('Your daily diet chart', PAGE.margin, 65, { lineBreak: false });
    document
      .fillColor('#CDE9E5')
      .font('Inter')
      .fontSize(10)
      .text(this.displayDate(chart.date), PAGE.margin, 101, { lineBreak: false });

    const details = [
      chart.user.name,
      `${this.compact(chart.user.weight)} ${chart.user.weightUnit}`,
      `${this.compact(chart.user.height)} ${chart.user.heightUnit}`,
      `${chart.user.age} years`,
    ].join('  |  ');
    document.text(details, PAGE.margin, 117, { lineBreak: false });
  }

  private drawMacroOverview(
    document: PDFKit.PDFDocument,
    chart: DietChartDocument,
    y: number,
  ) {
    const cards = [
      { label: 'CALORIES', unit: 'kcal', key: 'calories', color: COLORS.calories },
      { label: 'PROTEIN', unit: 'g', key: 'protein', color: COLORS.protein },
      { label: 'CARBS', unit: 'g', key: 'carbs', color: COLORS.carbs },
      { label: 'FATS', unit: 'g', key: 'fats', color: COLORS.fats },
    ] as const;
    const macroDistribution = this.macroDistribution(chart.totals);
    const distributionByKey: Partial<Record<keyof DietChartMacroValues, number>> = {
      protein: macroDistribution.find((item) => item.key === 'protein')?.percent ?? 0,
      carbs: macroDistribution.find((item) => item.key === 'carbs')?.percent ?? 0,
      fats: macroDistribution.find((item) => item.key === 'fats')?.percent ?? 0,
    };
    const sectionY = this.ensureSpace(document, y, 374);
    const gap = 10;
    const width = (PAGE.width - PAGE.margin * 2 - gap) / 2;
    const height = 96;
    const ringY = sectionY + 38;
    const ringHeight = 124;
    const cardsY = ringY + ringHeight + 14;

    document
      .fillColor(COLORS.ink)
      .font('Inter-Bold')
      .fontSize(11)
      .text('MACRO OVERVIEW', PAGE.margin, sectionY, {
        characterSpacing: 0.8,
        lineBreak: false,
      });
    document
      .fillColor(COLORS.muted)
      .font('Inter')
      .fontSize(7.5)
      .text('Amounts, targets, target progress, and distribution are combined here.', PAGE.margin, sectionY + 17, {
        lineBreak: false,
      });

    this.drawMacroCalorieSummary(document, macroDistribution, ringY, ringHeight);

    cards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const column = index % 2;
      const x = PAGE.margin + column * (width + gap);
      const cardY = cardsY + row * (height + gap);
      const consumed = chart.totals[card.key];
      const goal = chart.goals[card.key];
      const percentOfTarget = goal > 0 ? (consumed / goal) * 100 : 0;
      const ratio = Math.min(Math.max(percentOfTarget / 100, 0), 1);
      const distributionText =
        card.key === 'calories'
          ? 'Daily energy total'
          : `${this.compact(distributionByKey[card.key] ?? 0)}% of macro calories`;

      document.roundedRect(x, cardY, width, height, 8).fill(COLORS.canvas);
      document
        .fillColor(COLORS.muted)
        .font('Inter-Bold')
        .fontSize(7.5)
        .text(card.label, x + 12, cardY + 12, { characterSpacing: 0.7 });
      document
        .fillColor(COLORS.ink)
        .fontSize(15)
        .text(`${this.compact(consumed)} ${card.unit}`, x + 12, cardY + 29, { lineBreak: false });
      document.roundedRect(x + 10, cardY + 52, 112, 16, 4).fill(COLORS.brandSoft);
      document
        .fillColor(COLORS.brandDark)
        .font('Inter-Bold')
        .fontSize(7)
        .text(`TARGET  ${this.compact(goal)} ${card.unit}`, x + 14, cardY + 57, {
          width: 104,
          lineBreak: false,
        });
      document
        .fillColor(card.color)
        .font('Inter-Bold')
        .fontSize(9)
        .text(`${this.compact(percentOfTarget)}%`, x + width - 64, cardY + 56, {
          width: 48,
          align: 'right',
          lineBreak: false,
        });
      document.roundedRect(x + 12, cardY + 74, width - 24, 5, 2.5).fill(COLORS.line);
      if (ratio > 0) {
        document
          .roundedRect(x + 12, cardY + 74, (width - 24) * ratio, 5, 2.5)
          .fill(card.color);
      }
      document
        .fillColor(COLORS.muted)
        .font('Inter')
        .fontSize(7.2)
        .text(distributionText, x + 12, cardY + 84, {
          width: width - 24,
          lineBreak: false,
        });
    });

    return cardsY + height * 2 + gap;
  }

  private drawMacroCalorieSummary(
    document: PDFKit.PDFDocument,
    macroDistribution: ReturnType<DietChartPdfService['macroDistribution']>,
    y: number,
    height: number,
  ) {
    const width = PAGE.width - PAGE.margin * 2;
    const total = macroDistribution.reduce((sum, item) => sum + item.calories, 0);
    const dominant = macroDistribution.reduce(
      (winner, item) => (item.percent > winner.percent ? item : winner),
      macroDistribution[0],
    );
    const ringCenterX = PAGE.margin + 70;
    const ringCenterY = y + height / 2;
    const legendX = PAGE.margin + 148;
    const legendWidth = width - 172;

    document.roundedRect(PAGE.margin, y, width, height, 8).fill(COLORS.canvas);
    this.drawMacroCalorieRing(document, macroDistribution, ringCenterX, ringCenterY, 43, 13);

    document
      .fillColor(COLORS.ink)
      .font('Inter-Bold')
      .fontSize(15)
      .text(total > 0 ? `${this.compact(dominant.percent, 0)}%` : '0%', ringCenterX - 27, ringCenterY - 13, {
        width: 54,
        align: 'center',
        lineBreak: false,
      });
    document
      .fillColor(COLORS.muted)
      .font('Inter-Bold')
      .fontSize(6.8)
      .text(total > 0 ? dominant.label.toUpperCase() : 'NO MEALS', ringCenterX - 34, ringCenterY + 7, {
        width: 68,
        align: 'center',
        lineBreak: false,
      });

    document
      .fillColor(COLORS.ink)
      .font('Inter-Bold')
      .fontSize(10)
      .text('MACRO CALORIE SPLIT', legendX, y + 15, {
        characterSpacing: 0.6,
        lineBreak: false,
      });
    document
      .fillColor(COLORS.muted)
      .font('Inter')
      .fontSize(7.5)
      .text(
        total > 0
          ? `${this.compact(total)} kcal from protein, carbs, and fat`
          : 'Add meals to see calories from each macro.',
        legendX,
        y + 31,
        { width: legendWidth, lineBreak: false },
      );

    macroDistribution.forEach((item, index) => {
      const rowY = y + 54 + index * 20;
      const percent = Math.min(Math.max(item.percent, 0), 100);

      document.circle(legendX + 4, rowY + 5, 4).fill(item.color);
      document
        .fillColor(COLORS.ink)
        .font('Inter-Bold')
        .fontSize(8)
        .text(item.label, legendX + 15, rowY, {
          width: 82,
          lineBreak: false,
        });
      document.roundedRect(legendX + 98, rowY + 4, 124, 5, 2.5).fill(COLORS.line);
      if (percent > 0) {
        document
          .roundedRect(legendX + 98, rowY + 4, 124 * (percent / 100), 5, 2.5)
          .fill(item.color);
      }
      document
        .fillColor(COLORS.ink)
        .font('Inter-Bold')
        .fontSize(8)
        .text(`${this.compact(item.percent, 0)}%`, legendX + 232, rowY, {
          width: 36,
          align: 'right',
          lineBreak: false,
        });
      document
        .fillColor(COLORS.muted)
        .font('Inter')
        .fontSize(7.2)
        .text(`${this.compact(item.calories)} kcal  /  ${this.compact(item.grams)} g`, legendX + 278, rowY, {
          width: legendWidth - 278,
          align: 'right',
          lineBreak: false,
        });
    });
  }

  private drawMacroCalorieRing(
    document: PDFKit.PDFDocument,
    macroDistribution: ReturnType<DietChartPdfService['macroDistribution']>,
    centerX: number,
    centerY: number,
    radius: number,
    thickness: number,
  ) {
    const total = macroDistribution.reduce((sum, item) => sum + item.calories, 0);
    const arcDocument = document as PdfDocumentWithArc;

    document
      .circle(centerX, centerY, radius)
      .lineWidth(thickness)
      .lineCap('butt')
      .strokeColor(COLORS.line)
      .stroke();

    if (total > 0) {
      let angle = -90;
      macroDistribution.forEach((item) => {
        const sweep = (item.percent / 100) * 360;
        if (sweep <= 0) return;
        const gap = sweep > 7 ? 1.6 : 0;
        arcDocument
          .arc(centerX, centerY, radius, angle + gap, angle + sweep - gap, false)
          .lineWidth(thickness)
          .lineCap('butt')
          .strokeColor(item.color)
          .stroke();
        angle += sweep;
      });
    }

    document.circle(centerX, centerY, radius - thickness / 2 - 2).fill(COLORS.paper);
  }

  private drawMeals(document: PDFKit.PDFDocument, chart: DietChartDocument, y: number) {
    const meals = chart.meals.filter((meal) => meal.items.length > 0);
    if (meals.length === 0) {
      document.roundedRect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 82, 9).fill(COLORS.canvas);
      document
        .fillColor(COLORS.ink)
        .font('Inter-Bold')
        .fontSize(12)
        .text('No meals recorded', PAGE.margin + 18, y + 19);
      document
        .fillColor(COLORS.muted)
        .font('Inter')
        .fontSize(9)
        .text('Add meals to your diary and export this chart again.', PAGE.margin + 18, y + 42);
      return y + 82;
    }

    for (const meal of meals) {
      y = this.ensureSpace(document, y, 70);
      document.roundedRect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 29, 7).fill(COLORS.brandSoft);
      document
        .fillColor(COLORS.brandDark)
        .font('Inter-Bold')
        .fontSize(10)
        .text(meal.name.toUpperCase(), PAGE.margin + 12, y + 10, {
          characterSpacing: 0.7,
          lineBreak: false,
        });
      y += 36;
      y = this.drawTableHeader(document, y);

      meal.items.forEach((item, index) => {
        const nameHeight = document
          .font('Inter')
          .fontSize(8.5)
          .heightOfString(item.name, { width: 178 });
        const rowHeight = Math.max(27, Math.min(nameHeight + 12, 43));
        const nextY = this.ensureSpace(document, y, rowHeight + 5);
        if (nextY !== y) {
          y = this.drawTableHeader(document, nextY);
        }
        this.drawItemRow(document, item, y, rowHeight, index % 2 === 1);
        y += rowHeight;
      });
      y += 12;
    }

    return y;
  }

  private drawTableHeader(document: PDFKit.PDFDocument, y: number) {
    const labels = ['Food', 'Serving', 'Cal', 'Protein', 'Carbs', 'Fats'];
    const columns = this.columns();
    document.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 22).fill('#ECF2F1');
    labels.forEach((label, index) => {
      document
        .fillColor(COLORS.muted)
        .font('Inter-Bold')
        .fontSize(7.2)
        .text(label.toUpperCase(), columns[index].x + 6, y + 8, {
          width: columns[index].width - 12,
          align: index < 2 ? 'left' : 'right',
          lineBreak: false,
        });
    });
    return y + 22;
  }

  private drawItemRow(
    document: PDFKit.PDFDocument,
    item: DietChartItem,
    y: number,
    rowHeight: number,
    alternate: boolean,
  ) {
    const columns = this.columns();
    if (alternate) {
      document.rect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, rowHeight).fill('#FAFCFB');
    }
    document
      .fillColor(COLORS.ink)
      .font('Inter')
      .fontSize(8.5)
      .text(item.name, columns[0].x + 6, y + 8, {
        width: columns[0].width - 12,
        height: rowHeight - 10,
        ellipsis: true,
      });

    const values = [
      `${this.compact(item.quantity)} ${item.unit}`,
      this.compact(item.macros.calories),
      `${this.compact(item.macros.protein)} g`,
      `${this.compact(item.macros.carbs)} g`,
      `${this.compact(item.macros.fats)} g`,
    ];
    values.forEach((value, index) => {
      const column = columns[index + 1];
      document.text(value, column.x + 6, y + 9, {
        width: column.width - 12,
        align: index === 0 ? 'left' : 'right',
        lineBreak: false,
      });
    });
    document
      .moveTo(PAGE.margin, y + rowHeight)
      .lineTo(PAGE.width - PAGE.margin, y + rowHeight)
      .strokeColor(COLORS.line)
      .lineWidth(0.5)
      .stroke();
  }

  private drawCompleteNutrition(
    document: PDFKit.PDFDocument,
    totals: DietChartNutritionTotals,
    requestedY: number,
  ) {
    let y = this.ensureSpace(document, requestedY, 104);
    document
      .fillColor(COLORS.ink)
      .font('Inter-Bold')
      .fontSize(11)
      .text('OTHER NUTRITION TOTALS', PAGE.margin, y, {
        characterSpacing: 0.8,
        lineBreak: false,
      });
    document
      .fillColor(COLORS.muted)
      .font('Inter')
      .fontSize(7.5)
      .text('Fiber, net carbs, vitamins, and minerals recorded for this day', PAGE.margin, y + 17, {
        lineBreak: false,
      });

    const detailY = y + 38;
    const detailWidth = (PAGE.width - PAGE.margin * 2 - 10) / 2;
    [
      { label: 'Dietary fiber', value: totals.fiber },
      { label: 'Net carbs', value: totals.netCarbs },
    ].forEach((item, index) => {
      const x = PAGE.margin + index * (detailWidth + 10);
      document.roundedRect(x, detailY, detailWidth, 54, 7).fill(COLORS.brandSoft);
      document
        .fillColor(COLORS.brandDark)
        .font('Inter-Bold')
        .fontSize(8)
        .text(item.label.toUpperCase(), x + 12, detailY + 11, { lineBreak: false });
      document
        .fillColor(COLORS.ink)
        .fontSize(14)
        .text(`${this.compact(item.value)} g`, x + 12, detailY + 28, { lineBreak: false });
    });
    y = detailY + 68;
    y = this.drawNutrientGroup(
      document,
      'VITAMINS',
      VITAMIN_ENTRIES,
      totals.vitamins as unknown as Record<string, number>,
      y,
    );
    this.drawNutrientGroup(
      document,
      'MINERALS',
      MINERAL_ENTRIES,
      totals.minerals as unknown as Record<string, number>,
      y + 14,
    );
  }

  private drawNutrientGroup(
    document: PDFKit.PDFDocument,
    title: string,
    entries: ReadonlyArray<{ key: string; label: string; unit: string }>,
    values: Record<string, number>,
    requestedY: number,
  ) {
    const columns = 3;
    const rows = Math.ceil(entries.length / columns);
    const rowHeight = 29;
    const height = 31 + rows * rowHeight;
    const y = this.ensureSpace(document, requestedY, height);
    document
      .fillColor(COLORS.brandDark)
      .font('Inter-Bold')
      .fontSize(9)
      .text(title, PAGE.margin, y, { characterSpacing: 0.8, lineBreak: false });

    const gap = 8;
    const width = (PAGE.width - PAGE.margin * 2 - gap * (columns - 1)) / columns;
    entries.forEach((entry, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = PAGE.margin + column * (width + gap);
      const itemY = y + 22 + row * rowHeight;
      document
        .roundedRect(x, itemY, width, 23, 4)
        .fill(row % 2 === 0 ? COLORS.canvas : '#FAFCFB');
      document
        .fillColor(COLORS.muted)
        .font('Inter')
        .fontSize(7.2)
        .text(entry.label, x + 7, itemY + 8, {
          width: width * 0.57,
          lineBreak: false,
        });
      document
        .fillColor(COLORS.ink)
        .font('Inter-Bold')
        .text(`${this.compact(values[entry.key] ?? 0)} ${entry.unit}`, x + width * 0.55, itemY + 8, {
          width: width * 0.4 - 7,
          align: 'right',
          lineBreak: false,
        });
    });
    return y + height;
  }

  private drawPageFooter(document: PDFKit.PDFDocument, pageNumber: number) {
    document
      .moveTo(PAGE.margin, PAGE.footerTop - 9)
      .lineTo(PAGE.width - PAGE.margin, PAGE.footerTop - 9)
      .strokeColor(COLORS.line)
      .lineWidth(0.5)
      .stroke();
    document
      .fillColor(COLORS.muted)
      .font('Inter')
      .fontSize(7.5)
      .text(`Page ${pageNumber}`, PAGE.width - 110, PAGE.footerTop, {
        width: 70,
        height: 10,
        align: 'right',
        lineBreak: false,
      });
  }

  private ensureSpace(document: PDFKit.PDFDocument, y: number, height: number) {
    if (y + height <= PAGE.footerTop - 18) return y;
    this.drawPageFooter(document, document.bufferedPageRange().count);
    document.addPage();
    document
      .fillColor(COLORS.brandDark)
      .font('Inter-Bold')
      .fontSize(9)
      .text('LOSE TO GAIN  /  DIET CHART', PAGE.margin, 42, {
        characterSpacing: 1,
        lineBreak: false,
      });
    document
      .moveTo(PAGE.margin, 60)
      .lineTo(PAGE.width - PAGE.margin, 60)
      .strokeColor(COLORS.line)
      .lineWidth(0.7)
      .stroke();
    return 74;
  }

  private columns() {
    const widths = [190, 72, 57, 66, 64, 66];
    let x = PAGE.margin;
    return widths.map((width) => {
      const column = { x, width };
      x += width;
      return column;
    });
  }

  private compact(value: number, maximumFractionDigits = 1) {
    if (!Number.isFinite(value)) return '0';
    return value.toLocaleString('en-US', { maximumFractionDigits });
  }

  private macroDistribution(totals: DietChartMacroValues) {
    const values = [
      { key: 'protein', label: 'Protein', grams: totals.protein, calories: totals.protein * 4, color: COLORS.protein },
      { key: 'carbs', label: 'Carbohydrates', grams: totals.carbs, calories: totals.carbs * 4, color: COLORS.carbs },
      { key: 'fats', label: 'Fats', grams: totals.fats, calories: totals.fats * 9, color: COLORS.fats },
    ];
    const total = values.reduce((sum, item) => sum + item.calories, 0);
    return values.map((item) => ({
      ...item,
      percent: total > 0 ? (item.calories / total) * 100 : 0,
    }));
  }

  private displayDate(date: string) {
    const parsed = new Date(`${date}T00:00:00Z`);
    return Number.isNaN(parsed.valueOf())
      ? date
      : parsed.toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        });
  }

}
