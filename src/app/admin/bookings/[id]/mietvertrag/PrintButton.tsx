"use client";

export function PrintButton() {
    return (
        <button onClick={() => window.print()} className="print-btn">
            Mietvertrag drucken
        </button>
    );
}
