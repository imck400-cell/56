
import React, { useState } from 'react';
import { generateImage } from '../services/geminiFeatures';

const ImageGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        // Check if user has selected an API key (required for gemini-3-pro-image-preview)
        if (window.aistudio) {
            try {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            } catch (error) {
                console.error("API Key selection error:", error);
            }
        }

        setIsLoading(true);
        setGeneratedImage(null);
        try {
            const base64Image = await generateImage(prompt, size);
            setGeneratedImage(base64Image);
        } catch (error: any) {
            console.error(error);
            // Handle permission errors by prompting for key again
            if (error.toString().includes('403') || error.toString().includes('PERMISSION_DENIED') || error.message?.includes('Requested entity was not found')) {
                 if (window.aistudio) {
                     try {
                         await window.aistudio.openSelectKey();
                     } catch(e) {}
                     alert("يرجى اختيار مفتاح API صالح لمتابعة الطلب.");
                 } else {
                     alert("خطأ في الصلاحيات (403). يرجى التحقق من مفتاح API.");
                 }
            } else {
                alert("فشل توليد الصورة. الرجاء المحاولة مرة أخرى.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-indigo-800">توليد الصور بالذكاء الاصطناعي</h2>
                    <button onClick={onBack} className="text-slate-500 hover:text-indigo-600">عودة</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">وصف الصورة (Prompt):</label>
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="وصف دقيق للصورة المراد إنشاؤها..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">الجودة:</label>
                        <select 
                            value={size} 
                            onChange={(e) => setSize(e.target.value as any)}
                            className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                        >
                            <option value="1K">1K (Standard)</option>
                            <option value="2K">2K (High Res)</option>
                            <option value="4K">4K (Ultra HD)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2 mb-8"
                >
                    {isLoading ? 'جاري الرسم...' : '✨ إنشاء الصورة'}
                </button>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300">
                        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500">جاري معالجة طلبك...</p>
                    </div>
                )}

                {generatedImage && (
                    <div className="bg-slate-900 p-2 rounded-lg shadow-2xl">
                        <img src={generatedImage} alt="Generated" className="w-full h-auto rounded" />
                        <div className="mt-2 text-center">
                            <a 
                                href={generatedImage} 
                                download={`generated-image-${Date.now()}.png`}
                                className="inline-block bg-white text-slate-900 px-4 py-2 rounded text-sm font-bold hover:bg-slate-200"
                            >
                                تحميل الصورة ⬇️
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
