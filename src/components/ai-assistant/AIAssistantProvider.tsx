// components/ai-assistant/AIAssistantProvider.tsx
"use client";

import React, { createContext, useContext, useState, useRef } from 'react';
import AIAssistantWidget from './AIAssistantWidget';

interface AIAssistantContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string) => void;
  setContextualPrompts: (prompts: string[]) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (!context) {
    throw new Error('useAIAssistant must be used within AIAssistantProvider');
  }
  return context;
};

interface AIAssistantProviderProps {
  children: React.ReactNode;
}

export default function AIAssistantProvider({ children }: AIAssistantProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextualPrompts, setContextualPrompts] = useState<string[]>([]);
  const widgetRef = useRef<{ sendMessage: (message: string) => void }>(null);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  
  const sendMessage = (message: string) => {
    if (!isOpen) setIsOpen(true);
    widgetRef.current?.sendMessage(message);
  };

  return (
    <AIAssistantContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        sendMessage,
        setContextualPrompts,
      }}
    >
      {children}
      <AIAssistantWidget
        ref={widgetRef}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        contextualPrompts={contextualPrompts}
      />
    </AIAssistantContext.Provider>
  );
}
