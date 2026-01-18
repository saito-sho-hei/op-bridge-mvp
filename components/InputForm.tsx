'use client';

import React, { useState } from 'react';
import { FinancialData, BridgeResult, WaterfallItem } from '../lib/types';
import { calculateBridge } from '../lib/bridge-logic';
import { NumberInput } from './NumberInput';
import { useRef } from 'react';
import { PLSummary } from './Reports/PLSummary';
import { Waterfall } from './Reports/Waterfall';


const initialData: FinancialData = {
    sales: 0,
    materialCost: 0,
    consumablesCost: 0,
    transportCost: 0,
    laborCost: 0,
    depreciationCost: 0,
    otherFixedCost: 0,
    sgaCost: 0,
};

export default function InputForm() {
    const [baseMode, setBaseMode] = useState<'prev' | 'target'>('prev');
    const [baseData, setBaseData] = useState<FinancialData>(initialData);
    const [nowData, setNowData] = useState<FinancialData>(initialData);
    // Metadata
    const [yearMonth, setYearMonth] = useState('2026-01');
    const [siteName, setSiteName] = useState('');

    // Validation State
    const [errors, setErrors] = useState<string[]>([]);
    const [result, setResult] = useState<BridgeResult | null>(null);

    const updateData = (
        target: 'base' | 'now',
        field: keyof FinancialData,
        val: number
    ) => {
        const setter = target === 'base' ? setBaseData : setNowData;
        setter((prev) => ({ ...prev, [field]: val }));
    };

    const validate = (): boolean => {
        const errs: string[] = [];
        // SiteName is optional now
        // if (!siteName) errs.push('拠点名を入力してください');

        // Required fields check: sales, material, labor, sga
        // Spec: "必須4項目が空欄（0）の場合は送信不可"
        const checkRequired = (d: FinancialData, labelPrefix: string) => {
            if (d.sales === 0) errs.push(`${labelPrefix}売上が未入力です`);
            if (d.materialCost === 0) errs.push(`${labelPrefix}材料費が未入力です`);
            if (d.laborCost === 0) errs.push(`${labelPrefix}労務費が未入力です`);
            if (d.sgaCost === 0) errs.push(`${labelPrefix}販管費が未入力です`);
        };

        checkRequired(nowData, '今月の');
        checkRequired(baseData, baseMode === 'prev' ? '前月の' : '目標の');

        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;

        const calcResult = calculateBridge(baseData, nowData);
        setResult(calcResult);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('reports-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const renderRow = (label: string, field: keyof FinancialData, required = false) => (
        <div className="grid grid-cols-12 gap-4 items-center mb-2">
            <div className="col-span-4 text-sm font-medium text-gray-700 flex items-center">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </div>
            <div className="col-span-4">
                <NumberInput
                    value={baseData[field]}
                    onChange={(v) => updateData('base', field, v)}
                    placeholder="0"
                    className={required && baseData[field] === 0 ? "border-red-300 bg-red-50" : ""}
                />
            </div>
            <div className="col-span-4">
                <NumberInput
                    value={nowData[field]}
                    onChange={(v) => updateData('now', field, v)}
                    placeholder="0"
                    className={required && nowData[field] === 0 ? "border-red-300 bg-red-50" : ""}
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-0 pb-20 print:pb-0">
            <div className="bg-white shadow-lg rounded-xl my-10 border border-gray-100 p-6 print:hidden">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                    営業利益ブリッジ作成 (MVP)
                </h1>

                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">対象月</label>
                        <input
                            type="month"
                            value={yearMonth}
                            onChange={(e) => setYearMonth(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">拠点名 <span className="text-gray-400 font-normal text-xs">(任意)</span></label>
                        <input
                            type="text"
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            placeholder="例：東京工場"
                            className="w-full rounded-md border-gray-300 shadow-sm px-3 py-2 border focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="mb-6 flex space-x-6 bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="mode"
                            checked={baseMode === 'prev'}
                            onChange={() => setBaseMode('prev')}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900">前月比</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="mode"
                            checked={baseMode === 'target'}
                            onChange={() => setBaseMode('target')}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-900">目標比</span>
                    </label>
                </div>

                {/* Main Form */}
                <div className="mb-8">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 mb-2 text-center text-sm font-bold text-gray-500 border-b pb-2">
                        <div className="col-span-4 text-left pl-2">費目 (単位: 千円)</div>
                        <div className="col-span-4">{baseMode === 'prev' ? '前月' : '目標'}</div>
                        <div className="col-span-4">今月</div>
                    </div>

                    {/* Rows */}
                    {renderRow('売上', 'sales', true)}
                    <div className="my-4 border-t border-gray-100"></div>
                    {renderRow('材料費', 'materialCost', true)}
                    {renderRow('消耗品費', 'consumablesCost')}
                    {renderRow('輸送費', 'transportCost')}
                    {renderRow('労務費', 'laborCost', true)}
                    {renderRow('償却費', 'depreciationCost')}
                    {renderRow('その他固定経費', 'otherFixedCost')}
                    {renderRow('販管費', 'sgaCost', true)}
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="text-red-700 font-bold">入力等のエラーがあります</div>
                        <ul className="list-disc pl-5 text-sm text-red-600 mt-1">
                            {errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </div>
                )}

                {/* Action */}
                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:-translate-y-0.5"
                    >
                        レポートを作成する
                    </button>
                    <div className="mt-2 text-xs text-gray-500">
                        ※画面下部にレポートが表示されます（印刷はブラウザ機能をご利用ください）
                    </div>
                </div>
            </div>

            {/* Success Area */}
            {result && (
                <div id="reports-section" className="animate-fade-in mt-12 bg-gray-50 p-4 border-t-4 border-blue-500 print:mt-0 print:bg-white print:p-0 print:border-none">
                    <div className="flex justify-between items-center mb-6 print:hidden">
                        <h2 className="text-xl font-bold text-gray-800">
                            生成レポート
                        </h2>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            印刷 / PDF保存
                        </button>
                    </div>

                    <PLSummary
                        data={result}
                        yearMonth={yearMonth}
                        siteName={siteName}
                        modeLabel={baseMode === 'prev' ? '前月比' : '目標比'}
                    />

                    <Waterfall
                        data={result}
                        yearMonth={yearMonth}
                        siteName={siteName}
                    />
                </div>
            )}
        </div>
    );
}
