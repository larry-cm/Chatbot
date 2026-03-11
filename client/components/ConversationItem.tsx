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
    const wrapperRef = useRef<HTMLDivElement>(null);

    useClickOutside(wrapperRef, () => setOpen(false));

    return (
        <li className="relative group/item">
            <button
                onClick={() => {
                    onSelect();
                    if (window.innerWidth < 768) onClose();
                }}
                className={`w-full flex items-center gap-2 text-left px-3 py-3 rounded-xl text-sm transition-all group relative truncate ${isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
            >
                {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                )}

                <span className="truncate block pr-6">{conv.title}</span>
            </button>

            {/* Wrapper con ref que cubre trigger + dropdown */}
            <section ref={wrapperRef} className="absolute right-2 top-1/2 -translate-y-1/2">
                {/* Three-dot trigger */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen((prev) => !prev);
                    }}
                    className={`p-1.5 flex gap-0.5 cursor-pointer rounded-lg transition-colors 
                        ${open ? "flex" : "hidden group-hover/item:flex"}`}
                >
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                    <span className="w-1 h-1 rounded-full bg-gray-400" />
                </button>

                {/* Dropdown panel */}
                {open && (
                    <article
                        className="animate-fade-in absolute right-0 top-[calc(100%+4px)] z-50 min-w-[170px] bg-[#1f1f1f] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
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
                    </article>
                )}
            </section>
        </li>
    );
}