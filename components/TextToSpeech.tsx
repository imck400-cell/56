
import React, { useState } from 'react';
import { generateSpeech } from '../services/geminiFeatures';

const TextToSpeech: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setAudioUrl(null);
        
        try {
            const audioBuffer = await generateSpeech(text);
            
            // Create Audio Context to decode and play/export
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const decodedBuffer = await audioContext.decodeAudioData(audioBuffer);
            
            // Convert buffer to wav blob for playback
            const wavBlob = bufferToWave(decodedBuffer, decodedBuffer.length);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);

        } catch (error) {
            console.error(error);
            alert("حدث خطأ أثناء توليد الصوت.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to convert AudioBuffer to WAV Blob (Simple implementation)
    const bufferToWave = (abuffer: AudioBuffer, len: number) => {
        let numOfChan = abuffer.numberOfChannels,
            length = len * numOfChan * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [], i, sample,
            offset = 0,
            pos = 0;
    
        // write WAVE header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"
    
        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded in this example)
    
        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length
    
        // write interleaved data
        for(i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));
    
        while(pos < len) {
            for(i = 0; i < numOfChan; i++) {             // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
                view.setInt16(44 + offset, sample, true);          // write 16-bit sample
                offset += 2;
            }
            pos++;
        }
    
        return new Blob([buffer], {type: "audio/wav"});
    
        function setUint16(data: number) {
            view.setUint16(pos, data, true);
            pos += 2;
        }
        function setUint32(data: number) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 p-6 items-center">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-indigo-800">تحويل النص إلى صوت (TTS)</h2>
                    <button onClick={onBack} className="text-slate-500 hover:text-indigo-600">عودة</button>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">النص المراد تحويله:</label>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-lg resize-none"
                        placeholder="اكتب النص هنا باللغة العربية أو الإنجليزية..."
                    />
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !text}
                    className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2"
                >
                    {isLoading ? <span className="animate-spin">⌛</span> : <span>🔊</span>}
                    {isLoading ? 'جاري التوليد...' : 'نطق النص'}
                </button>

                {audioUrl && (
                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center animate-fade-in">
                        <p className="text-green-800 font-bold mb-2">تم إنشاء الصوت بنجاح!</p>
                        <audio controls src={audioUrl} className="w-full" autoPlay />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextToSpeech;
