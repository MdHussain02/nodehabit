const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false,
    },
    height: {
      type: Number,
      required: [true, 'Please add your height'],
    },
    weight: {
      type: Number,
      required: [true, 'Please add your weight'],
    },
    age: {
      type: Number,
      required: [true, 'Please add your age'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Please specify your gender'],
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: [true, 'Please specify your fitness level'],
    },
    primaryGoal: {
      type: String,
      enum: ['weight-loss', 'muscle-gain', 'endurance', 'general-fitness'],
      required: [true, 'Please specify your primary fitness goal'],
    },
    wakeUpTime: {
      type: String,
      required: [true, 'Please specify your wake up time'],
    },
    sleepTime: {
      type: String,
      required: [true, 'Please specify your sleep time'],
    },
    preferredWorkoutTime: {
      type: String,
      required: [true, 'Please specify your preferred workout time'],
    },
    notifications: {
      type: Boolean,
      default: true,
    },
    motivationLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Please specify your motivation level'],
    },
    weeklyGoal: {
      type: String,
      default: '3',
    },
    fcmToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
