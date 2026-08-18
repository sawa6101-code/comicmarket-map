export type CircleStatus = "UNVISITED" | "COMPLETED" | "SOLD_OUT";

export interface PurchaseItem {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
}

export interface CircleData {
  id: string;
  day: string;
  space: string;
  name: string;
  purchaser: string;
  status: CircleStatus;
  x: number;
  y: number;
  purchases: PurchaseItem[];
}

export const circleTotal = (circle: CircleData) =>
  circle.purchases.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);

export const allPurchaseTotal = (circles: CircleData[]) =>
  circles.reduce((sum, c) => sum + circleTotal(c), 0);