export interface FinancialData {
  sales: number;
  materialCost: number;     // 材料費
  consumablesCost: number;  // 消耗品費 (Optional in UI)
  transportCost: number;    // 輸送費 (Optional in UI)
  laborCost: number;        // 労務費
  depreciationCost: number; // 償却費 (Optional in UI)
  otherFixedCost: number;   // その他固定経費 (Optional in UI)
  sgaCost: number;          // 販管費
  // Operating Profit is calculated, not input
}

export interface BridgeResult {
  base: {
    op: number;
    items: FinancialData;
  };
  now: {
    op: number;
    items: FinancialData;
  };
  delta: {
    sales: number;
    materialCost: number;
    consumablesCost: number;
    transportCost: number;
    laborCost: number;
    depreciationCost: number;
    otherFixedCost: number;
    sgaCost: number;
    op: number;
  };
  waterfall: WaterfallItem[];
}

export interface WaterfallItem {
  label: string;
  value: number; // The amount to add/subtract in the chart (Impact on OP)
  start: number; // Starting Y position for the bar (accumulated).
  end: number;   // Ending Y position.
  isTotal: boolean; // True for Base OP and Now OP bars
  color?: string; // 'green', 'red', 'gray'
}
