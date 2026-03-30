import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserEvent extends Document {
    user_id: string;          // Supabase user UUID
    product_id: string;       // Supabase product UUID
    category: string;         // e.g. "Aydınlatma", "Akıllı Ev"
    price: number;            // Product price at time of event
    event_type: 'view' | 'cart' | 'purchase' | 'project_view' | 'document_download' | 'inventory_check' | 'stylist_start';
    timestamp: Date;
}

const UserEventSchema = new Schema<IUserEvent>({
    user_id: { type: String, required: true, index: true },
    product_id: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    event_type: {
        type: String,
        enum: ['view', 'cart', 'purchase', 'project_view', 'document_download', 'inventory_check', 'stylist_start'],
        default: 'view',
    },
    timestamp: { type: Date, default: Date.now, index: true },
});

// TTL index: automatically expire events after 90 days
UserEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Prevent model overwrite in Next.js dev hot-reload
const UserEvent: Model<IUserEvent> =
    mongoose.models.UserEvent ||
    mongoose.model<IUserEvent>('UserEvent', UserEventSchema);

export default UserEvent;
