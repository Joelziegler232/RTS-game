import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/app/libs/mongodb";
import TradeOffer from "@/app/models/tradeOffer";
import { getToken } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connect();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.sub) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const offers = await TradeOffer.find({
    $or: [
      { fromUser: token.sub },  
      { toUser: token.sub }     
    ],
    status: 'pending'          
  })
    .populate('fromUser', 'fullname profilePicture')  
    .populate('toUser', 'fullname profilePicture')    
    .sort({ createdAt: -1 });                         

  return NextResponse.json(offers);
}