import React from 'react';

interface InputProps {
    label: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    name?: string;
}

export function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    name
}: InputProps) {
    return (
        <div className="flex flex-col gap-[8px] w-full">
            <label className="font-['Nunito'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                {label}
                {required && <span className="text-[#dc2626] ml-1">*</span>}
            </label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`bg-white h-[50px] rounded-[16px] px-[16px] py-[12px] font-['Nunito'] text-[16px] text-[#2d3748] border ${error ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/20' : 'border-[#cbd5e1] focus:border-[#1a3a52] focus:ring-[#1a3a52]/20'} focus:outline-none focus:ring-2 transition-all placeholder:text-[#94a3b8]`}
            />
            {error && (
                <p className="font-['Nunito'] text-[13px] leading-[20px] text-[#dc2626] mt-1">
                    {error}
                </p>
            )}
        </div>
    );
}
