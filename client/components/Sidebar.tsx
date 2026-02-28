"use client";

import { Conversation } from "@/lib/api";

interface Props {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    onNewChat: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ conversations, activeId, onSelect, onNewChat, isOpen, onClose }: Props) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed md:relative z-50 md:z-auto
                w-72 md:w-64 bg-[#171717] flex flex-col h-full border-r border-white/5
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                h-dvh md:h-auto
            `}>
                <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 md:mb-2">
                        <button
                            onClick={() => {
                                onNewChat();
                                if (window.innerWidth < 768) onClose();
                            }}
                            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-all active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Nuevo Chat
                        </button>

                        <button
                            onClick={onClose}
                            className="md:hidden ml-2 p-2 text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 overflow-y-auto custom-scrollbar">
                        <h2 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Conversaciones
                        </h2>
                        <ul className="mt-2 space-y-1">
                            {conversations.length === 0 ? (
                                <li className="px-3 py-4 text-sm text-gray-600 italic text-center">
                                    No hay conversaciones
                                </li>
                            ) : (
                                conversations.map((conv) => (
                                    <li key={conv.id}>
                                        <button
                                            onClick={() => {
                                                onSelect(conv.id);
                                                if (window.innerWidth < 768) onClose();
                                            }}
                                            className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-all group relative truncate ${activeId === conv.id
                                                ? "bg-white/10 text-white"
                                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            <span className="truncate block pr-4">{conv.title}</span>
                                            {activeId === conv.id && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            )}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </nav>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xs font-bold shadow-lg ring-1 ring-white/10">
                                U
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-white truncate">Usuario</span>
                                <span className="text-xs text-gray-500 truncate">Sessión Activa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
