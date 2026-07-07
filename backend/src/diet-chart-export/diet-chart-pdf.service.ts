import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import {
  DietChartDocument,
  DietChartItem,
  DietChartMacroValues,
} from './diet-chart.types';

const COLORS = {
  ink: '#172B2A',
  muted: '#657473',
  brand: '#0F766E',
  brandDark: '#115E59',
  brandSoft: '#DFF4F0',
  paper: '#FFFFFF',
  canvas: '#F5F8F7',
  line: '#DDE7E5',
  calories: '#F59E0B',
  protein: '#0EA5E9',
  carbs: '#8B5CF6',
  fats: '#F97316',
} as const;

const PAGE = { width: 595.28, height: 841.89, margin: 40, footerTop: 776 };
const FONT_REGULAR = require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff');
const FONT_BOLD = require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff');

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
    let y = 172;
    y = this.drawMacroCards(document, chart, y);
    y = this.drawMeals(document, chart, y + 22);
    y = this.drawTotalBar(document, chart.totals, y + 12);
    this.drawNutritionDistribution(document, chart.totals, y + 14);
    this.drawFooters(document);
  }

  private drawHero(document: PDFKit.PDFDocument, chart: DietChartDocument) {
    document.rect(0, 0, PAGE.width, 138).fill(COLORS.brandDark);
    document.circle(534, 20, 70).fill('#147A72');
    document.circle(566, 116, 48).fill('#0D514D');

    document
      .fillColor(COLORS.paper)
      .font('Inter-Bold')
      .fontSize(10)
      .text('LOSE TO GAIN', PAGE.margin, 34, { characterSpacing: 1.7 });
    document
      .fontSize(27)
      .text('Your daily diet chart', PAGE.margin, 53, { lineBreak: false });
    document
      .fillColor('#CDE9E5')
      .font('Inter')
      .fontSize(10)
      .text(this.displayDate(chart.date), PAGE.margin, 91, { lineBreak: false });

    const details = [
      chart.user.name,
      `${this.compact(chart.user.weight)} ${chart.user.weightUnit}`,
      `${this.compact(chart.user.height)} ${chart.user.heightUnit}`,
      `${chart.user.age} years`,
    ].join('  |  ');
    document.text(details, PAGE.margin, 108, { lineBreak: false });
  }

  private drawMacroCards(
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
    const gap = 8;
    const width = (PAGE.width - PAGE.margin * 2 - gap * 3) / 4;

    cards.forEach((card, index) => {
      const x = PAGE.margin + index * (width + gap);
      const consumed = chart.totals[card.key];
      const goal = chart.goals[card.key];
      const ratio = goal > 0 ? Math.min(consumed / goal, 1) : 0;

      document.roundedRect(x, y, width, 78, 8).fill(COLORS.canvas);
      document
        .fillColor(COLORS.muted)
        .font('Inter-Bold')
        .fontSize(7.5)
        .text(card.label, x + 12, y + 12, { characterSpacing: 0.7 });
      document
        .fillColor(COLORS.ink)
        .fontSize(15)
        .text(this.compact(consumed), x + 12, y + 28, { lineBreak: false });
      document
        .fillColor(COLORS.muted)
        .font('Inter')
        .fontSize(7.5)
        .text(`/ ${this.compact(goal)} ${card.unit}`, x + 12, y + 47, {
          lineBreak: false,
        });
      document.roundedRect(x + 12, y + 63, width - 24, 4, 2).fill(COLORS.line);
      if (ratio > 0) {
        document
          .roundedRect(x + 12, y + 63, (width - 24) * ratio, 4, 2)
          .fill(card.color);
      }
    });

    return y + 78;
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

  private drawTotalBar(
    document: PDFKit.PDFDocument,
    totals: DietChartMacroValues,
    requestedY: number,
  ) {
    const y = this.ensureSpace(document, requestedY, 58);
    document.roundedRect(PAGE.margin, y, PAGE.width - PAGE.margin * 2, 50, 8).fill(COLORS.ink);
    document
      .fillColor(COLORS.paper)
      .font('Inter-Bold')
      .fontSize(10)
      .text('DAILY TOTAL', PAGE.margin + 15, y + 20, { lineBreak: false });

    const summary = [
      `${this.compact(totals.calories)} kcal`,
      `${this.compact(totals.protein)} g protein`,
      `${this.compact(totals.carbs)} g carbs`,
      `${this.compact(totals.fats)} g fats`,
    ].join('   |   ');
    document
      .font('Inter')
      .fontSize(8.5)
      .text(summary, 165, y + 21, {
        width: PAGE.width - PAGE.margin - 180,
        align: 'right',
        lineBreak: false,
      });
    return y + 50;
  }

  private drawNutritionDistribution(
    document: PDFKit.PDFDocument,
    totals: DietChartMacroValues,
    requestedY: number,
  ) {
    const y = this.ensureSpace(document, requestedY, 116);
    const distribution = this.macroDistribution(totals);

    document
      .fillColor(COLORS.ink)
      .font('Inter-Bold')
      .fontSize(11)
      .text('NUTRITION DISTRIBUTION', PAGE.margin, y, {
        characterSpacing: 0.8,
        lineBreak: false,
      });
    document
      .fillColor(COLORS.muted)
      .font('Inter')
      .fontSize(7.5)
      .text('Share of macro-derived calories', PAGE.margin, y + 17, {
        lineBreak: false,
      });

    const gap = 10;
    const cardY = y + 38;
    const width = (PAGE.width - PAGE.margin * 2 - gap * 2) / 3;
    distribution.forEach((item, index) => {
      const x = PAGE.margin + index * (width + gap);
      document.roundedRect(x, cardY, width, 68, 8).fill(COLORS.canvas);
      document
        .fillColor(item.color)
        .font('Inter-Bold')
        .fontSize(16)
        .text(`${this.compact(item.percent)}%`, x + 12, cardY + 11, {
          lineBreak: false,
        });
      document
        .fillColor(COLORS.ink)
        .fontSize(8)
        .text(item.label.toUpperCase(), x + 12, cardY + 33, {
          characterSpacing: 0.5,
          lineBreak: false,
        });
      document
        .fillColor(COLORS.muted)
        .font('Inter')
        .fontSize(7.5)
        .text(`${this.compact(item.calories)} kcal from ${this.compact(item.grams)} g`, x + 12, cardY + 49, {
          width: width - 24,
          lineBreak: false,
        });
    });
  }

  private drawFooters(document: PDFKit.PDFDocument) {
    const range = document.bufferedPageRange();
    for (let index = range.start; index < range.start + range.count; index += 1) {
      document.switchToPage(index);
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
        .text(`Page ${index + 1} of ${range.count}`, PAGE.width - 110, PAGE.footerTop, {
          width: 70,
          height: 10,
          align: 'right',
          lineBreak: false,
        });
    }
  }

  private ensureSpace(document: PDFKit.PDFDocument, y: number, height: number) {
    if (y + height <= PAGE.footerTop - 18) return y;
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

  private compact(value: number) {
    if (!Number.isFinite(value)) return '0';
    return value.toLocaleString('en-US', { maximumFractionDigits: 1 });
  }

  private macroDistribution(totals: DietChartMacroValues) {
    const values = [
      { label: 'Protein', grams: totals.protein, calories: totals.protein * 4, color: COLORS.protein },
      { label: 'Carbohydrates', grams: totals.carbs, calories: totals.carbs * 4, color: COLORS.carbs },
      { label: 'Fats', grams: totals.fats, calories: totals.fats * 9, color: COLORS.fats },
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
