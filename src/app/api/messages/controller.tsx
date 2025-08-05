// src/app/api/messages/controller.ts
import Message from '@/app/models/messageModel';

export const getMessages = async () => {
  try {
    const messages = await Message.find();
    return messages;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createMessage = async (body: any) => {
  try {
    const newMessage = new Message(body);
    await newMessage.save();
    return newMessage;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
