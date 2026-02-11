import { useState, useEffect, useRef } from 'react';
import type { Message, Conversation } from '../types';
import { getStatus, sendChat } from '../api';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversationId, conversations]);

  const currentMessages = currentConversationId 
    ? conversations.find(c => c.id === currentConversationId)?.messages || []
    : [];

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Neue Konversation',
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setCurrentConversationId(remaining[0]?.id || null);
    }
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
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
    
    setConversations(prev => prev.map(c => 
      c.id === currentConversationId 
        ? {
            ...c,
            messages: [...c.messages, userMessage],
            title: c.messages.length === 0 ? input.substring(0, 30) + '...' : c.title
          }
        : c
    ));
    
    const currentInput = input;
    setInput('');
    setLoading(true);
    setError('');

    const result = await sendChat(currentInput);

    if (result.error) {
      setError(result.error);
    } else if (result.response) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setConversations(prev => prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      ));
    }

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
    deleteConversation,
    selectConversation,
    sendMessage,
  };
}