import React from 'react';
import { BridgeResult } from '../../lib/types';
import { formatCurrency } from '../../lib/bridge-logic';
import { clsx } from 'clsx';

interface PLSummaryProps {
    data: BridgeResult;
    yearMonth: string;
    siteName: string;
    modeLabel: string;
}

const Row = ({
    label,
    baseVal,
    nowVal,
    bold = false,
    isCost = false // If true, positive diff is bad (red)
}: {
    label: string,
    baseVal: number,
    nowVal: number,
    bold?: boolean,
    isCost?: boolean
}) => {
    const diff = nowVal - baseVal;
    let ratio = baseVal !== 0 ? (diff / baseVal * 100).toFixed(1) + '%' : '-';
    if (baseVal === 0 && diff === 0) ratio = '-';

    // Good/Bad color logic
    const isBad = isCost ? diff > 0 : diff < 0;
    // If no diff, gray.
    const colorClass = diff === 0 ? 'text-gray-500' : (isBad ? 'text-red-600 font-bold' : 'text-green-600 font-bold');

    return (
        <tr className={clsx("border-b border-gray-200", bold ? "bg-gray-50 font-bold" : "")}>
            <td className="py-2 px-4 text-left">{label}</td>
            <td className="py-2 px-4 text-right">{formatCurrency(baseVal)}</td>
            <td className="py-2 px-4 text-right">{formatCurrency(nowVal)}</td>
            <td className={clsx("py-2 px-4 text-right", colorClass)}>
                {diff > 0 ? '+' : ''}{formatCurrency(diff)}
            </td>
            <td className={clsx("py-2 px-4 text-right", colorClass)}>
                {ratio}
            </td>
        </tr>
    );
};

export const PLSummary: React.FC<PLSummaryProps> = ({ data, yearMonth, siteName, modeLabel }) => {
    const { base, now } = data;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 aspect-[297/210] flex flex-col relative w-full max-w-5xl mx-auto mb-8 print:break-after-page print:shadow-none print:border-none print:aspect-auto print:h-auto print:p-4">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-400 pb-2 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                        月次PLサマリー
                    </h2>
                    <div className="text-lg text-gray-600">
                        （今月 vs {modeLabel}）
                    </div>
                </div>

                <div className="flex gap-4 items-end">
                    {/* Mini Summary integrated here */}
                    <div className="p-2 bg-blue-50 border border-blue-100 rounded text-right shadow-sm hidden md:block">
                        <div className="text-xs text-gray-500">営業利益差分</div>
                        <div className={clsx("text-lg font-bold", data.delta.op >= 0 ? 'text-green-600' : 'text-red-600')}>
                            {data.delta.op > 0 ? '+' : ''}{formatCurrency(data.delta.op)}
                            <span className="text-xs text-gray-400 font-normal ml-1">千円</span>
                        </div>
                    </div>

                    <div className="text-right text-sm text-gray-600">
                        <div className="font-bold mb-1">{siteName || '拠点名なし'}</div>
                        <div>{yearMonth} / Unit: 千円</div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="py-2 px-4 text-left w-1/4">費目</th>
                            <th className="py-2 px-4 text-right w-1/6">比較対象</th>
                            <th className="py-2 px-4 text-right w-1/6">今月実績</th>
                            <th className="py-2 px-4 text-right w-1/6">差分</th>
                            <th className="py-2 px-4 text-right w-1/6">増減率</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Row label="売上" baseVal={base.items.sales} nowVal={now.items.sales} bold />
                        <Row label="材料費" baseVal={base.items.materialCost} nowVal={now.items.materialCost} isCost />
                        <Row label="消耗品費" baseVal={base.items.consumablesCost} nowVal={now.items.consumablesCost} isCost />
                        <Row label="輸送費" baseVal={base.items.transportCost} nowVal={now.items.transportCost} isCost />
                        <Row label="労務費" baseVal={base.items.laborCost} nowVal={now.items.laborCost} isCost />
                        <Row label="償却費" baseVal={base.items.depreciationCost} nowVal={now.items.depreciationCost} isCost />
                        <Row label="その他固定経費" baseVal={base.items.otherFixedCost} nowVal={now.items.otherFixedCost} isCost />
                        <Row label="販管費" baseVal={base.items.sgaCost} nowVal={now.items.sgaCost} isCost />
                        <Row label="営業利益" baseVal={base.op} nowVal={now.op} bold />
                    </tbody>
                </table>
            </div>

            <div className="absolute bottom-4 left-6 text-xs text-gray-400">
                ※増加＝悪化となる費用項目は差分が赤字になります
            </div>
        </div>
    );
};
