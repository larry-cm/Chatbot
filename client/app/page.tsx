import { cookies } from "next/headers";
import { ChatWindow } from "@/components/ChatWindow";
import type { Message } from "@/lib/api";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:8080";

async function getHistory(sessionId: string): Promise<Message[] | null> {
  try {
    const res = await fetch(`${SERVER_URL}/history`, {
      method: "GET",
      headers: {
        "x-session-id": sessionId,
      },
      // no cache — queremos el historial fresco en cada carga
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages ?? null;
  } catch {
    return null;
  }
}

async function getConversations(sessionId: string) {
  try {
    const res = await fetch(`${SERVER_URL}/conversations`, {
      method: "GET",
      headers: {
        "x-session-id": sessionId,
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.conversations ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("x-session-id")?.value ?? null;

  const [initialMessages, initialConversations] = sessionId
    ? await Promise.all([getHistory(sessionId), getConversations(sessionId)])
    : [[], []];

  const isError = initialMessages === null;
  return (
    <main className="h-screen bg-background">
      <ChatWindow
        isErrorConexion={isError}
        initialMessages={initialMessages ?? []}
        initialConversations={initialConversations}
        initialSessionId={sessionId}
      />
    </main>
  );
}
