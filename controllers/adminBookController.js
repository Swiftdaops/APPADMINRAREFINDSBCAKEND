const mongoose = require('mongoose');

// Admin-only: delete books by title(s)
// POST /api/admin/books/delete-by-title
// Body: { titles: ['Title 1', 'Title 2'] }
exports.deleteByTitles = async (req, res, next) => {
  try {
    const { titles } = req.body;
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return res.status(400).json({ message: 'titles array required' });
    }

    const db = mongoose.connection.db;

    // Delete from both 'books' and 'ebooks' collections if they exist
    const results = [];
    for (const collName of ['books', 'ebooks']) {
      const collections = await db.listCollections({ name: collName }).toArray();
      if (collections.length === 0) continue;
      const q = { title: { $in: titles } };
      const r = await db.collection(collName).deleteMany(q);
      results.push({ collection: collName, deletedCount: r.deletedCount });
    }

    res.json({ ok: true, results });
  } catch (err) {
    next(err);
  }
};
