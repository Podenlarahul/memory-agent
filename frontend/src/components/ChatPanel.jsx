import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical, 
  BrainCircuit, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPanel({
  customer,
  messages = [],
  onSendMessage,
  isLoading,
  latestRetainedMemory,
  onResetConversation
}) {
  const [inputText, setInputText] = useState('');
  const [expandedMemoryId, setExpandedMemoryId] = useState(null);
  const [demoMode, setDemoMode] = useState('with_memory'); // 'with_memory' or 'without_memory'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText, demoMode === 'without_memory');
    setInputText('');
  };

  const handleDemoPrompt = (promptText) => {
    setInputText(promptText);
    onSendMessage(promptText, demoMode === 'without_memory');
  };

  // Demo script steps for quick presentation
  const demoPrompts = [
    { label: 'Step 1: Wi-Fi issue', text: 'My Wi-Fi keeps disconnecting.' },
    { label: 'Step 2: Device context', text: "I'm using a Dell XPS 15." },
    { label: 'Step 3: Pattern', text: 'It mostly happens during Zoom calls.' },
    { label: 'Step 4: Returning later', text: 'My Wi-Fi problem is back.' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              {customer?.avatar || 'RS'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900 text-sm">{customer?.name}</h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                <span>⭐</span>
                <span>VIP Customer</span>
              </span>
              <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                {customer?.open_tickets} Open Issues
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {customer?.email} • {customer?.company} • {customer?.device}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Hackathon Demo Mode Toggle: With Hindsight vs Generic Without Memory */}
          <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setDemoMode('with_memory')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 flex items-center space-x-1 ${
                demoMode === 'with_memory'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Agent utilizes Hindsight long-term memories"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>With Hindsight</span>
            </button>
            <button
              onClick={() => setDemoMode('without_memory')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 flex items-center space-x-1 ${
                demoMode === 'without_memory'
                  ? 'bg-slate-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Generic agent without memory (amnesiac baseline)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Amnesia Mode</span>
            </button>
          </div>

          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Banner if in Amnesia demo mode */}
        {demoMode === 'without_memory' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs flex items-center space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Amnesia Mode Active:</strong> Demonstrating how a generic support agent behaves without Hindsight memory (asking repetitive questions).
            </span>
          </div>
        )}

        {/* Live Retained Memory Notification Toast */}
        <AnimatePresence>
          {latestRetainedMemory && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-3 rounded-xl text-xs flex items-start space-x-2.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-indigo-800 flex items-center space-x-1.5">
                  <span>Hindsight Memory Retained</span>
                  <span className="text-[10px] bg-indigo-200/60 text-indigo-700 px-1.5 py-0.2 rounded font-mono">
                    Bank: SupportMind-{customer?.id}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 mt-0.5 font-mono">
                  {latestRetainedMemory}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, index) => {
          const isCustomer = msg.sender === 'customer';
          const hasMemories = msg.memories_used && msg.memories_used.length > 0;
          const isMemoryExpanded = expandedMemoryId === msg.id;

          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-2 mb-1 px-1">
                <span className="text-[11px] font-semibold text-slate-600">
                  {msg.sender_name || (isCustomer ? customer?.name : 'SupportMind AI')}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp || '10:24 AM'}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  isCustomer
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.message}</div>

                {/* Hindsight Memories Used Badge & Accordion */}
                {!isCustomer && hasMemories && demoMode === 'with_memory' && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedMemoryId(isMemoryExpanded ? null : msg.id)}
                      className="flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>
                        Recalled from Hindsight ({msg.memories_used.length} context facts)
                      </span>
                      {isMemoryExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isMemoryExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-1.5 overflow-hidden"
                        >
                          {msg.memories_used.map((mem, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] bg-indigo-50/70 border border-indigo-100 text-indigo-900 rounded-lg p-2 font-mono"
                            >
                              • {mem}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 text-xs text-slate-500"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <BrainCircuit className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center space-x-2">
              <span className="text-slate-600 font-medium">Recalling Hindsight memory & generating response</span>
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Demo Scenario Quick-Chips */}
      <div className="px-6 py-2 bg-slate-100/70 border-t border-slate-200/60 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center space-x-1">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Demo Flow:</span>
        </span>
        {demoPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleDemoPrompt(p.text)}
            className="shrink-0 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 text-xs transition-colors shadow-2xs font-medium"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-150"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-2 transition-all duration-150 shadow-sm ${
              !inputText.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
            }`}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
