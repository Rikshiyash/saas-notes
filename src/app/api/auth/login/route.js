import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from "next/server";

export async function POST(request) {
    console.log("\n--- [LOGIN ATTEMPT START] ---");

    try {
        console.log("[STEP 1] Connecting to database...");
        await dbConnect();
        console.log("[STEP 1] Database connection successful.");

        console.log("[STEP 2] Parsing request body...");
        const { email, password } = await request.json();
        console.log(`[STEP 2] Request body parsed. Email: ${email}`);

        if (!email || !password) {
            console.error("[ERROR] Email or password not provided in request.");
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        console.log("[STEP 3] Finding user in database...");
        const user = await User.findOne({ email }).populate('tenantId');
        if (!user) {
            console.error(`[ERROR] User with email "${email}" not found.`);
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        console.log("[STEP 3] User found successfully.");

        console.log("[STEP 4] Comparing password...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("[ERROR] Password does not match.");
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }
        console.log("[STEP 4] Password matched successfully.");

        console.log("[STEP 5] Creating JWT payload...");
        const payload = {
            userId: user._id,
            tenantId: user.tenantId._id,
            tenantSlug: user.tenantId.slug,
            role: user.role,
        };
        console.log("[STEP 5] Payload created.");

        console.log("[STEP 6] Checking for JWT_SECRET...");
        if (!process.env.JWT_SECRET) {
            console.error("[FATAL ERROR] JWT_SECRET environment variable is not set!");
            throw new Error("JWT_SECRET is not defined.");
        }
        console.log("[STEP 6] JWT_SECRET found.");

        console.log("[STEP 7] Signing JWT token...");
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log("[STEP 7] JWT token signed successfully.");

        console.log("--- [LOGIN ATTEMPT SUCCESS] ---\n");
        return NextResponse.json({ token });

    } catch (error) {
        console.error("\n--- [CRITICAL ERROR IN LOGIN ATTEMPT] ---");
        console.error(error); // This will print the actual error object
        console.error("--- [END OF CRITICAL ERROR] ---\n");
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}