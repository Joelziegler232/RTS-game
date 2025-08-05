import { connect } from '@/app/libs/mongodb';
import UserInstance from '@/app/models/instance';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { fullname, email, password } = await request.json();

        // Validar datos de entrada

        await connect();
        await UserInstance.create({ fullname, email, password });

        return NextResponse.json({ message: "User Instance created" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create user instance" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connect();
        const instance = await UserInstance.find();

        return NextResponse.json({ instance });
    } catch (error) {
        return NextResponse.json({ error: "Failed to retrieve user instances" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const id = request.nextUrl.searchParams.get("id");

        // Validar ID

        await connect();
        await UserInstance.findByIdAndDelete(id);

        return NextResponse.json({ message: "Instance Deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete instance" }, { status: 500 });
    }
}
