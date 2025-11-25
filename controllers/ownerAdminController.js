const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// Approve owner by email (sets status = 'approved')
const approveOwnerByEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email required');
  }

  // operate on 'owners' collection now that owners are stored separately
  const collection = mongoose.connection.collection('owners');
  const result = await collection.updateOne({ email }, { $set: { status: 'approved' } });
  if (result.matchedCount === 0) {
    res.status(404).json({ message: 'Owner not found' });
  } else {
    res.json({ message: 'Owner approved' });
  }
});

// Delete owner by email
const deleteOwnerByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;
  if (!email) {
    res.status(400);
    throw new Error('Email required');
  }
  // operate on 'owners' collection
  const collection = mongoose.connection.collection('owners');
  // find owner _id first
  const ownerDoc = await collection.findOne({ email });
  if (!ownerDoc) {
    res.status(404).json({ message: 'Owner not found' });
    return;
  }
  const ownerId = ownerDoc._id;
  // delete books belonging to this owner from 'books' collection
  const booksCollection = mongoose.connection.collection('books');
  await booksCollection.deleteMany({ owner: ownerId });
  const result = await collection.deleteOne({ email });
  if (result.deletedCount === 0) {
    res.status(500).json({ message: 'Failed to delete owner' });
  } else {
    res.json({ message: 'Owner and their books deleted' });
  }
});

// List owners, optionally filter by status (pending/approved/rejected)
const listOwners = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const collection = mongoose.connection.collection('owners');
  const query = {};
  if (status) query.status = status;
  const owners = await collection.find(query).toArray();
  res.json(owners);
});

module.exports = { approveOwnerByEmail, deleteOwnerByEmail, listOwners };
