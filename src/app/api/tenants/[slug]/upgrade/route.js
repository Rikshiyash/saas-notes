// src/app/api/tenants/[slug]/upgrade/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Tenant from '@/models/Tenant';

export async function POST(request, { params }) {
    await dbConnect();
    const { slug } = params;
    const role = request.headers.get('X-User-Role');
    const tenantId = request.headers.get('X-Tenant-Id');

    if (role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden: Only admins can upgrade subscriptions.' }, { status: 403 });
    }

    try {
        const tenant = await Tenant.findOne({ _id: tenantId, slug: slug });
        if (!tenant) {
            return NextResponse.json({ message: 'Tenant not found or mismatched slug.' }, { status: 404 });
        }

        tenant.subscriptionPlan = 'pro';
        await tenant.save();

        return NextResponse.json({ message: 'Subscription upgraded to Pro successfully!', tenant });
    } catch (error) {
        return NextResponse.json({ message: 'Server Error', error: error.message }, { status: 500 });
    }
}