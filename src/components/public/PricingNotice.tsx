import { Info } from "lucide-react";
import type { InquiryCartPriceType } from "@/lib/inquiry-cart/pricing";

export const DELIVERY_COST_NOTICE = "Anfahrt und Lieferung werden je nach Entfernung zusätzlich berechnet.";
export const DELIVERY_REQUEST_NOTICE = "Lieferung erfolgt nur nach Anfrage und Absprache.";
export const FINAL_PRICE_NOTICE = "Der endgültige Preis wird nach Prüfung und Absprache bestätigt.";

type PriceDisplayProps = {
    price?: string | null;
    priceType: InquiryCartPriceType;
    priceClassName: string;
    noteClassName?: string;
    fallback?: string;
};

export function PriceDisplay({
    price,
    priceType,
    priceClassName,
    noteClassName = "font-['Nunito'] text-[12px] text-[#64748b]",
    fallback = "Preis auf Anfrage",
}: PriceDisplayProps) {
    const displayPrice = price?.trim() || fallback;
    const isPriceOnRequest = priceType === "ON_REQUEST";

    return (
        <div>
            <p className={priceClassName}>{displayPrice}</p>
            <p className={noteClassName}>
                {isPriceOnRequest ? "Lieferung und Anfahrt werden separat abgestimmt." : "inkl. MwSt."}
            </p>
        </div>
    );
}

export function DeliveryNoticeBox({ className = "" }: { className?: string }) {
    return (
        <div className={`rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1a3a52]">
                    <Info size={17} />
                </div>
                <div>
                    <p className="font-['Nunito'] font-semibold text-[14px] text-[#1a202c]">
                        Hinweis zu Anfahrt und Lieferung
                    </p>
                    <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#4a5568]">
                        {DELIVERY_COST_NOTICE} {DELIVERY_REQUEST_NOTICE}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function InquiryPricingNotice({ className = "" }: { className?: string }) {
    return (
        <div className={`rounded-[16px] border border-[#cbd5e1] bg-[#f8fafc] p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eff6ff] text-[#1a3a52]">
                    <Info size={17} />
                </div>
                <div>
                    <p className="font-['Nunito'] font-semibold text-[14px] text-[#1a202c]">
                        Transparente Preisangabe
                    </p>
                    <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#4a5568]">
                        Angezeigte Produktpreise und automatisch berechnete Summen verstehen sich inkl. MwSt.
                        Die Gesamtsumme bezieht sich nur auf automatisch berechenbare Produktpreise.
                        Anfahrt und Lieferung können zusätzlich dazukommen.
                    </p>
                    <p className="mt-1 font-['Nunito'] text-[13px] leading-[20px] text-[#4a5568]">
                        {DELIVERY_COST_NOTICE} {DELIVERY_REQUEST_NOTICE} {FINAL_PRICE_NOTICE}
                    </p>
                </div>
            </div>
        </div>
    );
}
