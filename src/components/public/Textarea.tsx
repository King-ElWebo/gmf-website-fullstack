import React from 'react';

interface TextareaProps {
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    required?: boolean;
    name?: string;
}

export function Textarea({
    label,
    placeholder,
    value,
    onChange,
    rows = 5,
    required = false,
    name
}: TextareaProps) {
    return (
        <div className="flex flex-col gap-[8px] w-full">
            <label className="font-['Inter'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                {label}
                {required && <span className="text-[#dc2626] ml-1">*</span>}
            </label>
            <textarea
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                className="bg-white rounded-[8px] px-[16px] py-[12px] font-['Inter'] text-[16px] leading-[24px] text-[#2d3748] border border-[#cbd5e1] focus:outline-none focus:border-[#1a3a52] placeholder:text-[rgba(45,55,72,0.5)] resize-none"
            />
        </div>
    );
}
