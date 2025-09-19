import React, { useState } from 'react';
import { SparklesIcon, AdjustmentsIcon, DownloadIcon } from './Icons';
import { AIPanel } from './AIPanel';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { ExportPanel } from './ExportPanel';
import type { ClientAdjustments } from '../types';

type Panel = 'ai' | 'adjust' | 'export';

interface SidebarProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isImageUploaded: boolean;
    adjustments: ClientAdjustments;
    setAdjustments: (adjustments: ClientAdjustments) => void;
    editedImageUrl: string | null;
}

const NavButton: React.FC<{
    panelId: Panel;
    activePanel: Panel;
    onClick: (panel: Panel) => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ panelId, activePanel, onClick, children, disabled = false }) => {
    const isActive = activePanel === panelId;
    return (
        <button
            onClick={() => !disabled && onClick(panelId)}
            disabled={disabled}
            className={`relative flex flex-col items-center justify-center p-3 w-full transition-colors duration-200 group ${
                isActive
                    ? 'text-sky-400'
                    : 'text-gray-400 hover:bg-white/5'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Open ${panelId} panel`}
        >
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-400 rounded-r-full" style={{boxShadow: '0 0 10px #0EA5E9'}}></div>}
            {children}
        </button>
    );
};

export const Sidebar: React.FC<SidebarProps> = (props) => {
    const [activePanel, setActivePanel] = useState<Panel>('ai');

    const isAdjustDisabled = !props.editedImageUrl;

    return (
        <aside className="bg-[#1A1A1C]/60 border-r border-white/10 flex h-full">
            <div className="bg-[#0D0D0F] flex flex-col items-center justify-start w-20 border-r border-white/10 space-y-2 py-4">
                <NavButton panelId="ai" activePanel={activePanel} onClick={setActivePanel}>
                    <SparklesIcon className="w-7 h-7" />
                </NavButton>
                <NavButton panelId="adjust" activePanel={activePanel} onClick={setActivePanel} disabled={isAdjustDisabled}>
                    <AdjustmentsIcon className="w-7 h-7" />
                </NavButton>
                <NavButton panelId="export" activePanel={activePanel} onClick={setActivePanel} disabled={isAdjustDisabled}>
                    <DownloadIcon className="w-7 h-7" />
                </NavButton>
            </div>
            <div className="w-80 p-6 overflow-y-auto no-scrollbar">
                {activePanel === 'ai' && <AIPanel {...props} />}
                {activePanel === 'adjust' && !isAdjustDisabled && <AdjustmentsPanel {...props} />}
                {activePanel === 'export' && !isAdjustDisabled && <ExportPanel {...props} />}
            </div>
        </aside>
    );
};