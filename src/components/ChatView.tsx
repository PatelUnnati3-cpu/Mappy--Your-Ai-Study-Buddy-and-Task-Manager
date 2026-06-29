import React, { useRef, useEffect, useState } from 'react';
import { 
  Send, Mic, RefreshCw, Heart, Target, Smile, 
  Trash2, BookOpen, Flame, HelpCircle, AlertCircle,
  Paperclip, FileText, X
} from 'lucide-react';
import { Message, Theme } from '../types';

interface ChatViewProps {
  activeChat: Message[];
  inputValue: string;
  setInputValue: (t: string) => void;
  handleSendMessage: (customText?: string) => Promise<void>;
  isLoading: boolean;
  theme: Theme;
  isListening: boolean;
  startVoiceInput: () => void;
  recognitionError: string | null;
  setIsListening: (listening: boolean) => void;
  onClearHistory: () => void;
  onConfessDistraction: () => void;
}

export default function ChatView({
  activeChat,
  inputValue,
  setInputValue,
  handleSendMessage,
  isLoading,
  theme,
  isListening,
  startVoiceInput,
  recognitionError,
  setIsListening,
  onClearHistory,
  onConfessDistraction
}: ChatViewProps) {
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachment, setAttachment] = useState<{ name: string; type: string; size: string; previewUrl?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKb = (file.size / 1024).toFixed(1) + ' KB';
    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);
    
    let previewUrl: string | undefined = undefined;
    if (isImage) {
      previewUrl = URL.createObjectURL(file);
    }

    setAttachment({
      name: file.name,
      type: file.type || 'application/octet-stream',
      size: sizeInKb,
      previewUrl
    });
  };

  const handleRemoveAttachment = () => {
    if (attachment?.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    };
  }, [attachment]);

  const handleSend = () => {
    const textToSend = inputValue;
    if (!textToSend.trim() && !attachment) return;

    if (attachment) {
      const fileExt = attachment.name.split('.').pop()?.toUpperCase() || 'FILE';
      const enrichedText = `${textToSend.trim() ? textToSend + '\n' : ''}📎 [Attached ${fileExt} Document: ${attachment.name}]`;
      handleSendMessage(enrichedText);
    } else {
      handleSendMessage(textToSend);
    }
    handleRemoveAttachment();
  };
  
  // Auto-scroll on loading or chat updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat, isLoading]);

  // Quick pre-made templates to simulate student intents
  const textTemplates = [
    { label: "Maa, break down history essay", text: "Maa, please help me break down my world history revision into micro-steps." },
    { label: "Papa, suggest math websites", text: "Papa, please suggest a resource or book recommendation where I can master integration rules." },
    { label: "Confess scrolling phone", text: "I got distracted and scrolled on my social media phone..." }
  ];

  // Advanced text formattings with links & list support
  const formatCoachingMessage = (rawText: string) => {
    let cleanText = rawText;
    let isMaaVoice = false;
    let isPapaVoice = false;
    
    if (rawText.startsWith('[MAA]')) {
      isMaaVoice = true;
      cleanText = rawText.replace(/^\[MAA\]\s*/i, '');
    } else if (rawText.startsWith('[PAPA]')) {
      isPapaVoice = true;
      cleanText = rawText.replace(/^\[PAPA\]\s*/i, '');
    }

    const lines = cleanText.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm">
        {isMaaVoice && theme !== 'Clean Slate' && (
          <div className="text-[10px] font-space font-extrabold tracking-wider text-rose-500 mb-1 flex items-center gap-1.5 uppercase">
            <Heart className="w-3.5 h-3.5 fill-rose-500 animate-pulse" /> Maa is speaking
          </div>
        )}
        {isPapaVoice && theme !== 'Clean Slate' && (
          <div className="text-[10px] font-space font-extrabold tracking-wider text-amber-500 mb-1 flex items-center gap-1.5 uppercase">
            <Flame className="w-3.5 h-3.5 fill-amber-500" /> Papa Coach is speaking
          </div>
        )}
        
        {lines.map((line, idx) => {
          // Detect micro-step tasks
          const isCheckItem = line.match(/^[\s*-]*\[\s*\]\s*(.+)$/);
          if (isCheckItem) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-3 py-1 border-l-2 border-[#6366F1]/40 my-1 bg-stone-50/50 rounded-r-lg font-mono text-[11px] text-stone-700 leading-snug">
                <span className="w-2.5 h-2.5 rounded-full border border-[#6366F1] flex-shrink-0 mt-0.5"></span>
                <span>{isCheckItem[1].trim()}</span>
              </div>
            );
          }

          // Format custom markdown links
          let elements: React.ReactNode[] = [];
          let lastIndex = 0;
          const linkRegex = /\[(.*?)\]\((.*?)\)/g;
          let match;
          let lineKey = 0;

          while ((match = linkRegex.exec(line)) !== null) {
            const index = match.index;
            if (index > lastIndex) {
              const part = line.substring(lastIndex, index);
              elements.push(<span key={lineKey++}>{part}</span>);
            }
            elements.push(
              <a 
                key={lineKey++}
                href={match[2]} 
                target="_blank" 
                rel="noreferrer" 
                className="underline font-bold text-[#6366F1] hover:text-[#4F46E5] inline-flex items-center gap-0.5"
              >
                {match[1]} <BookOpen className="w-3 h-3 ml-0.5 inline-block" />
              </a>
            );
            lastIndex = linkRegex.lastIndex;
          }

          if (lastIndex < line.length) {
            elements.push(<span key={lineKey++}>{line.substring(lastIndex)}</span>);
          }

          const renderedLine = elements.length > 0 ? elements : [line];
          
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const bulletText = line.replace(/^[\s*-]*/, '');
            return (
              <li key={idx} className="list-disc ml-4 py-0.5 leading-relaxed text-stone-700 font-medium">
                {bulletText}
              </li>
            );
          }

          if (line.trim() === '') return <div key={idx} className="h-2"></div>;

          return <p key={idx} className="leading-relaxed text-stone-700 font-medium">{renderedLine}</p>;
        })}
      </div>
    );
  };

  const handleQuickSend = (text: string) => {
    setInputValue(text);
    handleSendMessage(text);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden tab-transition-content p-4 lg:p-0" id="chat-panel-view">
      
      <div className="bg-white border border-stone-100 shadow-xl rounded-2xl p-5 flex-1 overflow-hidden min-h-0 flex flex-col">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs font-space font-extrabold uppercase tracking-wider text-[#0A1128]">
              Mappy Parent Mentorship Box
            </span>
          </div>
          
          <button
            onClick={onClearHistory}
            className="text-stone-400 hover:text-red-500 transition duration-150 p-1.5 rounded-lg cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Pane */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          {activeChat.map((msg) => {
            const isAI = msg.sender === 'model';
            
            // Icon assignment based on Maa vs Papa vs Student
            let avatarClass = "bg-stone-100 border-stone-200 text-stone-500 shadow-sm";
            let avatarIcon = "🎓";

            if (isAI) {
              if (msg.text.startsWith('[MAA]')) {
                avatarClass = "bg-rose-50 border-rose-200 text-rose-500 shadow-md";
                avatarIcon = "🌸";
              } else if (msg.text.startsWith('[PAPA]')) {
                avatarClass = "bg-amber-50 border-amber-200 text-amber-600 shadow-md";
                avatarIcon = "💼";
              } else {
                avatarClass = "bg-purple-50 border-purple-200 text-[#6366F1] shadow-md";
                avatarIcon = "🤖";
              }
            }

            return (
              <div 
                key={msg.id} 
                className={`flex gap-3.5 ${isAI ? 'justify-start animate-fade-in' : 'justify-end'}`}
              >
                {isAI && (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border ${avatarClass}`}>
                    {avatarIcon}
                  </div>
                )}
                
                <div className={`rounded-2xl px-4.5 py-3.5 max-w-[85%] text-sm shadow-xs border relative ${
                  isAI 
                    ? 'bg-[#FAFAFA] border-stone-100 text-[#0A1128] rounded-tl-none' 
                    : 'bg-gradient-to-tr from-[#7C3AED] to-[#6366F1] text-white border-transparent rounded-tr-none'
                }`}>
                  {isAI ? (
                    formatCoachingMessage(msg.text)
                  ) : (
                    <p className="leading-relaxed font-medium text-xs sm:text-sm">{msg.text}</p>
                  )}
                  <div className={`text-[8px] font-mono mt-1.5 text-right ${isAI ? 'text-stone-400' : 'text-purple-200'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {!isAI && (
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold border bg-purple-50 border-purple-200 text-[#6366F1] shadow-sm`}>
                    🎓
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 justify-start items-center">
              <div className="w-9 h-9 rounded-full border border-purple-200 bg-purple-50 text-[#6366F1] flex items-center justify-center flex-shrink-0 animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="bg-[#FAFAFA] border border-stone-100 rounded-2xl rounded-tl-none py-3.5 px-4.5 shadow-xs max-w-[80%] animate-pulse">
                <span className="text-xs text-stone-500 font-semibold font-mono">
                  {theme === 'Ghar Jaisa' && 'Maa is breaking down syllabus tasks for you, beta...'}
                  {theme === 'Level Up' && 'Generating quest reward checkpoint (+100 XP)...'}
                  {theme === 'Clean Slate' && 'Analyzing study targets...'}
                  {theme === 'Serious' && 'Papa is setting seriousness score targets...'}
                </span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Command Helper Templates */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap flex-shrink-0 pb-1.5 border-b border-stone-50">
          <span className="text-[9px] font-space font-extrabold tracking-wider text-stone-400 uppercase flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Study templates:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {textTemplates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => handleQuickSend(tpl.text)}
                disabled={isLoading}
                className="bg-[#FAFAFA] hover:bg-stone-50 border border-stone-200 text-stone-600 rounded-xl px-2.5 py-1 text-[10px] font-bold cursor-pointer transition select-none hover:border-purple-300"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Drawer Area */}
        <div className="mt-3.5 flex flex-col gap-2.5 flex-shrink-0">
          {/* File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />

          {/* Attachment Preview Badge */}
          {attachment && (
            <div className="flex items-center gap-2 bg-[#FAFAFA] border border-stone-150 p-2.5 rounded-2xl animate-fade-in self-start max-w-full">
              {attachment.previewUrl ? (
                <img 
                  src={attachment.previewUrl} 
                  alt="Attachment preview" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 object-cover rounded-xl border border-stone-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#6366F1]">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0 pr-2">
                <p className="text-[11px] font-bold text-[#0A1128] truncate max-w-[160px] sm:max-w-[240px]">
                  {attachment.name}
                </p>
                <p className="text-[9px] text-stone-400 font-mono font-bold">
                  {attachment.size} • {attachment.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="p-1 hover:bg-stone-200 rounded-full text-stone-500 hover:text-red-500 transition cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              placeholder={
                theme === 'Ghar Jaisa' ? "Ask Maa to break down study topic (beta)..." :
                theme === 'Level Up' ? "State quest to gather level checkpoints..." :
                "Ask Mappy to split study milestones..."
              }
              className="bg-[#FAFAFA] border border-stone-200/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#0A1128] focus:outline-none focus:ring-2 focus:ring-[#6366F1] placeholder-stone-400 font-medium w-full transition"
              disabled={isLoading}
            />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full flex-shrink-0 transition cursor-pointer flex items-center justify-center"
              title="Attach student file"
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={startVoiceInput}
              className={`p-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full flex-shrink-0 transition cursor-pointer flex items-center justify-center ${
                isListening ? 'animate-ping bg-red-100 text-red-600' : ''
              }`}
              title="Speak voice input"
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              className="p-3.5 bg-gradient-to-tr from-[#7C3AED] to-[#6366F1] text-white rounded-full flex-shrink-0 transition hover:opacity-95 active:scale-95 flex items-center justify-center shadow-md shadow-purple-200 cursor-pointer"
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Micro Listening simulation console */}
          {isListening && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-950 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2 font-space font-extrabold mb-1">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Listening Vocal transcript...
              </div>
              
              {recognitionError ? (
                <div>
                  <p className="text-[10px] text-red-600 mb-3 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {recognitionError}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => { setInputValue("Maa, break down history."); setIsListening(false); }}
                      className="bg-white hover:bg-rose-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-[10px] font-bold cursor-pointer transition"
                    >
                      "Maa, break down history"
                    </button>
                    <button 
                      onClick={() => { setInputValue("Papa, my seriousness is high, guide me."); setIsListening(false); }}
                      className="bg-white hover:bg-rose-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-[10px] font-bold cursor-pointer transition"
                    >
                      "Papa, my seriousness is high"
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] opacity-80 font-medium">Listening to speech. Click simulated buttons above to transcribe study prompts directly.</p>
              )}
              
              <button 
                onClick={() => setIsListening(false)}
                className="text-stone-500 hover:text-stone-900 font-bold underline text-[10px] block mt-2 cursor-pointer"
              >
                Close Simulator
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
