// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Allow public routes
    if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/health') || pathname.startsWith('/api/seed') || pathname === '/') {
        return NextResponse.next();
    }

    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return new NextResponse(JSON.stringify({ message: 'Authentication token missing' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        
        // Attach decoded token to request headers for API routes
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('X-User-Id', payload.userId);
        requestHeaders.set('X-Tenant-Id', payload.tenantId);
        requestHeaders.set('X-User-Role', payload.role);

        const response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        return response;

    } catch (err) {
        return new NextResponse(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/api/notes/:path*', '/api/tenants/:path*'],
};