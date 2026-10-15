"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  RotateCcw,
  Trash2,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/ga4";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  isError?: boolean;
  status?: "ai" | "knowledge_fallback" | "config_notice" | "security_warning";
  toolLink?: string;
}

const QUICK_TOPICS = [
  "How do I extract notes from a Loom video?",
  "What is in the 5-part AI meeting summary?",
  "How does action item tracking work?",
  "Is LoomNotesAI free to use?",
  "How do client follow-ups work?",
  "Is my meeting data private?",
  "How do I contact support?",
];

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "assistant",
  content:
    "Hello! 👋 I'm your **LoomNotesAI Support Assistant**. I can help you with Loom video extraction, 5-part AI meeting summaries, action item tracking, client follow-ups, and account settings.\n\nHow can I help you today?",
  timestamp: "Just now",
};

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore chat history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("loomnotesai_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore session storage errors
    }
  }, []);

  // Save history to sessionStorage when updated
  useEffect(() => {
    try {
      if (messages.length > 1) {
        sessionStorage.setItem("loomnotesai_chat_history", JSON.stringify(messages));
      }
    } catch {
      // Ignore
    }
  }, [messages]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    trackEvent("support_chat_opened", { source: "floating_button" });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    setInput("");
    setLastFailedMessage(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    trackEvent("support_chat_message_sent", {
      topic_length: text.length,
    });

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment before sending another message.");
        }
        throw new Error("Unable to reach support service. Please try again.");
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I am unable to answer right now. Please email support@loomnotes.ai.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: data.status,
        toolLink: data.toolLink,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setLastFailedMessage(text);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: err.message || "Something went wrong. Please check your connection or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this conversation history?")) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
      sessionStorage.removeItem("loomnotesai_chat_history");
      setLastFailedMessage(null);
    }
  };

  const handleTopicClick = (topic: string) => {
    trackEvent("support_help_topic_selected", { topic });
    handleSendMessage(topic);
  };

  // Basic markdown link and bold renderer
  const renderFormattedContent = (content: string) => {
    // Replace markdown links [label](url) with clickable anchor tags
    const parts = content.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, url] = linkMatch;
        const isInternal = url.startsWith("/");
        if (isInternal) {
          return (
            <Link
              key={index}
              href={url}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-[#4b49ac] hover:underline"
            >
              <span>{label}</span>
              <ExternalLink className="h-3 w-3 inline" />
            </Link>
          );
        }
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#4b49ac] hover:underline"
          >
            <span>{label}</span>
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        );
      }

      const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        return <strong key={index} className="font-semibold text-slate-900 dark:text-white">{boldMatch[1]}</strong>;
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON */}
      {!isOpen && (
        <aside
          aria-label="Customer Support Chat"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 group animate-fade-in"
        >
          <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 pointer-events-none group-hover:scale-105 transition-transform">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Support Online</span>
          </div>

          <button
            onClick={handleOpen}
            aria-label="Open LoomNotesAI Customer Support Chat"
            className="h-14 w-14 rounded-full bg-[#4b49ac] hover:bg-[#7978e3] text-white shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ring-4 ring-[#98dbff]/30 focus:outline-none focus:ring-4 focus:ring-[#7DA0FA]"
          >
            <MessageSquare className="h-6 w-6 stroke-[2.2]" />
          </button>
        </aside>
      )}

      {/* 2. CHAT WINDOW (EXPANDED OR MINIMIZED) */}
      {isOpen && (
        <section
          aria-label="LoomNotesAI Support Chat Window"
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
            isMinimized
              ? "h-14 w-80 sm:w-96"
              : "h-[540px] max-h-[85vh] w-[calc(100vw-2rem)] sm:w-[410px]"
          }`}
        >
          {/* Header Bar */}
          <header className="h-14 bg-gradient-to-r from-[#4b49ac] to-[#7978e3] text-white px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">LoomNotesAI Support</span>
                <span className="text-[10px] text-[#98dbff] font-medium leading-tight">
                  Verified Knowledge Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/90">
              <button
                onClick={handleClearChat}
                title="Clear conversation"
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                aria-label="Clear chat conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                aria-label="Close chat window"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Body & Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm bg-slate-50/60 dark:bg-[#090d16]/60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-[#4b49ac] text-white rounded-br-xs"
                          : msg.isError
                          ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-bl-xs"
                          : "bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs"
                      }`}
                    >
                      {msg.status === "security_warning" && (
                        <div className="flex items-center gap-1.5 text-[#f3797e] font-semibold text-xs mb-1">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>Security Reminder</span>
                        </div>
                      )}

                      {renderFormattedContent(msg.content)}

                      {msg.toolLink && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <Link
                            href={msg.toolLink}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4b49ac] dark:text-[#7DA0FA] hover:underline"
                          >
                            <span>Open relevant tool</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Loading / Typing Indicator */}
                {isLoading && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 w-fit text-slate-400 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4b49ac] animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7DA0FA] animate-bounce [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#98dbff] animate-bounce [animation-delay:0.3s]" />
                    <span className="text-xs text-slate-500 ml-1">Searching knowledge base...</span>
                  </div>
                )}

                {/* Retry Button if last failed */}
                {lastFailedMessage && !isLoading && (
                  <div className="flex justify-start">
                    <button
                      onClick={() => handleSendMessage(lastFailedMessage)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#f3797e] hover:underline bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900 cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry sending message</span>
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Quick Questions Chips */}
              <div className="px-3 py-2 bg-white dark:bg-[#0c1220] border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-1.5 no-scrollbar">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    disabled={isLoading}
                    onClick={() => handleTopicClick(topic)}
                    className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#98dbff]/20 hover:text-[#4b49ac] transition-colors cursor-pointer border border-transparent hover:border-[#7DA0FA]/40 disabled:opacity-50"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <footer className="p-3 bg-white dark:bg-[#0c1220] border-t border-slate-200 dark:border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Loom notes, action items, AI summaries, pricing..."
                    disabled={isLoading}
                    maxLength={1000}
                    className="flex-1 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#4b49ac] focus:ring-2 focus:ring-[#7DA0FA]/20 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    aria-label="Send support question"
                    className="h-10 w-10 rounded-xl bg-[#4b49ac] hover:bg-[#7978e3] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Never share passwords or payment cards.</span>
                  <span>Escalate: support@loomnotes.ai</span>
                </div>
              </footer>
            </>
          )}
        </section>
      )}
    </>
  );
}
