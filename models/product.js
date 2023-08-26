const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  size: [{
    type: String,
    required: true,
  }],
  description: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    default: 'unisex',
    required: true,
  },
  collectionSeason: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
