#!/usr/bin/env node
/**
 * Admin script to approve or delete an owner (stored in shared 'admins' collection).
 * Usage:
 *   node scripts/ownerAdminActions.js approve <email>
 *   node scripts/ownerAdminActions.js delete <email>
 */
require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  const [,, action, email] = process.argv;
  if (!action || !email || !['approve','delete'].includes(action)) {
    console.log('Usage: node scripts/ownerAdminActions.js <approve|delete> <email>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.collection('admins');
  if (action === 'approve') {
    const res = await collection.updateOne({ email }, { $set: { status: 'approved' } });
    console.log('Approve result:', res.modifiedCount ? 'UPDATED' : 'NOT FOUND');
  } else if (action === 'delete') {
    const res = await collection.deleteOne({ email });
    console.log('Delete result:', res.deletedCount ? 'DELETED' : 'NOT FOUND');
  }
  await mongoose.disconnect();
  process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });
