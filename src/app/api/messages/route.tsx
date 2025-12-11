import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/app/libs/mongodb';
import Message from '@/app/models/messageModel';
import User from '@/app/models/user';

//llega al backend para obtener los mensajesss del buzón global
export const GET = async () => {
  try {
    await connect();
  
    const messages = await Message.find().sort({ createdAt: 1 });

    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const user = await User.findById(msg.senderId).select('fullname profilePicture');
        return {
          _id: msg._id,
          sender: user?.fullname || msg.senderName,          
          senderPicture: user?.profilePicture || null,        
          content: msg.content,
          timestamp: msg.createdAt,
        };
      })
    );
    // devuelve los mensajes con la info del usuario
    return NextResponse.json(populatedMessages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connect();

    const { senderId, content } = await req.json();

    const user = await User.findById(senderId);
    if (!user) throw new Error('Usuario no encontrado');

    const newMessage = new Message({
      senderId: user._id,
      senderName: user.fullname,          
      senderPicture: user.profilePicture, 
      content,
    });

    await newMessage.save();
 
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