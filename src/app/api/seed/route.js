// src/app/api/seed/route.js
import dbConnect from "@/lib/dbConnect";
import Tenant from "@/models/Tenant";
import User from "@/models/User";
import Note from "@/models/Note";
import bcrypt from 'bcryptjs';
import { NextResponse } from "next/server";

export async function GET() {
    await dbConnect();

    try {
        // Clear existing data
        await Note.deleteMany({});
        await User.deleteMany({});
        await Tenant.deleteMany({});

        // Create Tenants
        const acmeTenant = await Tenant.create({ name: 'Acme', slug: 'acme', subscriptionPlan: 'free' });
        const globexTenant = await Tenant.create({ name: 'Globex', slug: 'globex', subscriptionPlan: 'free' });

        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Users
        const users = [
            { email: 'admin@acme.test', password: hashedPassword, role: 'admin', tenantId: acmeTenant._id },
            { email: 'user@acme.test', password: hashedPassword, role: 'member', tenantId: acmeTenant._id },
            { email: 'admin@globex.test', password: hashedPassword, role: 'admin', tenantId: globexTenant._id },
            { email: 'user@globex.test', password: hashedPassword, role: 'member', tenantId: globexTenant._id },
        ];

        await User.insertMany(users);

        return NextResponse.json({ success: true, message: 'Database seeded successfully!' });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Seeding failed', error: error.message }, { status: 500 });
    }
}