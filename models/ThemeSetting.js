const mongoose = require('mongoose');

const themeSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global-theme',
    },
    themeMode: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ThemeSetting', themeSettingSchema);
