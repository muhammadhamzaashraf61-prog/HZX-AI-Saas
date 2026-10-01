"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Conversation = {
  id: number;
  title: string;
  created_at?: string;
};

type Message = {
  id?: number;
  clientId: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // Prevent duplicate initial API calls
  const initializedRef = useRef(false);

  // Prevent old conversation requests from overwriting newer ones
  const loadRequestRef = useRef(0);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      const response = await fetch("/api/conversations");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load conversations");
      }

      const list: Conversation[] = data.conversations || [];

      setConversations(list);

      if (list.length > 0) {
        await loadConversation(list[0].id);
      } else {
        await createConversation();
      }
    } catch (error) {
      console.error("LOAD CONVERSATIONS ERROR:", error);
    }
  }

  async function createConversation() {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "New Conversation",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create conversation");
      }

      const newConversation: Conversation = data.conversation;

      setConversations((prev) => {
        const alreadyExists = prev.some(
          (conversation) => conversation.id === newConversation.id,
        );

        if (alreadyExists) {
          return prev;
        }

        return [newConversation, ...prev];
      });

      setConversationId(newConversation.id);
      setMessages([]);
      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("CREATE CONVERSATION ERROR:", error);
    }
  }

  async function loadConversation(id: number) {
    const requestId = ++loadRequestRef.current;

    try {
      const response = await fetch(`/api/conversations/${id}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load conversation");
      }

      // Ignore old request if user already selected another conversation
      if (requestId !== loadRequestRef.current) {
        return;
      }

      setConversationId(id);

      const loadedMessages: Message[] = (data.messages || []).map(
        (message: {
          id: number;
          role: "user" | "assistant";
          content: string;
        }) => ({
          id: message.id,

          // Unique React key
          clientId: `db-${message.id}`,

          role: message.role,
          content: message.content,
        }),
      );

      setMessages(loadedMessages);

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("LOAD CONVERSATION ERROR:", error);
    }
  }

  async function deleteConversation(id: number) {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete conversation");
      }

      const remaining = conversations.filter(
        (conversation) => conversation.id !== id,
      );

      setConversations(remaining);

      if (conversationId === id) {
        if (remaining.length > 0) {
          await loadConversation(remaining[0].id);
        } else {
          await createConversation();
        }
      }
    } catch (error) {
      console.error("DELETE CONVERSATION ERROR:", error);
    }
  }

  async function sendMessage() {
    const userMessage = input.trim();

    if (!userMessage) {
      return;
    }

    if (!conversationId) {
      return;
    }

    if (loading) {
      return;
    }

    setInput("");
    setLoading(true);

    // Unique IDs for optimistic messages
    const userClientId = `user-${crypto.randomUUID()}`;
    const assistantClientId = `assistant-${crypto.randomUUID()}`;

    // Immediately show user's message + empty AI message
    setMessages((prev) => [
      ...prev,
      {
        clientId: userClientId,
        role: "user",
        content: userMessage,
      },
      {
        clientId: assistantClientId,
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message || "Failed to get AI response");
      }

      if (!response.body) {
        throw new Error("AI response stream is empty");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullResponse = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        fullResponse += chunk;

        setMessages((prev) =>
          prev.map((message) =>
            message.clientId === assistantClientId
              ? {
                  ...message,
                  content: fullResponse,
                }
              : message,
          ),
        );
      }

      // Get real database IDs after AI response is saved
      await loadConversation(conversationId);
    } catch (error) {
      console.error("CHAT ERROR:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";

      setMessages((prev) =>
        prev.map((message) =>
          message.clientId === assistantClientId
            ? {
                ...message,
                content: `⚠️ ${errorMessage}`,
              }
            : message,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function startEditing(message: Message) {
    if (!message.id) {
      return;
    }

    setEditingMessageId(message.id);
    setEditingText(message.content);
  }

  function cancelEdit() {
    setEditingMessageId(null);
    setEditingText("");
  }

  async function saveEditedMessage() {
    if (!editingMessageId) {
      return;
    }

    const content = editingText.trim();

    if (!content) {
      return;
    }

    try {
      const response = await fetch(`/api/messages/${editingMessageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to edit message");
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === editingMessageId
            ? {
                ...message,
                content: data.message.content,
              }
            : message,
        ),
      );

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("EDIT MESSAGE ERROR:", error);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  }

  return (
    <div className="chat-page">
      {/* SIDEBAR */}

      <aside className="chat-sidebar">
        <div className="chat-sidebar-top">
          <Link href="/dashboard" className="chat-logo">
            HZX <span>AI</span>
          </Link>

          <button className="new-chat-btn" onClick={createConversation}>
            + New Chat
          </button>
        </div>

        <div className="conversation-list">
          <p className="conversation-heading">Your Conversations</p>

          {conversations.length === 0 ? (
            <p className="empty-conversations">No conversations yet</p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  conversation.id === conversationId ? "active" : ""
                }`}
              >
                <button
                  className="conversation-select"
                  onClick={() => loadConversation(conversation.id)}
                >
                  <span className="conversation-icon">💬</span>

                  <span className="conversation-title">
                    {conversation.title}
                  </span>
                </button>

                <button
                  className="delete-conversation"
                  onClick={() => deleteConversation(conversation.id)}
                  title="Delete conversation"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* MAIN CHAT */}

      <main className="chat-main">
        {/* HEADER */}

        <header className="chat-header">
          <div>
            <h1>AI Assistant</h1>

            <p>Ask anything and let HZX AI help you.</p>
          </div>

          <Link href="/dashboard" className="back-dashboard-btn">
            Dashboard
          </Link>
        </header>

        {/* MESSAGES */}

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">✨</div>

              <h2>How can I help you?</h2>

              <p>
                Ask me anything, explain code, write content, summarize text, or
                brainstorm ideas.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.clientId}
                className={`message-row ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === "user" ? "U" : "✦"}
                </div>

                <div className="message-content">
                  <div className="message-name">
                    {message.role === "user" ? "You" : "HZX AI"}
                  </div>

                  {editingMessageId === message.id ? (
                    <div className="edit-box">
                      <textarea
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        autoFocus
                      />

                      <div className="edit-actions">
                        <button onClick={saveEditedMessage}>Save</button>

                        <button onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {message.role === "assistant" &&
                      !message.content &&
                      loading ? (
                        <div className="typing-indicator">
                          <span />
                          <span />
                          <span />
                        </div>
                      ) : (
                        <div className="message-text">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}

                      {message.role === "user" && message.id && (
                        <button
                          className="edit-message-btn"
                          onClick={() => startEditing(message)}
                        >
                          Edit
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* INPUT */}

        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message HZX AI..."
              rows={1}
              disabled={loading}
            />

            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>

          <p className="chat-input-hint">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}
