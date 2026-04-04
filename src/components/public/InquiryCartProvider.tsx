"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type InquiryCartItem = {
    id: string;
    slug: string;
    title: string;
    price: string | null;
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

export function InquiryCartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<InquiryCartItem[]>([]);
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as InquiryCartItem[];
                if (Array.isArray(parsed)) {
                    setItems(parsed.filter((item) => item && typeof item.id === "string" && typeof item.quantity === "number"));
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
            const existing = current.find((entry) => entry.id === item.id);
            if (existing) {
                return current.map((entry) =>
                    entry.id === item.id
                        ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
                        : entry
                );
            }

            return [...current, { ...item, quantity: item.quantity ?? 1 }];
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
