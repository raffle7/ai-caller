// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

