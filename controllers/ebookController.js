const Ebook = require('../models/Ebook');
const mongoose = require('mongoose');

// GET /api/appadmin/ebooks
// Return all books across owners. Prefer the existing 'books' collection if present
// and perform a lookup to enrich owner info. Falls back to the 'ebooks' collection
// (Ebook model) if 'books' is not present.
exports.listEbooks = async (req, res, next) => {
  try {
    // Use the mongoose connection's native db instance
    const db = mongoose.connection.db;

    // Check if a 'books' collection exists
    const collections = await db.listCollections({ name: 'books' }).toArray();
    if (collections.length > 0) {
      // Use aggregation to join owner info from 'owners' collection
      const agg = await db.collection('books').aggregate([
        { $sort: { createdAt: -1 } },
        // If books store owner as ObjectId in `owner` field
        {
          $lookup: {
            from: 'owners',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner_doc',
          },
        },
        {
          $unwind: {
            path: '$owner_doc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            owner: {
              _id: '$owner_doc._id',
              storeName: '$owner_doc.storeName',
              whatsappNumber: '$owner_doc.whatsappNumber',
            },
          },
        },
        {
          $project: { owner_doc: 0 },
        },
      ]).toArray();

      return res.json(agg);
    }

    // Fallback to Ebook model (collection 'ebooks')
    const ebooks = await Ebook.find({}).sort({ createdAt: -1 }).lean();
    res.json(ebooks);
  } catch (err) {
    next(err);
  }
};
