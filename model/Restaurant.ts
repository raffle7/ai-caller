// models/Restaurant.ts
import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
});

const DealSchema = new mongoose.Schema({
  name: String,
  description: String,
  items: [MenuItemSchema],
  price: Number,
});

const RestaurantSchema = new mongoose.Schema({
  name: String,
  locations: [String],
  ownerName: String,
  restaurantNumber: String,
  aiNumber: String,
  posSystem: {
    type: String,
    enum: ['Square', 'Toast', 'Clover'],
  },
  posApiKey: String,
  menu: [MenuItemSchema],
  deals: [DealSchema],
  language: { type: String },      // ⬅️ ADD
  voice: { type: String },         // ⬅️ ADD
  accent: { type: String },        // ⬅️ ADD
  step:{type: Number, default: 1}, // ⬅️ ADD
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  setupComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Restaurant || mongoose.model('Restaurant', RestaurantSchema);

