import { FinancialData, BridgeResult, WaterfallItem } from './types';

// Helper to calculate OP
export const calculateOP = (data: FinancialData): number => {
    const costs =
        data.materialCost +
        data.consumablesCost +
        data.transportCost +
        data.laborCost +
        data.depreciationCost +
        data.otherFixedCost +
        data.sgaCost;
    return data.sales - costs;
};

// Main Bridge Calculation
export const calculateBridge = (base: FinancialData, now: FinancialData): BridgeResult => {
    const baseOP = calculateOP(base);
    const nowOP = calculateOP(now);

    const delta = {
        sales: now.sales - base.sales,
        materialCost: now.materialCost - base.materialCost,
        consumablesCost: now.consumablesCost - base.consumablesCost,
        transportCost: now.transportCost - base.transportCost,
        laborCost: now.laborCost - base.laborCost,
        depreciationCost: now.depreciationCost - base.depreciationCost,
        otherFixedCost: now.otherFixedCost - base.otherFixedCost,
        sgaCost: now.sgaCost - base.sgaCost,
        op: nowOP - baseOP,
    };

    // Waterfall Items
    // Order: Base OP -> Sales -> Costs... -> Now OP
    // For costs, a positive delta (cost increase) means NEGATIVE impact on profit.
    // So we negate cost deltas for the waterfall value.

    const items: WaterfallItem[] = [];
    let currentY = 0;

    // 1. Base OP
    items.push({
        label: '比較OP',
        value: baseOP,
        start: 0,
        end: baseOP,
        isTotal: true,
        color: 'gray',
    });
    currentY = baseOP;

    // 2. Sales Impact
    const salesImpact = delta.sales;
    items.push({
        label: '売上',
        value: salesImpact,
        start: currentY,
        end: currentY + salesImpact,
        isTotal: false,
        color: salesImpact >= 0 ? 'green' : 'red',
    });
    currentY += salesImpact;

    // 3. Costs Impact (Negate the delta)
    const costImpacts = [
        { key: 'materialCost', label: '材料費' },
        { key: 'consumablesCost', label: '消耗品' },
        { key: 'transportCost', label: '輸送費' },
        { key: 'laborCost', label: '労務費' },
        { key: 'depreciationCost', label: '償却費' },
        { key: 'otherFixedCost', label: '固定経費' },
        { key: 'sgaCost', label: '販管費' },
    ] as const;

    costImpacts.forEach(({ key, label }) => {
        const impact = -delta[key]; // Increase in cost is decrease in profit
        items.push({
            label,
            value: impact,
            start: currentY,
            end: currentY + impact,
            isTotal: false,
            color: impact >= 0 ? 'green' : 'red', // Positive impact (cost reduction) is green
        });
        currentY += impact;
    });

    // Verify consistency
    // currentY should match nowOP (allowing for minute float errors, but integers here)
    // For safety, we force the last bar to be Now OP

    // 4. Now OP
    items.push({
        label: '今月OP',
        value: nowOP,
        start: 0,
        end: nowOP, // Total bars usually start from 0
        isTotal: true, // Specific flag for chart rendering to know it anchors to 0
        color: nowOP >= 0 ? 'blue' : 'red',
    });

    return {
        base: { op: baseOP, items: base },
        now: { op: nowOP, items: now },
        delta,
        waterfall: items,
    };
};

export const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US');
};
