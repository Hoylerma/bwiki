// useChat.ts
import { useState, useEffect, useRef } from 'react';
import type { Message, Conversation } from '../types';
import { getStatus, handleSend, handleStop } from '../api';

export function useChat() {
  const [status, setStatus] = useState<string>('Verbinde...');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStatus().then(setStatus);
    startNewConversation();
  }, []);

  // Scrollen bei neuen Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const currentMessages = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId)?.messages || []
    : [];

  const startNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: Conversation = {
      id: newId,
      title: 'Neue Konversation',
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    // User Nachricht hinzufügen & Titel setzen
    setConversations(prev => prev.map(c => 
      c.id === currentConversationId 
        ? {
            ...c,
            messages: [...c.messages, userMessage],
            title: c.messages.length === 0 ? input.substring(0, 30) : c.title
          }
        : c
    ));
    
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError('');

   
    await handleSend(currentInput, currentConversationId, setConversations, setError);

    setLoading(false);
  };

  return {
    status,
    conversations,
    currentConversationId,
    currentMessages,
    input,
    loading,
    error,
    messagesEndRef,
    setInput,
    startNewConversation,
    deleteConversation: (id: string) => {
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(conversations.length > 1 ? conversations[0].id : null);
      }
    },
    selectConversation: (id: string) => setCurrentConversationId(id),
    sendMessage,
    stopGeneration: handleStop 
  };
}