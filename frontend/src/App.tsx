import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import type { Conversation, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Header from './components/Header';
import { getStatus, sendChat } from './api';

function App() {
  const [status, setStatus] = useState<string>('Verbinde...');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStatus().then(setStatus);
    startNewConversation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversationId, conversations]);

  const currentMessages = currentConversationId ? conversations.find(c => c.id === currentConversationId)?.messages || [] : [];

  const startNewConversation = () => {
    const newConversation: Conversation = { id: Date.now().toString(), title: 'Neue Konversation', messages: [], createdAt: new Date() };
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

  const selectConversation = (id: string) => setCurrentConversationId(id);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversationId) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: [...c.messages, userMessage], title: c.messages.length === 0 ? input.substring(0, 30) + '...' : c.title } : c));

    setInput('');
    setLoading(true);
    setError('');

    const result = await sendChat(input);
    if (result.error) {
      setError(result.error);
    } else if (result.response) {
      const assistantMessage: Message = { id: (Date.now() + 1).toString(), text: result.response, sender: 'assistant', timestamp: new Date() };
      setConversations(prev => prev.map(c => c.id === currentConversationId ? { ...c, messages: [...c.messages, assistantMessage] } : c));
    }

    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        {sidebarOpen && (
          <Box sx={{ width: 280, flexShrink: 0, backgroundColor: '#1a1a2e', color: '#fff' }}>
            <Sidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              startNewConversation={startNewConversation}
              selectConversation={selectConversation}
              deleteConversation={deleteConversation}
              status={status}
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </Box>
        )}

        <Box sx={{ flexGrow: 1, minWidth: 0, backgroundColor: '#fff' }}>
          <ChatArea
            messages={currentMessages}
            loading={loading}
            error={error}
            input={input}
            onInputChange={setInput}
            onSend={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
