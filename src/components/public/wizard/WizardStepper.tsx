"use client";

import React from "react";
import { Check } from "lucide-react";

export type WizardStep = "cart" | "dates" | "delivery" | "contact" | "summary";

export interface StepDefinition {
    id: WizardStep;
    label: string;
}

interface WizardStepperProps {
    currentStep: WizardStep;
    steps: StepDefinition[];
    onStepClick: (step: WizardStep) => void;
    isStepCompleted: (step: WizardStep) => boolean;
    isStepSelectable: (step: WizardStep) => boolean;
}

export function WizardStepper({
    currentStep,
    steps,
    onStepClick,
    isStepCompleted,
    isStepSelectable,
}: WizardStepperProps) {
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    return (
        <div className="w-full">
            {/* Desktop and Tablet Stepper */}
            <div className="hidden md:flex items-center justify-between w-full relative mb-10">
                {/* Connecting Line background */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

                {steps.map((step, idx) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = isStepCompleted(step.id);
                    const isSelectable = isStepSelectable(step.id);

                    return (
                        <div
                            key={step.id}
                            className={`flex flex-col items-center z-10 flex-1 relative ${
                                isSelectable ? "cursor-pointer group" : "cursor-not-allowed"
                            }`}
                            onClick={() => isSelectable && onStepClick(step.id)}
                        >
                            {/* Circle */}
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                                    isActive
                                        ? "bg-[#066bb7] border-[#066bb7] text-white shadow-lg shadow-blue-500/20 scale-110"
                                        : isCompleted
                                        ? "bg-[#45b854] border-[#45b854] text-white"
                                        : "bg-white border-slate-300 text-slate-400 group-hover:border-slate-400"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <span className="font-['Fredoka'] font-semibold text-[15px]">{idx + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={`mt-2 font-['Nunito'] text-[13px] font-semibold text-center transition-colors px-2 rounded-md ${
                                    isActive
                                        ? "text-[#1a3a52] bg-white border border-blue-100 py-0.5 px-2 shadow-sm"
                                        : isCompleted
                                        ? "text-[#45b854]"
                                        : "text-slate-500 group-hover:text-slate-700"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Stepper (compact view) */}
            <div className="md:hidden flex flex-col items-center gap-3 bg-white border border-blue-100 p-4 rounded-[20px] shadow-sm mb-6">
                <div className="flex items-center justify-between w-full text-[13px] font-['Nunito'] text-slate-500">
                    <span>Schritt {currentIndex + 1} von {steps.length}</span>
                    <span className="font-bold text-[#1a3a52]">{steps[currentIndex].label}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                        className="bg-[#066bb7] h-full transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                    />
                </div>

                {/* Micro Step indicator dots clickables */}
                <div className="flex justify-center gap-2 mt-1">
                    {steps.map((step, idx) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = isStepCompleted(step.id);
                        const isSelectable = isStepSelectable(step.id);

                        return (
                            <button
                                key={step.id}
                                disabled={!isSelectable}
                                onClick={() => onStepClick(step.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                                    isActive
                                        ? "bg-[#066bb7] border-[#066bb7] text-white"
                                        : isCompleted
                                        ? "bg-[#45b854] border-[#45b854] text-white"
                                        : "bg-white border-slate-300 text-slate-400"
                                }`}
                            >
                                {isCompleted ? <Check size={10} strokeWidth={4} /> : idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
