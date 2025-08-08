const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a habit name'],
      trim: true,
      maxlength: [100, 'Habit name cannot be more than 100 characters'],
    },
    id: {
      type: Number,
      required: [true, 'Please add a unique identifier'],
      unique: true,
    },
    created_time: {
      type: String,
      required: [true, 'Please add creation timestamp'],
      validate: {
        validator: function(v) {
          return !isNaN(Date.parse(v));
        },
        message: 'Please provide a valid UTC timestamp for created_time'
      }
    },
    target_time: {
      type: String,
      required: [true, 'Please add target time'],
      validate: {
        validator: function(v) {
          return !isNaN(Date.parse(v));
        },
        message: 'Please provide a valid UTC timestamp for target_time'
      }
    },
    icon_id: {
      type: Number,
      required: [true, 'Please add an icon ID'],
      min: [0, 'Icon ID must be a positive number'],
    },
    repeats: {
      type: [Number],
      required: [true, 'Please specify which days the habit repeats'],
      validate: {
        validator: function(v) {
          return v.every(day => day >= 0 && day <= 6);
        },
        message: 'Repeats must contain valid day numbers (0-6, where Monday=0)'
      }
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Habit', HabitSchema); 