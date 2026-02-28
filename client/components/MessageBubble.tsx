import type { Message } from "@/lib/api";

interface Props {
    message: Message;
}

export function MessageBubble({ message }: Props) {
    const isUser = message.role === "user";

    return (
        <div className={`flex w-full mb-2 animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
                <div className="mr-2 md:mr-3 shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
                        <svg
                            className="w-4 h-4 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 20.25c4.556 0 8.25-3.694 8.25-8.25S16.556 3.75 12 3.75 3.75 7.444 3.75 12s3.694 8.25 8.25 8.25ZM12 21.75c-5.385 0-9.75-4.365-9.75-9.75s4.365-9.75 9.75-9.75 9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75ZM13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-4.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                        </svg>
                    </div>
                </div>
            )}

            <div
                className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all duration-300 ${isUser
                    ? "bg-[#2f2f2f] text-white rounded-tr-none border border-white/5"
                    : "bg-[#1e1e1e] text-gray-100 rounded-tl-none border border-white/5"
                    }`}
            >
                {message.content}
            </div>

            {isUser && (
                <div className="ml-2 md:ml-3 shrink-0 mt-1 group">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg ring-1 ring-white/10 transition-transform group-hover:scale-110">
                        <svg
                            className="w-4 h-4 text-white/90"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
