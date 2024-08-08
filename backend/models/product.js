// mongoose tutorial
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // refer to the ID in User model
    required: true
  },
  isGiveAway: {
    type: Boolean,
    default: false
  },
  isSelled: {
    type: Boolean,
    default: false
  },
  swapStatus: {
    type: String,
    enum: ['none', 'requested', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  swapWithProductId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  giveawayRequests: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['requested', 'pending', 'approved', 'rejected'],
      default: 'requested'
    },
    requestDate: {
      type: Date,
      default: Date.now
    }
  }],
  giveawayWinner: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    selectedAt: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);