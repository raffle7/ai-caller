// models/Order.ts
import mongoose from 'mongoose';
const OrderSchema = new mongoose.Schema({
  restaurantId: mongoose.Schema.Types.ObjectId,
  customerNumber: String,
  items: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);