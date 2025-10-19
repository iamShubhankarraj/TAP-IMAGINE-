// lib/ai/gemini-config.ts

export const GEMINI_CONFIG = {
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    maxRetries: 3,
    timeout: 60000, // 60 seconds
  };
  
  export const FUNNY_LOADING_MESSAGES = [
    "Teaching monkeys to use Photoshop... 🐵",
    "Polishing pixels to perfection... ✨",
    "Consulting with Leonardo da Vinci... 🎨",
    "Negotiating with the color palette... 🌈",
    "Feeding the hamsters that power our servers... 🐹",
    "Making your photo look bananas! 🍌",
    "Convincing AI not to add laser eyes... 👀",
    "Searching for the perfect filter in a parallel universe... 🌌",
    "Converting caffeine into creative code... ☕",
    "Whispering sweet nothings to the algorithm... 💝",
    "Bribing the pixels with cookies... 🍪",
    "Asking the internet for creative advice... 🌐",
    "Summoning the spirit of Bob Ross... 🖌️",
    "Calibrating the awesome-inator... 🔧",
    "Sprinkling magic dust on your image... ✨",
    "Consulting the ancient scrolls of Photoshop... 📜",
    "Convincing electrons to dance in formation... 💃",
    "Applying quantum creativity principles... ⚛️",
    "Rewiring the matrix for extra pizzazz... 🔌",
    "Downloading more RAM from the cloud... ☁️",
  ];
  
  export function getRandomLoadingMessage(): string {
    return FUNNY_LOADING_MESSAGES[Math.floor(Math.random() * FUNNY_LOADING_MESSAGES.length)];
  }