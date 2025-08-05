// src/pages/inbox.tsx (o donde esté ubicado tu componente Inbox)
import React, { useEffect, useState } from 'react';
import { CardTitle, CardHeader, CardContent, CardFooter, Card } from '@/app/edificios/components/ui/card';
import { Textarea } from '@/app/edificios/components/ui/textarea';
import { Button } from '@/app/edificios/components/ui/button';
import { useSession } from 'next-auth/react'; // Importa el hook useSession de next-auth/react
import { getMessages, sendMessage } from '../utils/msgServices';

const Message = ({ sender, content, timestamp }: { sender: string; content: string; timestamp: string }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="rounded-lg w-8 h-8 bg-[#55efc4] text-2xl flex items-center justify-center">😁</div>
      <div className="grid gap-1 items-start text-sm">
        <div className="flex items-center gap-2">
          <div className="font-medium">{sender}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{timestamp}</div>
        </div>
        <div>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
};

const Inbox = () => {
  const { data: session } = useSession(); // Obtiene la sesión del usuario autenticado

  const [messages, setMessages] = useState<{ _id: string; sender: string; content: string; timestamp: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesData = await getMessages();
        setMessages(messagesData); // Actualiza el estado con los mensajes obtenidos
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
      }
    };
    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage || !session?.user?.name) return;
  
    const senderName = session.user.name as string; // Asegura que senderName es de tipo string
  
    try {
      await sendMessage(senderName, newMessage);
      // Actualiza localmente los mensajes después de enviar uno nuevo
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          _id: `${prevMessages.length + 1}`,
          sender: senderName, // Usar senderName que es garantizado ser string
          content: newMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };
  

  return (
    <Card className="max-w-md rounded-2xl w-full">
      <CardHeader className="px-4 pt-4">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <Message
              key={message._id}
              sender={message.sender}
              content={message.content}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Escribe tu mensaje..."
          />
          <Button onClick={handleSendMessage}>Enviar</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Inbox;
