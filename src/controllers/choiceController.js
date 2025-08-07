// @desc    Get profile choices
// @route   GET /api/v1/choices
// @access  Public
exports.getProfileChoices = async (req, res, next) => {
  try {
    const choices = {
      gender: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Non-binary', label: 'Non-binary' },
        { value: 'Other', label: 'Other' },
        { value: 'Prefer not to say', label: 'Prefer not to say' }
      ],
      fitness_level: [
        { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Advanced', label: 'Advanced' },
        { value: 'Professional', label: 'Professional' }
      ],
      motivation_level: [
        { value: '1 - Very Low', label: '1 - Very Low' },
        { value: '2 - Low', label: '2 - Low' },
        { value: '3 - Average', label: '3 - Average' },
        { value: '4 - High', label: '4 - High' },
        { value: '5 - Very High', label: '5 - Very High' }
      ],
      preferred_workout_time: [
        { value: 'Morning (6-9 AM)', label: 'Morning (6-9 AM)' },
        { value: 'Late Morning (9-12 PM)', label: 'Late Morning (9-12 PM)' },
        { value: 'Afternoon (12-3 PM)', label: 'Afternoon (12-3 PM)' },
        { value: 'Late Afternoon (3-6 PM)', label: 'Late Afternoon (3-6 PM)' },
        { value: 'Evening (6-9 PM)', label: 'Evening (6-9 PM)' },
        { value: 'Night (9-12 AM)', label: 'Night (9-12 AM)' }
      ],
      primary_goal: [
        { value: 'Weight Loss', label: 'Weight Loss' },
        { value: 'Muscle Gain', label: 'Muscle Gain' },
        { value: 'General Fitness', label: 'General Fitness' },
        { value: 'Endurance Training', label: 'Endurance Training' },
        { value: 'Event Preparation', label: 'Event Preparation' }
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
