import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    subscriptionPlan: { type: String, enum: ['free', 'pro'], default: 'free' },
});

export default mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);