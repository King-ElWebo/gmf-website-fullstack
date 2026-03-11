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
            <label className="font-['Inter'] font-medium text-[14px] leading-[21px] text-[#1a202c]">
                {label}
                {required && <span className="text-[#dc2626] ml-1">*</span>}
            </label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="bg-white h-[50px] rounded-[8px] px-[16px] py-[12px] font-['Inter'] text-[16px] text-[#2d3748] border border-[#cbd5e1] focus:outline-none focus:border-[#1a3a52] placeholder:text-[rgba(45,55,72,0.5)]"
            />
            {error && (
                <p className="font-['Inter'] text-[14px] leading-[20px] text-[#dc2626]">
                    {error}
                </p>
            )}
        </div>
    );
}
