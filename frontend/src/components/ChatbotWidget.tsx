import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Globe, Minimize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Language = "en" | "hi" | "mr";
type MessageRole = "user" | "assistant";

interface ChatMessage {
  role:    MessageRole;
  content: string;
  ts:      number;
}

const LANG_LABELS: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी",
};

const GREETINGS: Record<Language, string> = {
  en: "👋 Namaste! I'm KrishiBot. Ask me about seeds, fertilizers, scholarships, land records, or government schemes!",
  hi: "👋 नमस्ते! मैं KrishiBot हूं। बीज, खाद, छात्रवृत्ति, भूमि रिकॉर्ड या सरकारी योजनाओं के बारे में पूछें!",
  mr: "👋 नमस्कार! मी KrishiBot आहे. बियाणे, खते, शिष्यवृत्ती, जमीन नोंदी किंवा सरकारी योजनांबद्दल विचारा!",
};

const PLACEHOLDERS: Record<Language, string> = {
  en: "Type your question…",
  hi: "अपना सवाल लिखें…",
  mr: "तुमचा प्रश्न लिहा…",
};

export default function ChatbotWidget() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [language,  setLanguage]  = useState<Language>("en");
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [showLang,  setShowLang]  = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, lineIdx) => {
      let elements: React.ReactNode[] = [];
      let currentText = line;

      const isListItem = line.trim().startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("• ");
      if (isListItem) {
        currentText = line.trim().substring(2);
      }

      // Regex matching **bold** or [text](url)
      const tokenRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
      const parts = currentText.split(tokenRegex);

      parts.forEach((part, partIdx) => {
        const key = `${lineIdx}-${partIdx}`;
        if (part.startsWith("**") && part.endsWith("**")) {
          elements.push(
            <strong key={key} className="font-extrabold text-stone-900">
              {part.slice(2, -2)}
            </strong>
          );
        } else if (part.startsWith("[") && part.includes("](")) {
          const closeBracket = part.indexOf("]");
          const linkText = part.slice(1, closeBracket);
          const linkUrl = part.slice(closeBracket + 2, -1);
          const isExternal = linkUrl.startsWith("http") || linkUrl.startsWith("www");

          if (isExternal) {
            elements.push(
              <a
                key={key}
                href={linkUrl.startsWith("www") ? `https://${linkUrl}` : linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 underline font-semibold transition-all inline-flex items-center gap-0.5"
              >
                {linkText}
              </a>
            );
          } else {
            elements.push(
              <Link
                key={key}
                to={linkUrl}
                className="text-emerald-600 hover:text-emerald-700 underline font-semibold transition-all inline-flex items-center gap-0.5"
              >
                {linkText}
              </Link>
            );
          }
        } else {
          elements.push(part);
        }
      });

      return (
        <div
          key={lineIdx}
          className={`${isListItem ? "pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-emerald-600 before:font-bold" : ""} ${lineIdx > 0 ? "mt-1.5" : ""}`}
        >
          {elements}
        </div>
      );
    });
  };

  // Inject greeting when opened for the first time or language changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: GREETINGS[language], ts: Date.now() }]);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const switchLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLang(false);
    // Inject a language-changed greeting
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: GREETINGS[lang], ts: Date.now() },
    ]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const data: any = await api.chat(text, language, history);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, ts: Date.now() }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: language === "hi" ? "क्षमा करें, कुछ गलत हुआ। कृपया पुनः प्रयास करें।" : language === "mr" ? "माफ करा, काहीतरी चूक झाली. पुन्हा प्रयत्न करा." : "Sorry, something went wrong. Please try again.", ts: Date.now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Chat panel ────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="flex flex-col w-[360px] max-w-[calc(100vw-3rem)] h-[500px] rounded-2xl shadow-2xl border border-stone-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-emerald-700 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">KrishiBot</p>
                <p className="text-[10px] text-emerald-200 mt-0.5">Your farming assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Language picker */}
              <div className="relative">
                <button
                  onClick={() => setShowLang(v => !v)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  {LANG_LABELS[language]}
                </button>
                {showLang && (
                  <div className="absolute right-0 top-8 rounded-lg border bg-white shadow-xl overflow-hidden z-10 w-28">
                    {(["en","hi","mr"] as Language[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => switchLanguage(l)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 text-stone-700 transition-colors ${l === language ? "font-bold text-emerald-700 bg-emerald-50" : ""}`}
                      >
                        {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-white/20 transition-colors">
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-stone-50/60">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-1">K</div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-sm"
                      : "bg-white text-stone-800 border border-stone-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mt-1">K</div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0,1,2].map(i => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={PLACEHOLDERS[language]}
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── FAB toggle button ────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${isOpen ? "bg-stone-700 rotate-90" : "bg-emerald-600 hover:bg-emerald-700 hover:scale-110"}`}
      >
        {isOpen
          ? <X className="h-6 w-6 text-white" />
          : <MessageCircle className="h-6 w-6 text-white" />
        }
      </button>
    </div>
  );
}
