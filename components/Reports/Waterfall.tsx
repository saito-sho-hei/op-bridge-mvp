import React from 'react';
import { BridgeResult } from '../../lib/types';
import { formatCurrency } from '../../lib/bridge-logic';

interface WaterfallProps {
    data: BridgeResult;
    yearMonth: string;
    siteName: string;
}

export const Waterfall: React.FC<WaterfallProps> = ({ data, yearMonth, siteName }) => {
    const { waterfall } = data;

    // Chart Dimensions
    const width = 800;
    const height = 400;
    const padding = { top: 40, right: 30, bottom: 60, left: 60 };

    // Scale Y
    let minVal = 0;
    let maxVal = 0;
    waterfall.forEach(item => {
        minVal = Math.min(minVal, item.start, item.end);
        maxVal = Math.max(maxVal, item.start, item.end);
    });

    const range = maxVal - minVal;
    const safeRange = range === 0 ? 1000 : range;
    const buffer = safeRange * 0.1;
    const yMax = Math.max(maxVal + buffer, 0);
    const yMin = Math.min(minVal - buffer, 0);
    const plotHeight = height - padding.top - padding.bottom;
    const plotRange = yMax - yMin;

    const getY = (val: number) => {
        const pct = (val - yMin) / plotRange;
        return height - padding.bottom - (pct * plotHeight);
    };

    const zeroY = getY(0);

    // Scale X
    const plotWidth = width - padding.left - padding.right;
    const count = waterfall.length;
    const step = plotWidth / count;
    const barWidth = step * 0.7;

    // Comments Logic
    interface Factor { label: string; impact: number; }
    const impacts = waterfall.filter(i => !i.isTotal).map(i => ({ label: i.label, impact: i.value }));
    const badFactors = impacts.filter(i => i.impact < 0).sort((a, b) => a.impact - b.impact).slice(0, 2);
    const goodFactors = impacts.filter(i => i.impact > 0).sort((a, b) => b.impact - a.impact).slice(0, 1);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 aspect-[297/210] flex flex-col relative w-full max-w-5xl mx-auto mb-8 print:shadow-none print:border-none print:aspect-auto print:h-auto print:p-4">
            {/* Header */}
            <div className="flex justify-between items-end border-b-2 border-gray-400 pb-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    営業利益ブリッジ（差分ウォーターフォール）
                </h2>
                <div className="text-right text-sm text-gray-600">
                    <div>{siteName || '拠点名なし'}</div>
                    <div>{yearMonth}</div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-grow flex items-center justify-center">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[500px]">
                    {/* Y Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                        const val = yMin + (plotRange * pct);
                        const y = getY(val);
                        return (
                            <g key={pct}>
                                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                                <text x={padding.left - 10} y={y + 4} fontSize="10" textAnchor="end" fill="#999">
                                    {val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(0) + 'k'}
                                </text>
                            </g>
                        );
                    })}

                    {/* Zero Line */}
                    <line
                        x1={padding.left} y1={zeroY}
                        x2={width - padding.right} y2={zeroY}
                        stroke="#666" strokeWidth="1"
                    />

                    {/* Bars */}
                    {waterfall.map((item, i) => {
                        const x = padding.left + (i * step) + (step - barWidth) / 2;
                        const yTop = getY(Math.max(item.start, item.end));
                        const yBottom = getY(Math.min(item.start, item.end));
                        const h = Math.max(Math.abs(yBottom - yTop), 1); // Min height 1px

                        const color = item.color === 'green' ? '#22c55e' :
                            item.color === 'red' ? '#ef4444' :
                                item.color === 'blue' ? '#3b82f6' : '#9ca3af';

                        return (
                            <g key={i}>
                                <rect x={x} y={yTop} width={barWidth} height={h} fill={color} rx="2" />
                                {/* Connector */}
                                {i < waterfall.length - 1 && (
                                    <line
                                        x1={x + barWidth}
                                        y1={getY(item.end)}
                                        x2={x + barWidth + (step - barWidth) + (step - barWidth) / 2}
                                        y2={getY(item.end)}
                                        stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2"
                                    />
                                )}
                                {/* Labels */}
                                <text x={x + barWidth / 2} y={height - 20} fontSize="11" textAnchor="middle" fill="#374151" fontWeight="bold">
                                    {item.label}
                                </text>
                                <text x={x + barWidth / 2} y={yTop - 6} fontSize="10" textAnchor="middle" fill="#1f2937">
                                    {formatCurrency(item.value)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Comments Footer */}
            <div className="mt-4 flex gap-4 h-24">
                <div className="w-1/2 bg-red-50 p-3 rounded border border-red-100">
                    <div className="text-red-800 font-bold text-xs mb-1">▼ 主要な悪化要因</div>
                    {badFactors.length > 0 ? badFactors.map((f, i) => (
                        <div key={i} className="text-sm text-red-700 mb-1">
                            ・{f.label}が{formatCurrency(Math.abs(f.impact))}千円の押し下げ要因である可能性。
                        </div>
                    )) : <div className="text-gray-400 text-xs">特になし</div>}
                </div>
                <div className="w-1/2 bg-green-50 p-3 rounded border border-green-100">
                    <div className="text-green-800 font-bold text-xs mb-1">▲ 主要な改善要因</div>
                    {goodFactors.length > 0 ? goodFactors.map((f, i) => (
                        <div key={i} className="text-sm text-green-700 mb-1">
                            ・{f.label}が{formatCurrency(f.impact)}千円の増益に寄与したことが示唆されます。
                        </div>
                    )) : <div className="text-gray-400 text-xs">特になし</div>}
                </div>
            </div>
        </div>
    );
};
