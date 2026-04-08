"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { InquiryCartPriceType } from "@/lib/inquiry-cart/pricing";

export type InquiryCartItem = {
    id: string;
    slug: string;
    title: string;
    price: string | null;
    priceType: InquiryCartPriceType;
    basePriceCents: number | null;
    priceLabel: string | null;
    trackInventory: boolean;
    totalStock: number;
    imageUrl: string;
    summary?: string | null;
    quantity: number;
};

type AddInquiryCartItemInput = Omit<InquiryCartItem, "quantity"> & {
    quantity?: number;
};

type InquiryCartContextValue = {
    items: InquiryCartItem[];
    itemCount: number;
    addItem: (item: AddInquiryCartItemInput) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isInCart: (id: string) => boolean;
    hasHydrated: boolean;
};

const STORAGE_KEY = "gmf-inquiry-cart";

const InquiryCartContext = createContext<InquiryCartContextValue | null>(null);

function parsePriceType(value: unknown): InquiryCartPriceType | null {
    if (value === "FIXED" || value === "ON_REQUEST" || value === "FROM_PRICE") {
        return value;
    }

    return null;
}

function inferPriceType(rawPrice: unknown, basePriceCents: number | null): InquiryCartPriceType {
    if (basePriceCents != null) return "FIXED";

    if (typeof rawPrice === "string") {
        const normalized = rawPrice.trim().toLowerCase();
        if (normalized.includes("anfrage")) return "ON_REQUEST";
        if (normalized.startsWith("ab ")) return "FROM_PRICE";
    }

    return "ON_REQUEST";
}

function parseBasePriceCents(value: unknown): number | null {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        return null;
    }

    return Math.round(value);
}

function parseTotalStock(value: unknown) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        return 0;
    }

    return Math.floor(value);
}

function normalizeInquiryCartItem(value: unknown): InquiryCartItem | null {
    if (!value || typeof value !== "object") return null;

    const raw = value as Record<string, unknown>;
    if (typeof raw.id !== "string" || typeof raw.slug !== "string" || typeof raw.title !== "string") {
        return null;
    }

    const quantity =
        typeof raw.quantity === "number" && Number.isFinite(raw.quantity)
            ? Math.max(1, Math.floor(raw.quantity))
            : 1;

    const basePriceCents = parseBasePriceCents(raw.basePriceCents);
    const priceType = parsePriceType(raw.priceType) ?? inferPriceType(raw.price, basePriceCents);
    const trackInventory = typeof raw.trackInventory === "boolean" ? raw.trackInventory : false;
    const totalStock = parseTotalStock(raw.totalStock);

    return {
        id: raw.id,
        slug: raw.slug,
        title: raw.title,
        price: typeof raw.price === "string" ? raw.price : null,
        priceType,
        basePriceCents,
        priceLabel: typeof raw.priceLabel === "string" ? raw.priceLabel : null,
        trackInventory,
        totalStock,
        imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : "",
        summary: typeof raw.summary === "string" ? raw.summary : null,
        quantity,
    };
}

export function InquiryCartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<InquiryCartItem[]>([]);
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as unknown;
                if (Array.isArray(parsed)) {
                    setItems(parsed.map(normalizeInquiryCartItem).filter((item): item is InquiryCartItem => item != null));
                }
            }
        } catch {
            window.localStorage.removeItem(STORAGE_KEY);
        } finally {
            setHasHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!hasHydrated) return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items, hasHydrated]);

    const addItem = useCallback((item: AddInquiryCartItemInput) => {
        setItems((current) => {
            if (item.trackInventory && item.totalStock <= 0) {
                return current;
            }

            const existing = current.find((entry) => entry.id === item.id);
            const requestedIncrease = Math.max(1, item.quantity ?? 1);

            if (existing) {
                const nextQuantityRaw = existing.quantity + requestedIncrease;
                const nextQuantity =
                    item.trackInventory ? Math.min(item.totalStock, nextQuantityRaw) : nextQuantityRaw;

                return current.map((entry) =>
                    entry.id === item.id
                        ? {
                            ...entry,
                            slug: item.slug,
                            title: item.title,
                            price: item.price,
                            priceType: item.priceType,
                            basePriceCents: item.basePriceCents,
                            priceLabel: item.priceLabel,
                            trackInventory: item.trackInventory,
                            totalStock: item.totalStock,
                            imageUrl: item.imageUrl,
                            summary: item.summary ?? entry.summary,
                            quantity: nextQuantity,
                        }
                        : entry
                );
            }

            const initialQuantityRaw = requestedIncrease;
            const initialQuantity =
                item.trackInventory ? Math.min(item.totalStock, initialQuantityRaw) : initialQuantityRaw;

            if (initialQuantity <= 0) {
                return current;
            }

            return [...current, { ...item, quantity: initialQuantity }];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems((current) => current.filter((item) => item.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const isInCart = useCallback((id: string) => items.some((item) => item.id === id), [items]);

    const value = useMemo<InquiryCartContextValue>(() => ({
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        hasHydrated,
    }), [addItem, clearCart, hasHydrated, isInCart, items, removeItem, updateQuantity]);

    return <InquiryCartContext.Provider value={value}>{children}</InquiryCartContext.Provider>;
}

export function useInquiryCart() {
    const context = useContext(InquiryCartContext);

    if (!context) {
        throw new Error("useInquiryCart must be used within an InquiryCartProvider");
    }

    return context;
}
