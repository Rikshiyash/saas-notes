// src/app/api/notes/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Note from '@/models/Note';
import Tenant from '@/models/Tenant';

// GET all notes for the tenant
export async function GET(request) {
    await dbConnect();
    const tenantId = request.headers.get('X-Tenant-Id');

    try {
        const notes = await Note.find({ tenantId }).sort({ createdAt: -1 });
        const tenant = await Tenant.findById(tenantId);
        const noteCount = await Note.countDocuments({ tenantId });
        
        return NextResponse.json({ 
            notes, 
            subscriptionPlan: tenant.subscriptionPlan,
            noteCount
        });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error' }, { status: 500 });
    }
}

// POST a new note
export async function POST(request) {
    await dbConnect();
    const tenantId = request.headers.get('X-Tenant-Id');
    const userId = request.headers.get('X-User-Id');
    const { title, content } = await request.json();

    try {
        const tenant = await Tenant.findById(tenantId);
        if (tenant.subscriptionPlan === 'free') {
            const noteCount = await Note.countDocuments({ tenantId });
            if (noteCount >= 3) {
                return NextResponse.json({ message: 'Free plan limit of 3 notes reached. Please upgrade.' }, { status: 403 });
            }
        }

        const newNote = await Note.create({ title, content, tenantId, userId });
        return NextResponse.json(newNote, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
    }
}