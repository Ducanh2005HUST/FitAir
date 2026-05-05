import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';

export function Chat() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'friend',
      text: 'こんにちは！今日のトレーニングはどうでしたか？',
      time: '10:42',
    },
    {
      id: 2,
      sender: 'me',
      text: 'お疲れ様です！今日はジムで1時間ほど筋トレしました。空気も良くて快適でしたよ！',
      time: '10:45',
    },
    {
      id: 3,
      sender: 'friend',
      text: 'それは素晴らしいですね！私も明日行こうと思っています。一緒に行きませんか？',
      time: '10:48',
    },
  ]);
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: 'me',
        text: inputText,
        time: `${hours}:${minutes}`,
      },
    ]);
    
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen w-full bg-white relative">
      {/* Chat Header */}
      <header className="flex items-center px-4 py-3 border-b border-gray-200 bg-white z-10 shrink-0 shadow-sm md:shadow-none min-h-[64px]">
        <div className="flex items-center flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors active:bg-gray-100 flex items-center gap-1"
            aria-label="戻る"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-[15px] font-medium hidden sm:inline">戻る</span>
          </button>
          
          <div className="flex items-center gap-3 ml-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1612993013894-3e0959edb6be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMG1hbiUyMHNtaWxpbmclMjBmYWNlJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzc1MjkwODgzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Avatar"
                className="w-[42px] h-[42px] rounded-full object-cover border border-gray-100 shadow-sm"
              />
              <span className="absolute bottom-0 right-[2px] w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-[16px] leading-tight">鈴木一郎</span>
              <span className="text-[12px] text-gray-500 leading-tight mt-0.5">オンライン</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat History */}
      <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-4 flex flex-col gap-4">
        <div className="text-center my-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">今日</span>
        </div>
        
        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end max-w-[80%] gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 shadow-sm
                    ${isMe 
                      ? 'bg-blue-600 text-white rounded-[16px]' 
                      : 'bg-[#F3F4F6] text-gray-900 rounded-[16px] border border-gray-100'
                    }`}
                >
                  <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                </div>
                
                {/* Timestamp */}
                <span className="text-[11px] text-gray-400 mb-1 flex-shrink-0">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Chat Input */}
      <footer className="p-3 bg-white border-t border-gray-100 shrink-0 pb-safe">
        <form 
          onSubmit={handleSend}
          className="flex items-end gap-2 max-w-4xl mx-auto w-full"
        >
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors mb-[2px]"
            aria-label="ファイルを添付"
          >
            <Paperclip className="w-[22px] h-[22px]" />
          </button>
          
          <div className="flex-1 relative bg-[#F9FAFB] rounded-full border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all flex items-center min-h-[44px]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="メッセージを入力..."
              className="w-full bg-transparent px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none rounded-full"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 h-[44px] bg-blue-600 text-white font-bold rounded-[16px] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm mb-[2px] flex items-center justify-center gap-2 text-sm"
            aria-label="送信"
          >
            <span>送信</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
}