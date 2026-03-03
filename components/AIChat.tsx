
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini } from '../services/geminiFeatures';

const AIChat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Convert simple message format to API history format
            const history = messages.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const response = await chatWithGemini(history, userMsg);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "عذراً، حدث خطأ في الاتصال." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-indigo-700">المساعد الذكي (Gemini Pro)</h2>
                <button onClick={onBack} className="text-slate-600 hover:text-slate-900">عودة</button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 mt-20">
                        <span className="text-6xl block mb-4">🤖</span>
                        <p>أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم في العملية التعليمية؟</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white text-slate-800 shadow rounded-bl-none border border-slate-200'
                        }`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-end">
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow border border-slate-200">
                            <div className="flex space-x-1 space-x-reverse">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2">
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 transform rotate-180">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="اكتب رسالتك هنا..." 
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default AIChat;
