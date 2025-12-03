// Inbox.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/edificios/components/ui/card';
import { Textarea } from '@/app/edificios/components/ui/textarea';
import { Button } from '@/app/edificios/components/ui/button';
import { useSession } from 'next-auth/react';
import { getMessages, sendMessage } from '../utils/msgServices';
import Image from 'next/image';

const MessageItem = ({ sender, senderPicture, content, timestamp }: any) => {
  const date = new Date(timestamp).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="flex items-start gap-3 animate-in slide-in-from-left-2">
      {senderPicture ? (
        <Image
          src={senderPicture}
          alt={sender || "Guerrero"}
          width={32}
          height={32}
          className="rounded-full object-cover border-2 border-yellow-500 shadow-lg"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
          {sender ? sender[0].toUpperCase() : "?"}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400">{sender || "Anónimo"}</span>
          <span className="text-xs text-gray-500">· {date}</span>
        </div>
        <p className="text-white mt-1">{content}</p>
      </div>
    </div>
  );
};

const Inbox = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const data = await getMessages();
      setMessages(data);
    };
    fetch();
    const interval = setInterval(fetch, 5000); // Refresca cada 5 seg
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    await sendMessage(session.user.id as string, newMessage);
    setNewMessage('');
    const updated = await getMessages();
    setMessages(updated);
  };

  // ESTO BLOQUEA EL SCROLL DEL FONDO CUANDO ESTÁS EN EL BUZÓN
const handleWheel = (e: React.WheelEvent) => {
  const element = e.currentTarget;
  const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
  const atTop = element.scrollTop === 0;

  if (e.deltaY > 0 && atBottom) {
    e.preventDefault();
  } else if (e.deltaY < 0 && atTop) {
    e.preventDefault();
  }
};

  return (
    <Card className="max-w-md w-full bg-gray-900 border-yellow-600 border-4 shadow-2xl">
      <CardHeader className="bg-yellow-600 text-black">
        <CardTitle className="text-2xl font-black text-center">BUZÓN</CardTitle>
      </CardHeader>
     <CardContent 
  className="max-h-96 overflow-y-auto p-5 space-y-4 scrollbar-thin select-none"
  onWheel={(e) => {
    e.stopPropagation();
    const el = e.currentTarget;
    const atTop = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;

    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.preventDefault();
    }
  }}
  style={{ overscrollBehaviorY: 'contain' }}
>
  {messages.length === 0 ? (
    <p className="text-center text-gray-500 italic">No hay mensajes...</p>
  ) : (
    messages.map((msg) => (
      <MessageItem key={msg._id} {...msg} />
    ))
  )}
</CardContent>
      <CardFooter className="p-4 bg-gray-800 border-t-4 border-yellow-600">
        <div className="flex gap-2 w-full">
          <Textarea
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="bg-gray-700 text-white border-yellow-600 placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <Button onClick={handleSend} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
            Enviar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default Inbox;