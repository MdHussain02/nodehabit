const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a habit name'],
      trim: true,
      maxlength: [100, 'Habit name cannot be more than 100 characters'],
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
    completions: [
      {
        timestamp: {
          type: String,
          required: true,
          validate: {
            validator: function(v) {
              return !isNaN(Date.parse(v));
            },
            message: 'Please provide a valid UTC timestamp for completion timestamp'
          }
        },
        on_time: {
          type: Boolean,
          default: false,
        },
      }
    ],
  },
  {
    timestamps: true,
  }
);

// Drop the problematic index on the id field if it exists
const Habit = mongoose.model('Habit', HabitSchema);

// Drop the index on id field if it exists
Habit.collection.dropIndex('id_1').catch(err => {
  // Index doesn't exist, which is fine
  console.log('Index id_1 dropped or didn\'t exist');
});

module.exports = Habit;