import React from 'react';

interface TextareaProps {
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: string;
    rows?: number;
    required?: boolean;
    name?: string;
}

export function Textarea({
    label,
    placeholder,
    value,
    onChange,
    error,
    rows = 5,
    required = false,
    name
}: TextareaProps) {
    return (
        <div className="flex flex-col gap-[8px] w-full">
            <label className="font-['Nunito'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                {label}
                {required && <span className="text-[#dc2626] ml-1">*</span>}
            </label>
            <textarea
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                className={`bg-white rounded-[16px] px-[16px] py-[12px] font-['Nunito'] text-[16px] leading-[24px] text-[#2d3748] border ${error ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#cbd5e1] focus:border-[#1a3a52] focus:ring-[#1a3a52]/20'} focus:outline-none focus:ring-2 transition-all placeholder:text-[#94a3b8] resize-none`}
            />
            {error && (
                <p className="font-['Nunito'] text-[13px] leading-[20px] text-[#dc2626] mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
