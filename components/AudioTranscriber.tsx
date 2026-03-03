
import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiFeatures';

const AudioTranscriber: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Browsers usually record webm/ogg
                // Gemini expects raw data or specific containers. Let's convert to base64.
                await handleProcessAudio(blob);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("لا يمكن الوصول للميكروفون. يرجى التحقق من الصلاحيات.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleProcessAudio = async (blob: Blob) => {
        setIsProcessing(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                // Sending 'audio/webm' usually works if browser records webm.
                const result = await transcribeAudio(base64Audio, blob.type || 'audio/webm');
                setTranscription(result);
                setIsProcessing(false);
            };
        } catch (error) {
            setTranscription("حدث خطأ أثناء المعالجة.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-indigo-800">تحويل الصوت إلى نص</h2>
                    <button onClick={onBack} className="text-slate-500 hover:text-indigo-600">عودة</button>
                </div>

                <div className="flex flex-col items-center gap-6 mb-8">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-100 border-4 border-red-500 animate-pulse' : 'bg-indigo-50 border-4 border-indigo-200'}`}>
                        <button 
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`text-5xl ${isRecording ? 'text-red-600' : 'text-indigo-600'}`}
                        >
                            {isRecording ? '⏹' : '🎙'}
                        </button>
                    </div>
                    <p className="text-slate-600 font-medium">
                        {isRecording ? "جاري التسجيل... اضغط للإيقاف" : "اضغط الميكروفون للبدء"}
                    </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[200px]">
                    <h3 className="text-sm font-bold text-slate-500 mb-2">النص الناتج:</h3>
                    {isProcessing ? (
                        <div className="flex items-center gap-2 text-indigo-600">
                            <span className="animate-spin">⏳</span> جاري المعالجة والتحويل...
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap text-lg text-slate-800 leading-relaxed">
                            {transcription || "سيظهر النص هنا بعد التسجيل..."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioTranscriber;
