const API_BASE_URL = 'http://127.0.0.1:8000';

export async function getStatus(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    return data.status || 'Verbunden';
  } catch (error) {
    console.error('Status-Fehler:', error);
    return 'Backend nicht erreichbar';
  }
}

export async function sendChat(message: string): Promise<{ response?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Fehler beim Senden der Nachricht' };
    }

    return { response: data.response };
  } catch (error) {
    console.error('Chat-Fehler:', error);
    return { error: 'Netzwerkfehler - Backend nicht erreichbar' };
  }
}