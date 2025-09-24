// src/app/api/notes/[id]/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Note from '@/models/Note';

// DELETE a specific note
export async function DELETE(request, { params }) {
    await dbConnect();
    const { id } = params;
    const tenantId = request.headers.get('X-Tenant-Id');

    try {
        const note = await Note.findOne({ _id: id, tenantId });
        if (!note) {
            return NextResponse.json({ message: 'Note not found or you do not have permission' }, { status: 404 });
        }

        await Note.deleteOne({ _id: id });
        return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}