// utils/msgServices.ts
const baseURL = '/api';

export const getMessages = async () => {
  const response = await fetch(`${baseURL}/messages`);
  if (!response.ok) throw new Error('Error al cargar mensajes');
  return response.json();
};

export const sendMessage = async (senderId: string, content: string) => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderId, content }),
  });
  if (!response.ok) throw new Error('Error al enviar');
  return response.json();
};