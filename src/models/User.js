import mongoose from 'mongoose';
import Tenant from './Tenant'; // <-- THE FIX IS THIS LINE

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);