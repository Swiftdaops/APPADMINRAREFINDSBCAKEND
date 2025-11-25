const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: false },
    description: { type: String },
    price: { type: mongoose.Schema.Types.Mixed },
    owner: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
      storeName: String,
      whatsappNumber: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ebook', ebookSchema);
