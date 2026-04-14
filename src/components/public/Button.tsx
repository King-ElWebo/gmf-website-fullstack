import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export function Button({
    children,
    variant = 'primary',
    onClick,
    disabled = false,
    type = 'button',
    className = ''
}: ButtonProps) {
    const baseStyles = "h-[50px] inline-flex items-center justify-center rounded-[16px] px-6 font-['Nunito'] font-medium text-[16px] leading-[24px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantStyles = {
        primary: "bg-[#3b82f6] text-white hover:bg-[#2563eb] focus:ring-[#3b82f6] shadow-sm",
        secondary: "bg-[#1a3a52] text-white border border-[#1a3a52] hover:bg-[#0f2434] focus:ring-[#1a3a52]"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
}
