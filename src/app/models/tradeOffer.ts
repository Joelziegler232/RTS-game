
import mongoose from 'mongoose';

const tradeOfferSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromResources: {
    type: Map,
    of: Number,
    required: true,
    default: () => new Map(),
  },
  toResources: {
    type: Map,
    of: Number,
    required: true,
    default: () => new Map(),
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, 
  },
});

export default mongoose.models.TradeOffer || mongoose.model('TradeOffer', tradeOfferSchema);