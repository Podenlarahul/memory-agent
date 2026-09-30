import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  BrainCircuit, 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Laptop, 
  Clock, 
  CheckCircle,
  Database,
  Info,
  Check,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { api } from '../services/api';

export default function CustomerChatPage({ currentUser, onLogout }) {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [customerData, setCustomerData] = useState(null);
  const [ticketStatus, setTicketStatus] = useState('open');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, [conversationId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversation = async () => {
    try {
      setInitialLoading(true);
      let targetId = conversationId;
      if (!targetId) {
        const convs = await api.getConversations().catch(() => []);
        if (convs && convs.length > 0) {
          targetId = convs[0].id;
        } else {
          const cid = currentUser?.customer_id || `cust_${currentUser?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'user'}_001`;
          const newConv = await api.createConversation(cid, `Support Session - ${new Date().toLocaleDateString()}`);
          targetId = newConv?.conversation_id;
        }
        if (targetId) {
          navigate(`/customer/chat/${targetId}`, { replace: true });
          return;
        }
      }

      const [conv, cust] = await Promise.all([
        api.getConversation(targetId).catch(() => null),
        currentUser?.customer_id ? api.getCustomer(currentUser.customer_id).catch(() => null) : null
      ]);

      setCustomerData(cust);
      setConversation(conv);
      if (conv?.status) {
        setTicketStatus(conv.status.toLowerCase() === 'resolved' ? 'resolved' : 'open');
      }

      const existingMsgs = conv?.messages || [];
      if (existingMsgs.length === 0) {
        // Welcome greeting with memory awareness
        const greeting = {
          id: `greet_${Date.now()}`,
          sender: 'ai',
          sender_name: 'SupportMind AI',
          message: `Hello ${currentUser?.name || 'there'}! I'm SupportMind, your AI support assistant. I have access to your environment details and previous support history so you don't need to re-explain past issues. How can I assist you today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          memories_used: []
        };
        setMessages([greeting]);
      } else {
        setMessages(existingMsgs);
      }
    } catch (e) {
      console.warn('Failed to load conversation:', e);
    } finally {
      setInitialLoading(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (isUpdatingStatus) return;
    const targetConvId = conversationId || conversation?.id;
    if (!targetConvId) return;

    try {
      setIsUpdatingStatus(true);
      setTicketStatus(newStatus);

      await api.updateConversationStatus(targetConvId, newStatus);

      const isResolved = newStatus === 'resolved';
      const sysMsg = {
        id: `sys_${Date.now()}`,
        sender: 'system',
        sender_name: 'System',
        message: isResolved
          ? 'Ticket marked as Resolved. This support session and ticket have been moved to your Resolved section.'
          : 'Ticket marked as Open. This support session and ticket are now in your Open section.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, sysMsg]);
    } catch (e) {
      console.warn('Failed to update status:', e);
      setTicketStatus(prev => (prev === 'resolved' ? 'open' : 'resolved'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const effectiveCustomerId = currentUser?.customer_id || (currentUser?.role === 'customer' ? `cust_${(currentUser?.name || 'customer').toLowerCase().replace(/[^a-z0-9]/g, '_')}_001` : null);
    if (!inputText.trim() || isLoading || !effectiveCustomerId) return;

    const textToSend = inputText.trim();
    setInputText('');

    // If message indicates resolution, optimistically update status
    const lowerText = textToSend.toLowerCase();
    if (lowerText.includes('solved') || lowerText.includes('resolved') || lowerText.includes('fixed it') || lowerText.includes('issue was solved')) {
      setTicketStatus('resolved');
    }

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'customer',
      sender_name: currentUser?.name || 'Customer',
      message: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(
        effectiveCustomerId,
        textToSend,
        conversationId
      );

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        sender_name: 'SupportMind AI',
        message: res.response,
        timestamp: res.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memories_used: res.memories_used || []
      };

      setMessages(prev => [...prev, aiMsg]);

      if (res.conversation_id && res.conversation_id !== conversationId) {
        navigate(`/customer/chat/${res.conversation_id}`, { replace: true });
      }
    } catch (err) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        sender_name: 'Support Assistant',
        message: `I encountered an issue processing your request: ${err.message}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      {/* Chat Session Sub-Bar */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">
                {conversation?.title || 'Active Support Session'}
              </h2>
              <button
                type="button"
                onClick={() => handleUpdateStatus(ticketStatus === 'resolved' ? 'open' : 'resolved')}
                disabled={isUpdatingStatus}
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center space-x-1 cursor-pointer transition-all border ${
                  ticketStatus === 'resolved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
                title="Click to toggle ticket status between Open and Resolved"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${ticketStatus === 'resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                <span>{ticketStatus === 'resolved' ? 'Resolved' : 'Open'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Session ID: <span className="font-mono">{conversationId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-medium">
            <Laptop className="w-3.5 h-3.5 text-slate-500" />
            <span>{customerData?.device || currentUser?.device || 'Device not specified'}</span>
          </div>


          <div className="flex items-center space-x-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-medium">
            <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
            <span>Hindsight Memory Recall</span>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-[calc(100vh-64px)] max-w-4xl w-full mx-auto p-4 md:p-6 overflow-hidden">
        {/* Chat Messages Container */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {initialLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Connecting to SupportMind session...</span>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/90 shadow-2xs flex items-center space-x-1.5 animate-fadeIn">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${msg.message.includes('Resolved') ? 'text-emerald-600' : 'text-blue-600'}`} />
                          <span>{msg.message}</span>
                        </div>
                      </div>
                    );
                  }
                  const isUser = msg.sender === 'customer';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 px-1">
                        <span>{msg.sender_name || (isUser ? currentUser?.name : 'SupportMind AI')}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>

                        {/* RELEVANT MEMORIES BADGE */}
                        {!isUser && msg.memories_used && msg.memories_used.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-200 space-y-1.5">
                            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-blue-700">
                              <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                              <span>Relevant memories recalled from Hindsight:</span>
                            </div>
                            <div className="space-y-1 pl-1">
                              {msg.memories_used.map((mem, i) => (
                                <div
                                  key={i}
                                  className="text-[10px] text-slate-600 bg-white border border-blue-200/60 rounded-md px-2.5 py-1 shadow-2xs"
                                >
                                  🧠 {mem}
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-medium pt-0.5">
                              <CheckCircle className="w-3 h-3" />
                              <span>Customer memory updated in persistent store</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex flex-col items-start space-y-1">
                    <div className="text-[10px] text-slate-400 px-1">SupportMind AI</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-500 flex items-center space-x-2">
                      <BrainCircuit className="w-4 h-4 text-blue-600 animate-spin" />
                      <span>Thinking with long-term memory...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* TICKET STATUS CONTROL AT THE END OF CHAT */}
          <div className="px-6 py-3 bg-slate-50/95 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-semibold text-slate-600">Ticket Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                ticketStatus === 'resolved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  ticketStatus === 'resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                }`} />
                <span>{ticketStatus === 'resolved' ? 'Resolved' : 'Open'}</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {ticketStatus === 'resolved' ? '• Moved to Resolved section' : '• Stored in Open section'}
              </span>
            </div>

            {/* Resolved and Open Options */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus('open')}
                disabled={isUpdatingStatus || ticketStatus === 'open'}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  ticketStatus === 'open'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold shadow-2xs cursor-default'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 active:scale-95'
                }`}
                title="Mark ticket as Open"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Open</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('resolved')}
                disabled={isUpdatingStatus || ticketStatus === 'resolved'}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  ticketStatus === 'resolved'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs cursor-default'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 active:scale-95'
                }`}
                title="Mark ticket as Resolved and move to Resolved section"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Resolved</span>
              </button>
            </div>
          </div>

          {/* Message Input Box */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your issue or ask a question (SupportMind remembers past context)..."
                disabled={isLoading}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-xl shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>Press Enter to send</span>
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3 text-blue-500" />
                <span>Isolated Bank: SupportMind-{currentUser?.customer_id}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
