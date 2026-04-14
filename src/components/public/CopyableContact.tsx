"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyableContactProps {
    value: string;
    type: "phone" | "email";
    className?: string;
    textClassName?: string;
}

export function CopyableContact({ value, type, className = "", textClassName = "" }: CopyableContactProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if wrapped unexpectedly
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const href = type === "phone" ? `tel:${value.replace(/\s+/g, '')}` : `mailto:${value}`;

    return (
        <span className={`inline-flex items-center gap-1.5 group ${className}`}>
            <a 
                href={href} 
                className={`hover:text-[#3b82f6] hover:underline transition-colors ${textClassName}`}
            >
                {value}
            </a>
            <button
                onClick={handleCopy}
                className="text-[#94a3b8] hover:text-[#3b82f6] opacity-60 group-hover:opacity-100 focus:opacity-100 transition-all p-1 shrink-0 focus:outline-none rounded"
                title="Adresse kopieren"
                aria-label="In Zwischenablage kopieren"
            >
                {copied ? <Check size={14} className="text-[#10b981]" /> : <Copy size={14} />}
            </button>
        </span>
    );
}
