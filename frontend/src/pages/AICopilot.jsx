import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Layers, 
  Megaphone, 
  BarChart3, 
  ChevronRight, 
  RefreshCw, 
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { callCopilotChat } from '../api/ai';
import { getCampaigns } from '../api/campaigns';
import { getCustomers } from '../api/customers';

// Suggested prompts list
const SUGGESTED_PROMPTS = [
  { text: 'Bring back inactive customers', label: 'Win-back' },
  { text: 'Create summer sale campaign', label: 'Campaign' },
  { text: 'Analyze campaign performance', label: 'Analytics' },
  { text: 'Find high-value customers', label: 'Segmentation' },
  { text: 'Find customers inactive for 60 days', label: 'Retention' },
];

export function AICopilot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! Main aapka AI CRM Copilot hoon. Aap mujhse campaigns generate karne, segments banane, ya campaigns analyze karne ke liye bol sakte hain.',
      isWelcome: true
    }
  ]);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef(null);

  // Auto-scroll logic messages thread ke liye
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Readables CRM ka state CopilotKit ko feed karne ke liye
  const { data: campaignsData } = useQuery({
    queryKey: ['campaigns', 'summary'],
    queryFn: () => getCampaigns({ limit: 5 })
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers', 'summary'],
    queryFn: () => getCustomers({ limit: 5 })
  });

  // CopilotKit readables register kar rahe hain
  useCopilotReadable({
    description: "Recent CRM Campaigns currently in the system",
    value: campaignsData?.data || [],
  });

  useCopilotReadable({
    description: "Recent CRM Customers currently in the database",
    value: customersData?.data || [],
  });

  // CopilotKit action define kiya — UI notification trigger karne ke liye
  useCopilotAction({
    name: "showCRMAlert",
    description: "Show a customized toast notification banner on the CRM screen",
    parameters: [
      {
        name: "message",
        type: "string",
        description: "The notification message text to display",
        required: true,
      },
      {
        name: "type",
        type: "string",
        description: "Type of message: success, error, info",
        required: false,
      }
    ],
    handler: async ({ message, type }) => {
      // Toast notifications handle kar rahe hain
      if (type === 'error') {
        toast.error(message);
      } else {
        toast.success(message);
      }
    },
  });

  // Mutation to post messages directly to /api/ai/copilot
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: callCopilotChat,
    onSuccess: (response) => {
      if (response && response.success && response.data) {
        const copilotData = response.data;
        
        // Assistant response content generate aur store kar rahe hain
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            text: `Intent: "${copilotData.intent}" successfully route kiya gaya. Confidence score ${Math.round(copilotData.confidence * 100)}% hai.`,
            copilotPayload: copilotData,
          }
        ]);
      } else {
        throw new Error('Mismatched response from server');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Copilot message execution failed');
      
      // Error message UI log me append kar rahe hain
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: `Error: ${err.message}. Please click try again to resend.`,
          isError: true,
        }
      ]);
    }
  });

  // Chat message submit handler
  const handleSend = (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim()) return;

    // User message display thread me reflect kar rahe hain
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: promptText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    
    if (!textToSend) {
      setInput('');
    }

    // Copilot API call start kar rahe hain
    sendMessage(promptText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-200 animate-pulse">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              XENO AI Copilot 
              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full uppercase tracking-wider">Active</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Campaigns, segments and analytics auto-orchestrated via Gemini</p>
          </div>
        </div>
        
        {/* Reset history button */}
        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                text: 'Hello! Main aapka AI CRM Copilot hoon. Aap mujhse campaigns generate karne, segments banane, ya campaigns analyze karne ke liye bol sakte hain.',
                isWelcome: true
              }
            ]);
            toast.success('Chat history cleared!');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={12} />
          Clear Chat
        </button>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Bot Avatar Icon */}
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 flex-shrink-0">
                <Bot size={16} />
              </div>
            )}

            {/* Bubble Layout wrapper */}
            <div className={`flex flex-col space-y-1.5 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-red-50 border border-red-100 text-red-700 rounded-tl-none'
                    : 'bg-white border border-gray-150 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                
                {/* Retry action link for error bubbles */}
                {msg.isError && (
                  <button
                    onClick={() => {
                      // Pichla user message find karke resend kar rahe hain
                      const userMsgs = messages.filter(m => m.role === 'user');
                      if (userMsgs.length > 0) {
                        const lastUserPrompt = userMsgs[userMsgs.length - 1].text;
                        handleSend(lastUserPrompt);
                      }
                    }}
                    className="mt-2 text-xs font-semibold text-red-800 underline hover:text-red-950 flex items-center gap-1"
                  >
                    <RefreshCw size={10} /> Try Again
                  </button>
                )}
              </div>

              {/* Dynamic Copilot Response Cards based on intent / toolUsed */}
              {msg.copilotPayload && (
                <div className="w-full mt-3 animate-fade-in">
                  <CopilotResultCard payload={msg.copilotPayload} />
                </div>
              )}
            </div>

            {/* User Avatar Icon */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 border border-gray-300 flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}

        {/* Gemini processing state / loading indicators */}
        {isPending && (
          <div className="flex gap-4 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 flex-shrink-0 animate-pulse">
              <Bot size={16} />
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-150 rounded-2xl px-4 py-3 shadow-sm text-sm text-gray-500">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span>Gemini is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts footer bar */}
      {messages.length === 1 && !isPending && (
        <div className="px-6 py-4 border-t border-gray-150 bg-white">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <HelpCircle size={12} /> Suggested Prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                onClick={() => handleSend(prompt.text)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-200 rounded-xl transition-all"
              >
                <span>{prompt.text}</span>
                <ChevronRight size={12} className="text-gray-400 group-hover:text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="px-6 py-4 border-t border-gray-150 bg-white flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Copilot... (e.g. 'Bring back inactive customers')"
          disabled={isPending}
          className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 disabled:cursor-not-allowed placeholder-gray-400 text-gray-800 bg-white"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

// Router output selector for Dynamic Cards
function CopilotResultCard({ payload }) {
  const { intent, toolUsed, result } = payload;

  if (!result) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>No results were returned by the executed tool.</span>
      </div>
    );
  }

  // Segment card renderer
  if (toolUsed === 'createSegment') {
    const filters = result.filters || {};
    return (
      <div className="bg-white border-2 border-emerald-100 rounded-xl shadow-sm overflow-hidden w-full max-w-md">
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Layers size={14} /> SEGMENT CREATED
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-medium">MongoDB Save</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{result.segmentName}</h4>
            <p className="text-xs text-gray-400 mt-0.5">ID: {result.segmentId}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100 rounded-lg p-2.5">
            <div className="p-1 bg-emerald-600 rounded text-white">
              <CheckCircle size={14} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Estimated Audience</p>
              <p className="text-sm font-bold text-emerald-800">{(result.estimatedAudience || 0).toLocaleString()} Customers</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Criteria Filters</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(filters).map(([key, val]) => (
                val != null && (
                  <div key={key} className="bg-gray-50 border border-gray-200 rounded p-1.5">
                    <span className="block text-[10px] text-gray-400 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {typeof val === 'number' && key.toLowerCase().includes('spent') ? `₹${val.toLocaleString()}` : String(val)}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Campaign card renderer
  if (toolUsed === 'generateCampaign') {
    return (
      <div className="bg-white border-2 border-indigo-100 rounded-xl shadow-sm overflow-hidden w-full max-w-md">
        <div className="bg-indigo-50 px-4 py-2.5 border-b border-indigo-100 flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
            <Megaphone size={14} /> CAMPAIGN GENERATED
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md font-medium">Gemini Strategy</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{result.campaignName}</h4>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">Channel: {result.channel}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Target Audience</span>
            <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-2">{result.audience}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Recommended Message Template</span>
            <div className="text-xs text-gray-700 bg-indigo-50/20 border border-indigo-100 border-dashed rounded-lg p-2.5 font-mono leading-relaxed">
              {result.message}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Strategic Reasoning</span>
            <p className="text-xs text-gray-505 leading-relaxed">{result.reasoning}</p>
          </div>
        </div>
      </div>
    );
  }

  // Insights card renderer
  if (toolUsed === 'analyzeCampaign') {
    return (
      <div className="bg-white border-2 border-violet-100 rounded-xl shadow-sm overflow-hidden w-full max-w-md">
        <div className="bg-violet-50 px-4 py-2.5 border-b border-violet-100 flex items-center justify-between">
          <span className="text-xs font-bold text-violet-800 flex items-center gap-1.5">
            <BarChart3 size={14} /> CAMPAIGN INSIGHTS
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md font-medium">Funnel Analytics</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Executive Summary</span>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">{result.summary}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-green-600 uppercase tracking-wider font-bold">Strengths</span>
              <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-0.5">
                {result.strengths?.map((item, idx) => <li key={idx} className="truncate">{item}</li>)}
              </ul>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-red-600 uppercase tracking-wider font-bold">Issues</span>
              <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-0.5">
                {result.issues?.map((item, idx) => <li key={idx} className="truncate">{item}</li>)}
              </ul>
            </div>
          </div>

          <div className="space-y-1 border-t border-gray-100 pt-2.5">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Recommendations</span>
            <ul className="text-xs text-gray-600 list-decimal list-inside space-y-1">
              {result.recommendations?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>

          <div className="bg-violet-50/50 border border-violet-100 rounded-lg p-2.5 mt-2">
            <span className="text-[10px] text-violet-700 uppercase tracking-wider font-bold block">Follow-up Idea</span>
            <p className="text-xs font-semibold text-violet-900 mt-0.5">{result.nextCampaignIdea}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
