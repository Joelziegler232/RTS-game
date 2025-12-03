import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/app/libs/mongodb';
import Message from '@/app/models/messageModel';
import User from '@/app/models/user';

// GET → Obtiene todo el historial del chat global
export const GET = async () => {
  try {
    await connect();

    // Traemos todos los mensajes ordenados por fecha (más viejo primero)
    const messages = await Message.find().sort({ createdAt: 1 });

    // Para cada mensaje, buscamos el nombre y foto ACTUAL del usuario
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findById(msg.senderId).select('fullname profilePicture');
        return {
          _id: msg._id,
          sender: user?.fullname || msg.senderName,           // Usa nombre actual si cambió
          senderPicture: user?.profilePicture || null,        // Usa foto actual si cambió
          content: msg.content,
          timestamp: msg.createdAt,
        };
      })
    );

    return NextResponse.json(populatedMessages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

// POST → Envía un nuevo mensaje al chat global
export const POST = async (req: NextRequest) => {
  try {
    await connect();

    // Obtener datos del cuerpo de la petición
    const { senderId, content } = await req.json();

    // Verificar que el usuario exista
    const user = await User.findById(senderId);
    if (!user) throw new Error('Usuario no encontrado');

    // Crear el nuevo mensaje con datos del usuario
    const newMessage = new Message({
      senderId: user._id,
      senderName: user.fullname,          // Guardamos el nombre actual por si cambia después
      senderPicture: user.profilePicture, // Guardamos la foto actual
      content,
    });

    await newMessage.save();

    // Devolver el mensaje creado (formato listo para el frontend)
    return NextResponse.json(
      {
        _id: newMessage._id,
        sender: user.fullname,
        senderPicture: user.profilePicture,
        content,
        timestamp: newMessage.createdAt,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};