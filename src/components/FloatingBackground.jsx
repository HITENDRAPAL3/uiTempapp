import React, { useMemo } from 'react';
import gif1 from '../assets/giphy1.gif';
import gif2 from '../assets/giphy2.gif';
import gif4 from '../assets/giphy4.gif';
import gif5 from '../assets/giphy5.gif';
import gif6 from '../assets/giphy6.gif';

const FloatingBackground = () => {
    const gifs = [gif1, gif2, gif4, gif5, gif6];

    // Create an array of 12 floating "windows"
    const windows = useMemo(() => {
        return Array.from({ length: 12 }).map((_, i) => ({
            id: i,
            gif: gifs[i % gifs.length],
            left: (i * 10 + Math.random() * 5) + '%', // More uniform but jittered scattering
            size: Math.random() * 80 + 100 + 'px', // Slightly smaller range
            duration: Math.random() * 15 + 15 + 's', // Faster fall to prevent stagnation
            delay: Math.random() * -30 + 's',
            opacity: Math.random() * 0.3 + 0.3,
        }));
    }, []);

    return (
        <div className="floating-bg-container">
            {windows.map(win => (
                <div
                    key={win.id}
                    className="floating-window"
                    style={{
                        left: win.left,
                        width: win.size,
                        height: win.size,
                        animationDuration: win.duration,
                        animationDelay: win.delay,
                        opacity: win.opacity,
                    }}
                >
                    <div className="window-glass">
                        <img src={win.gif} alt="" className="window-gif" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FloatingBackground;
