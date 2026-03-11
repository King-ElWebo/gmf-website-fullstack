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
    const baseStyles = "h-[48px] rounded-[8px] px-6 font-['Inter'] font-medium text-[16px] leading-[24px] transition-opacity hover:opacity-90";

    const variantStyles = {
        primary: "bg-[#fbbf24] text-[#1a3a52] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]",
        secondary: "bg-[#1a3a52] text-white border border-[#1a3a52]"
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
