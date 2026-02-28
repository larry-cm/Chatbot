// El browser habla con Next.js (/api/*) — Next.js proxia al servidor Bun.
// Así no hay CORS: todo es el mismo origen.

export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export async function initSession(): Promise<{ userId: string; message: string }> {
    const res = await fetch("/api/", {
        method: "GET",
    });
    if (!res.ok) throw new Error("Error al iniciar la sesión");
    return res.json();
}

export interface Conversation {
    id: string;
    title: string;
    lastUpdate: number;
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
    const res = await fetch("/api/conversations", {
        method: "GET",
        headers: {
            "x-session-id": userId,
        },
    });
    if (!res.ok) throw new Error("Error al obtener las conversaciones");
    const data = await res.json();
    return data.conversations ?? [];
}

export async function fetchHistory(userId: string, conversationId: string): Promise<Message[]> {
    const res = await fetch("/api/history", {
        method: "GET",
        headers: {
            "x-session-id": userId,
            "x-conversation-id": conversationId,
        },
    });
    if (!res.ok) throw new Error("Error al obtener el historial");
    const data = await res.json();
    return data.messages ?? [];
}

export async function sendMessage(
    userId: string,
    userMessage: string,
    conversationId?: string
): Promise<{ message: string; conversationId: string; title?: string }> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-session-id": userId,
    };
    if (conversationId) {
        headers["x-conversation-id"] = conversationId;
    }

    const res = await fetch("/api/", {
        method: "POST",
        headers,
        body: JSON.stringify({ userMessage }),
    });
    if (!res.ok) throw new Error("Error al enviar el mensaje");
    return res.json();
}
