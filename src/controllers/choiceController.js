// @desc    Get profile choices
// @route   GET /api/v1/choices
// @access  Public
exports.getProfileChoices = async (req, res, next) => {
  try {
    const choices = {
      gender: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
      ],
      fitnessLevel: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' }
      ],
      motivationLevel: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
      ],
      preferredWorkoutTime: [
        { value: 'morning', label: 'Morning (6-9 AM)' },
        { value: 'late-morning', label: 'Late Morning (9-12 PM)' },
        { value: 'afternoon', label: 'Afternoon (12-3 PM)' },
        { value: 'late-afternoon', label: 'Late Afternoon (3-6 PM)' },
        { value: 'evening', label: 'Evening (6-9 PM)' },
        { value: 'night', label: 'Night (9-12 AM)' }
      ],
      primaryGoal: [
        { value: 'weight-loss', label: 'Weight Loss' },
        { value: 'muscle-gain', label: 'Muscle Gain' },
        { value: 'endurance', label: 'Endurance' },
        { value: 'general-fitness', label: 'General Fitness' }
      ]
    };

    res.status(200).json({
      status: true,
      message: 'Profile choices fetched',
      data: choices
    });
  } catch (error) {
    next(error);
  }
};
