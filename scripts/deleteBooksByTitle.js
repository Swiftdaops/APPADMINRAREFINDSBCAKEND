/*
 Safe deletion script for local development.
 Usage:
  - Preview matches (no deletion):
      node scripts/deleteBooksByTitle.js
  - Actually delete the matched documents:
      node scripts/deleteBooksByTitle.js --yes

 The script reads MONGODB_URI from the environment (or .env), connects,
 searches both 'books' and 'ebooks' collections for the given patterns,
 prints matches, and deletes them only when --yes is provided.
*/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const util = require('util');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/rarefinds';
const doDelete = process.argv.includes('--yes');

const titlesToRemove = [
  'Traction Marketing',
];

const descriptionsToRemove = [
  'No description available.',
];

async function run() {
  console.log('[delete-script] connecting to', MONGODB_URI);
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  try {
    // Check both possible collections: 'books' and 'ebooks'
    for (const collName of ['books', 'ebooks']) {
      const collections = await db.listCollections({ name: collName }).toArray();
      if (collections.length === 0) continue;

      console.log(`\n[delete-script] Searching collection: ${collName}`);

      // Build query to match by title OR description
      const query = {
        $or: [
          { title: { $in: titlesToRemove } },
          { shortDescription: { $in: descriptionsToRemove } },
          { description: { $in: descriptionsToRemove } },
        ],
      };

      const docs = await db.collection(collName).find(query).toArray();
      if (!docs || docs.length === 0) {
        console.log('[delete-script] No matches found in', collName);
        continue;
      }

      console.log(`[delete-script] Found ${docs.length} match(es) in ${collName}:`);
      docs.forEach((d) => console.log(' -', d._id.toString(), '|', d.title || d.shortDescription || d.description || '[no title]'));

      if (doDelete) {
        const res = await db.collection(collName).deleteMany(query);
        console.log(`[delete-script] Deleted ${res.deletedCount} document(s) from ${collName}`);
      } else {
        console.log(`[delete-script] Run with --yes to delete these documents.`);
      }
    }
  } catch (err) {
    console.error('[delete-script] error', err && err.message ? err.message : util.inspect(err));
  } finally {
    await mongoose.disconnect();
    console.log('[delete-script] done');
  }
}

run().catch((e) => {
  console.error('Script failed', e);
  process.exit(1);
});
