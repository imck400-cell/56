
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import LessonPlanner from './components/LessonPlanner';
import AIChat from './components/AIChat';
import AudioTranscriber from './components/AudioTranscriber';
import TextToSpeech from './components/TextToSpeech';
import ImageGenerator from './components/ImageGenerator';
import type { LessonPlan } from './types';

export type View = 'welcome' | 'planner' | 'chat' | 'transcriber' | 'tts' | 'image-gen';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('welcome');
    const [lessonToLoad, setLessonToLoad] = useState<LessonPlan | null>(null);

    const handleNavigate = (view: View, lesson: LessonPlan | null = null) => {
        setLessonToLoad(lesson);
        setCurrentView(view);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 font-sans" dir="rtl">
            {currentView === 'welcome' && <WelcomeScreen onNavigate={handleNavigate} />}
            {currentView === 'planner' && <LessonPlanner lesson={lessonToLoad} onBackToWelcome={() => handleNavigate('welcome')} />}
            {currentView === 'chat' && <AIChat onBack={() => handleNavigate('welcome')} />}
            {currentView === 'transcriber' && <AudioTranscriber onBack={() => handleNavigate('welcome')} />}
            {currentView === 'tts' && <TextToSpeech onBack={() => handleNavigate('welcome')} />}
            {currentView === 'image-gen' && <ImageGenerator onBack={() => handleNavigate('welcome')} />}
        </div>
    );
};

export default App;