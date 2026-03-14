import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Conversation } from "@/lib/api";

interface ItemProps {
    conv: Conversation;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export function ConversationItem({ conv, isActive, onSelect, onDelete, onClose }: ItemProps) {
    const [open, setOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(conv.title);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useClickOutside(wrapperRef, () => setOpen(false));

    const handleStartRename = () => {
        setRenameValue(conv.title);
        setOpen(false);
        setIsRenaming(true);
        // Focus the input on next tick after render
        setTimeout(() => inputRef.current?.select(), 0);
    };

    const handleCancelRename = () => {
        setIsRenaming(false);
        setRenameValue(conv.title);
    };

    return (
        <li className={`relative group/item rounded-xl transition-all ${isRenaming
            ? "ring-1 ring-inset ring-emerald-500/40 bg-white/10"
            : isActive
                ? "bg-white/10"
                : ""
            }`}>
            {isRenaming ? (
                /* ── Rename mode — same padding as normal button ── */
                <div className="flex items-center gap-2 px-3 py-3">
                    <input
                        ref={inputRef}
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                // TODO: persist rename
                                setIsRenaming(false);
                            }
                            if (e.key === "Escape") handleCancelRename();
                        }}
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500 min-w-0"
                        placeholder="Nuevo nombre..."
                    />
                    {/* Confirm */}
                    <button
                        onClick={() => {
                            // TODO: persist rename
                            setIsRenaming(false);
                        }}
                        className="shrink-0 text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="Confirmar"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </button>
                    {/* Cancel */}
                    <button
                        onClick={handleCancelRename}
                        className="shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
                        title="Cancelar"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ) : (
                /* ── Normal mode ── */
                <button
                    onClick={() => {
                        onSelect();
                        if (window.innerWidth < 768) onClose();
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-3 rounded-xl text-sm group relative truncate ${isActive
                        ? "text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                >
                    {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                    )}
                    <span className="truncate block pr-6">{conv.title}</span>
                </button>
            )}

            {/* Wrapper con ref que cubre trigger + dropdown */}
            {!isRenaming && (
                <section ref={wrapperRef} className="absolute right-2 top-1/2 -translate-y-1/2">
                    {/* Three-dot trigger */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen((prev) => !prev);
                        }}
                        className={`p-1.5 flex gap-0.5 cursor-pointer rounded-lg transition-colors hover:bg-white/10
                            ${open ? "flex bg-white/10" : "hidden group-hover/item:flex"}`}
                    >
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                        <span className="w-1 h-1 rounded-full bg-gray-400" />
                    </button>

                    {/* Dropdown panel */}
                    {open && (
                        <div
                            className="animate-fade-in absolute right-0 top-[calc(100%+6px)] z-50 w-48 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-2xl py-1 ring-1 ring-black/20 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Main actions */}
                            <button
                                onClick={handleStartRename}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Renombrar
                            </button>

                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors cursor-pointer">
                                <svg className="w-4 h-4 shrink-0 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="18" cy="5" r="3" />
                                    <circle cx="6" cy="12" r="3" />
                                    <circle cx="18" cy="19" r="3" />
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                                </svg>
                                Compartir
                            </button>

                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 transition-colors cursor-pointer">
                                <svg className="w-4 h-4 shrink-0 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                Galería
                            </button>

                            {/* Footer — delete action */}
                            <div className="mt-1 border-t border-white/5 bg-black/10">
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                                    onClick={() => {
                                        onDelete();
                                        setOpen(false);
                                    }}
                                >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        <path d="M10 11v6M14 11v6" />
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                    </svg>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}
        </li>
    );
}