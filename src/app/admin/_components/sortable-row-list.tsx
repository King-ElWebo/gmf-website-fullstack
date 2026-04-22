"use client";

import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableItemBase = {
    id: string;
};

type ColumnDefinition<TItem> = {
    key: string;
    header: string;
    className?: string;
    render: (item: TItem) => React.ReactNode;
};

function StaticRow<TItem extends SortableItemBase>({
    item,
    columns,
    renderActions,
}: {
    item: TItem;
    columns: ColumnDefinition<TItem>[];
    renderActions?: (item: TItem) => React.ReactNode;
}) {
    const desktopGridTemplate = `40px repeat(${columns.length}, minmax(0, 1fr)) 120px`;

    return (
        <div className="grid items-center gap-3 border-t border-slate-200/70 bg-white/90 px-4 py-4 text-sm">
            <div className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 md:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">:::</div>
                <div className="min-w-0 space-y-2">
                    {columns.map((column) => (
                        <div key={column.key} className="min-w-0">
                            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{column.header}</div>
                            <div className="min-w-0">{column.render(item)}</div>
                        </div>
                    ))}
                    {renderActions && <div>{renderActions(item)}</div>}
                </div>
            </div>

            <div className="hidden md:grid md:items-center md:gap-3" style={{ gridTemplateColumns: desktopGridTemplate }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">:::</div>
                {columns.map((column) => (
                    <div key={column.key} className={column.className}>
                        {column.render(item)}
                    </div>
                ))}
                <div>{renderActions?.(item)}</div>
            </div>
        </div>
    );
}

function SortableRow<TItem extends SortableItemBase>({
    item,
    columns,
    renderActions,
}: {
    item: TItem;
    columns: ColumnDefinition<TItem>[];
    renderActions?: (item: TItem) => React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const desktopGridTemplate = `40px repeat(${columns.length}, minmax(0, 1fr)) 120px`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`grid items-center gap-3 border-t border-slate-200/70 bg-white/92 px-4 py-4 text-sm transition-colors hover:bg-blue-50/40 ${
                isDragging ? "z-10 rounded-2xl border border-blue-200 shadow-2xl" : ""
            }`}
        >
            <div className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 md:hidden">
                <button
                    type="button"
                    className="flex h-10 w-10 cursor-grab items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 active:cursor-grabbing"
                    aria-label="Sortieren"
                    {...attributes}
                    {...listeners}
                >
                    :::
                </button>
                <div className="min-w-0 space-y-2">
                    {columns.map((column) => (
                        <div key={column.key} className="min-w-0">
                            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{column.header}</div>
                            <div className="min-w-0">{column.render(item)}</div>
                        </div>
                    ))}
                    {renderActions && <div>{renderActions(item)}</div>}
                </div>
            </div>

            <div
                className="hidden md:grid md:items-center md:gap-3"
                style={{ gridTemplateColumns: desktopGridTemplate }}
            >
                <button
                    type="button"
                    className="flex h-10 w-10 cursor-grab items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 active:cursor-grabbing"
                    aria-label="Sortieren"
                    {...attributes}
                    {...listeners}
                >
                    :::
                </button>
                {columns.map((column) => (
                    <div key={column.key} className={column.className}>
                        {column.render(item)}
                    </div>
                ))}
                <div>{renderActions?.(item)}</div>
            </div>
        </div>
    );
}

export default function SortableRowList<TItem extends SortableItemBase>({
    items,
    columns,
    emptyText,
    renderActions,
    onReorder,
    reorderEnabled = true,
}: {
    items: TItem[];
    columns: ColumnDefinition<TItem>[];
    emptyText: string;
    renderActions?: (item: TItem) => React.ReactNode;
    onReorder: (orderedIds: string[]) => Promise<TItem[]>;
    reorderEnabled?: boolean;
}) {
    const [rows, setRows] = useState(items);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => {
        setRows(items);
    }, [items]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const rowIds = useMemo(() => rows.map((item) => item.id), [rows]);

    async function handleDragEnd(event: DragEndEvent) {
        if (!reorderEnabled) return;

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = rows.findIndex((item) => item.id === active.id);
        const newIndex = rows.findIndex((item) => item.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const reordered = arrayMove(rows, oldIndex, newIndex);
        const previous = rows;
        setRows(reordered);
        setSaving(true);
        setError(null);

        try {
            const nextRows = await onReorder(reordered.map((item) => item.id));
            setRows(nextRows);
        } catch (err) {
            setRows(previous);
            setError(err instanceof Error ? err.message : "Sortierung konnte nicht gespeichert werden");
        } finally {
            setSaving(false);
        }
    }

    if (rows.length === 0) {
        return <div className="admin-surface rounded-[24px] p-6 text-sm text-slate-600">{emptyText}</div>;
    }

    const desktopGridTemplate = `40px repeat(${columns.length}, minmax(0, 1fr)) 120px`;

    return (
        <div className="space-y-3">
            <div className="admin-surface rounded-[22px] px-4 py-3">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>{reorderEnabled ? "Per Drag-and-drop sortierbar" : "Sortieransicht aktiv (Drag-and-drop nur bei manueller Reihenfolge ohne aktive Filter)"}</span>
                    {reorderEnabled && saving && <span className="admin-badge admin-badge-blue">Speichert...</span>}
                </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="admin-table rounded-[26px]">
                <div className="hidden px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:grid md:gap-3" style={{ gridTemplateColumns: desktopGridTemplate }}>
                    <div />
                    {columns.map((column) => (
                        <div key={column.key} className={column.className}>
                            {column.header}
                        </div>
                    ))}
                    <div>Actions</div>
                </div>
                {!mounted || !reorderEnabled ? (
                    <div>
                        {rows.map((item) => (
                            <StaticRow key={item.id} item={item} columns={columns} renderActions={renderActions} />
                        ))}
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                            <div>
                                {rows.map((item) => (
                                    <SortableRow key={item.id} item={item} columns={columns} renderActions={renderActions} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
