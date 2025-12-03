import Message from '@/app/models/messageModel';

// Obtiene todos los mensajes del chat global
export const getMessages = async () => {
  try {
    const messages = await Message.find();
    return messages;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Crea y guarda un nuevo mensaje en el chat global
export const createMessage = async (body: any) => {
  try {
    const newMessage = new Message(body);
    await newMessage.save();
    return newMessage;
  } catch (error: any) {
    throw new Error(error.message);
  }
};