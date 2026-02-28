"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { initSession, sendMessage, fetchHistory, fetchConversations, type Message, type Conversation } from "@/lib/api";

const CONNECTION_ERROR = "No se puede conectar con el servidor. Asegúrate de que esté en ejecución.";
const SESSION_COOKIE = "x-session-id";

function setCookie(name: string, value: string, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

interface Props {
    initialMessages: Message[];
    initialConversations: Conversation[];
    initialSessionId: string | null;
    isErrorConexion: boolean;
}

export function ChatWindow({ initialMessages, initialConversations, initialSessionId, isErrorConexion }: Props) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [userId, setUserId] = useState<string | null>(initialSessionId);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initialize session and fetch conversations if not provided
    useEffect(() => {
        const init = async () => {
            if (userId && (conversations.length > 0 || initialMessages.length > 0)) {
                if (initialMessages.length > 0 && !activeConvId) {
                    setActiveConvId(conversations[0]?.id || null);
                }
                return;
            }

            setIsInitializing(true);
            try {
                let currentUserId = userId;
                if (!currentUserId) {
                    const { userId: newId } = await initSession();
                    setCookie(SESSION_COOKIE, newId);
                    setUserId(newId);
                    currentUserId = newId;
                }

                if (conversations.length === 0) {
                    const convs = await fetchConversations(currentUserId);
                    setConversations(convs);

                    if (convs.length > 0 && initialMessages.length > 0 && !activeConvId) {
                        setActiveConvId(convs[0].id);
                    }
                }
            } catch (err) {
                setConnectionError(CONNECTION_ERROR);
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, []);

    // Fetch history when switching conversation
    const handleSelectConversation = useCallback(async (id: string) => {
        if (!userId || id === activeConvId) return;

        setIsLoading(true);
        setActiveConvId(id);
        try {
            const history = await fetchHistory(userId, id);
            setMessages(history);
        } catch (err) {
            setConnectionError("Error al cargar la conversación.");
        } finally {
            setIsLoading(false);
        }
    }, [userId, activeConvId]);

    // Auto-scroll to the latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSend = useCallback(async () => {
        const text = input.trim();
        if (!text || !userId || isLoading) return;

        const userMsg: Message = { role: "user", content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setConnectionError(null);

        try {
            const result = await sendMessage(userId, text, activeConvId || undefined);
            const assistantMsg: Message = { role: "assistant", content: result.message };

            setMessages((prev) => [...prev, assistantMsg]);

            if (!activeConvId) {
                setActiveConvId(result.conversationId);
                const newConv: Conversation = {
                    id: result.conversationId,
                    title: result.title || text.substring(0, 30),
                    lastUpdate: Date.now()
                };
                setConversations(prev => [newConv, ...prev]);
            } else if (result.title) {
                setConversations(prev => prev.map(c =>
                    c.id === activeConvId ? { ...c, title: result.title!, lastUpdate: Date.now() } : c
                ));
            }
        } catch (err) {
            setConnectionError("Error al enviar el mensaje.");
        } finally {
            setIsLoading(false);
        }
    }, [input, userId, activeConvId, isLoading]);

    const handleNewChat = useCallback(() => {
        setActiveConvId(null);
        setMessages([]);
        setConnectionError(null);
    }, []);

    const isEmpty = messages.length === 0 && !isInitializing && !connectionError;

    return (
        <div className="flex h-full w-full overflow-hidden bg-[#212121]">
            <Sidebar
                conversations={conversations}
                activeId={activeConvId}
                onSelect={handleSelectConversation}
                onNewChat={handleNewChat}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <section className="flex-1 flex flex-col h-full min-w-0 relative">
                {/* Header inside ChatWindow for mobile toggle control */}
                <header className="flex items-center px-4 py-3 border-b border-white/5 shrink-0 z-20 bg-[#212121]/80 backdrop-blur-md sticky top-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 -ml-2 mr-2 text-gray-400 hover:text-white transition-colors"
                        aria-label="Abrir menú"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2 mx-auto md:mx-0">
                        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-sm tracking-wide text-white/90">Asistente Moncada</span>
                    </div>

                    <div className="w-10 md:hidden" /> {/* Spacer to center title on mobile */}
                </header>

                {/* Connection error banner */}
                {(isErrorConexion || connectionError) && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs z-10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                        <span className="flex-1">
                            {connectionError || "Error de conexión con el servidor"}
                        </span>
                        <button onClick={() => window.location.reload()} className="text-white underline underline-offset-2 transition-colors">Recargar</button>
                    </div>
                )}

                {/* Messages area */}
                <article className="flex-1 overflow-y-auto px-4 py-4 md:py-6 scrollbar-thin">
                    <div className="max-w-3xl mx-auto w-full">
                        {isInitializing && conversations.length === 0 && (
                            <div className="flex items-center justify-center mt-16 mb-5 gap-2 text-gray-500 text-sm">
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                                </svg>
                                Iniciando…
                            </div>
                        )}

                        {isEmpty && (
                            <section className="flex flex-col items-center justify-center h-full min-h-[50vh] md:min-h-[60vh] gap-4 text-center px-4 animate-in fade-in zoom-in-95 duration-700">
                                <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-2xl ring-4 ring-emerald-500/20">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                                    </svg>
                                </div>
                                <header>
                                    <h2 className="text-2xl font-bold text-white tracking-tight">¿En qué puedo ayudarte?</h2>
                                    <p className="text-gray-400 mt-2 text-sm md:text-base max-w-sm">Empieza una nueva conversación con tu asistente IA.</p>
                                </header>
                            </section>
                        )}

                        <div className="space-y-6">
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} message={msg} />
                            ))}
                        </div>

                        {isLoading && (
                            <section className="flex justify-start mt-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <article className="mr-3 shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                                        </svg>
                                    </div>
                                </article>
                                <article className="bg-[#1e1e1e] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-2 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-emerald-500/40 rounded-full animate-bounce" />
                                </article>
                            </section>
                        )}
                        <div ref={bottomRef} className="h-4" />
                    </div>
                </article>

                {/* Input area */}
                <article className="pb-4 md:pb-8 pt-2 bg-linear-to-t from-[#212121] via-[#212121] to-transparent z-10">
                    <div className="max-w-3xl mx-auto px-4">
                        <ChatInput
                            value={input}
                            onChange={setInput}
                            onSend={handleSend}
                            disabled={isLoading || isInitializing || !userId}
                        />
                        <p className="text-center text-[10px] md:text-xs text-gray-500 mt-4 px-4">
                            Antigravity puede cometer errores. Considera verificar la información importante.
                        </p>
                    </div>
                </article>
            </section>
        </div>
    );
}
