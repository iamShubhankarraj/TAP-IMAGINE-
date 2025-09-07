import React, { useState, useEffect } from 'react';
import { Spinner } from './Spinner';

const funnyMessages = [
    "Teaching the AI about the 80s...",
    "Reticulating splines...",
    "Sharpening pixels...",
    "Consulting the digital muse...",
    "Unleashing creative nanobots...",
    "Mixing digital paints...",
    "Warming up the creativity core...",
    "Herding rogue pixels into formation...",
    "Don't worry, the AI is a trained professional.",
    "Generating masterpiece... please hold.",
    "Polishing the final image with stardust...",
];

export const LoadingOverlay: React.FC = () => {
    const [message, setMessage] = useState(funnyMessages[0]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = funnyMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % funnyMessages.length;
                return funnyMessages[nextIndex];
            });
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex flex-col items-center justify-center z-50 transition-opacity duration-300">
            <Spinner size="lg" />
            <p 
              className="text-xl text-gray-200 mt-6 font-medium tracking-wide text-center px-4"
              style={{ textShadow: '0 0 10px rgba(56, 189, 248, 0.5)' }}
            >
                {message}
            </p>
        </div>
    );
};