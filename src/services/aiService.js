const { GoogleGenerativeAI } = require('@google/generative-ai');
const ErrorResponse = require('../utils/errorResponse');

// Initialize Gemini client conditionally
let genAI = null;

function getGeminiClient() {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'test-key') {
      throw new ErrorResponse('Gemini API key not configured', 500);
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Generate personalized habit suggestions based on user profile and existing habits
 * @param {Object} userProfile - User's health and fitness profile
 * @param {Array} existingHabits - User's current habits
 * @param {Object} options - Additional options for suggestions
 * @returns {Promise<Array>} Array of suggested habits
 */
exports.generateHabitSuggestions = async (userProfile, existingHabits = [], options = {}) => {
  try {
    // Get Gemini client
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare user data for analysis
    const userData = {
      profile: {
        age: userProfile.age,
        gender: userProfile.gender,
        height: userProfile.height,
        weight: userProfile.weight,
        fitnessLevel: userProfile.fitnessLevel,
        primaryGoal: userProfile.primaryGoal,
        motivationLevel: userProfile.motivationLevel,
        wakeUpTime: userProfile.wakeUpTime,
        sleepTime: userProfile.sleepTime,
        preferredWorkoutTime: userProfile.preferredWorkoutTime,
        weeklyGoal: userProfile.weeklyGoal
      },
      existingHabits: existingHabits.map(habit => ({
        name: habit.name,
        target_time: habit.target_time,
        repeats: habit.repeats,
        icon_id: habit.icon_id
      }))
    };

    // Create comprehensive prompt for AI
    const prompt = createAnalysisPrompt(userData, options);

    // Call Gemini API
    const result = await model.generateContent([
      "You are a professional fitness and wellness coach specializing in habit formation. Provide personalized, actionable habit suggestions based on user data. Always respond with valid JSON format.",
      prompt
    ]);

    const response = result.response.text();
    const suggestions = parseAIResponse(response);

    return suggestions;

  } catch (error) {
    console.error('AI Service Error:', error);
    // Return fallback suggestions instead of throwing error
    return generateFallbackSuggestions();
  }
};

/**
 * Create a comprehensive prompt for AI analysis
 */
function createAnalysisPrompt(userData, options) {
  const { profile, existingHabits } = userData;
  const { maxSuggestions = 5, focusArea = 'general' } = options;

  // Calculate BMI for health insights
  const heightInMeters = profile.height / 100;
  const bmi = profile.weight / (heightInMeters * heightInMeters);
  
  // Determine health status based on BMI
  let healthStatus = 'normal';
  if (bmi < 18.5) healthStatus = 'underweight';
  else if (bmi >= 25) healthStatus = 'overweight';
  else if (bmi >= 30) healthStatus = 'obese';

  return `
Analyze the following user profile and existing habits to generate personalized habit suggestions.

USER PROFILE:
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Height: ${profile.height}cm, Weight: ${profile.weight}kg
- BMI: ${bmi.toFixed(1)} (${healthStatus})
- Fitness Level: ${profile.fitnessLevel}
- Primary Goal: ${profile.primaryGoal}
- Motivation Level: ${profile.motivationLevel}
- Sleep Schedule: ${profile.wakeUpTime} to ${profile.sleepTime}
- Preferred Workout Time: ${profile.preferredWorkoutTime}
- Weekly Goal: ${profile.weeklyGoal} sessions

EXISTING HABITS (${existingHabits.length}):
${existingHabits.map(habit => `- ${habit.name} (${habit.repeats.length} days/week, time: ${habit.target_time})`).join('\n')}

FOCUS AREA: ${focusArea}
MAX SUGGESTIONS: ${maxSuggestions}

Generate ${maxSuggestions} personalized habit suggestions that:
1. Align with the user's fitness level and goals
2. Complement existing habits without conflicts
3. Consider the user's schedule and preferences
4. Are realistic and achievable
5. Include specific timing and frequency recommendations

For each suggestion, provide:
- name: Descriptive habit name
- description: Why this habit is beneficial for this user
- target_time: Recommended time (in ISO format)
- repeats: Array of days (0-6, Monday=0)
- icon_id: Suggested icon (1-10)
- difficulty: "beginner", "intermediate", or "advanced"
- category: "fitness", "nutrition", "mental-health", "sleep", or "lifestyle"
- estimated_duration: Minutes per session
- success_tips: 2-3 specific tips for success

Respond with valid JSON array format:
[
  {
    "name": "Habit Name",
    "description": "Why this habit is beneficial...",
    "target_time": "2024-01-15T07:00:00.000Z",
    "repeats": [0, 1, 2, 3, 4],
    "icon_id": 1,
    "difficulty": "beginner",
    "category": "fitness",
    "estimated_duration": 30,
    "success_tips": ["Tip 1", "Tip 2", "Tip 3"]
  }
]
`;
}

/**
 * Parse and validate AI response
 */
function parseAIResponse(response) {
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response');
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    // Validate and clean suggestions
    return suggestions.map(suggestion => ({
      name: suggestion.name || 'Unnamed Habit',
      description: suggestion.description || 'No description provided',
      target_time: suggestion.target_time || new Date().toISOString(),
      repeats: Array.isArray(suggestion.repeats) ? suggestion.repeats : [0, 1, 2, 3, 4],
      icon_id: typeof suggestion.icon_id === 'number' ? suggestion.icon_id : 1,
      difficulty: suggestion.difficulty || 'beginner',
      category: suggestion.category || 'lifestyle',
      estimated_duration: typeof suggestion.estimated_duration === 'number' ? suggestion.estimated_duration : 30,
      success_tips: Array.isArray(suggestion.success_tips) ? suggestion.success_tips : ['Start small and be consistent']
    }));

  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return fallback suggestions
    return generateFallbackSuggestions();
  }
}

/**
 * Generate fallback suggestions when AI fails
 */
function generateFallbackSuggestions() {
  return [
    {
      name: "Morning Stretching",
      description: "Gentle stretching to improve flexibility and start your day energized",
      target_time: new Date().toISOString(),
      repeats: [0, 1, 2, 3, 4],
      icon_id: 1,
      difficulty: "beginner",
      category: "fitness",
      estimated_duration: 15,
      success_tips: ["Start with 5 minutes", "Do it right after waking up", "Focus on major muscle groups"]
    },
    {
      name: "Evening Walk",
      description: "Light walking to improve cardiovascular health and reduce stress",
      target_time: new Date().toISOString(),
      repeats: [0, 1, 2, 3, 4, 5, 6],
      icon_id: 2,
      difficulty: "beginner",
      category: "fitness",
      estimated_duration: 30,
      success_tips: ["Start with 10 minutes", "Walk at a comfortable pace", "Enjoy the outdoors"]
    }
  ];
}

/**
 * Analyze user's habit patterns and provide insights
 */
exports.analyzeHabitPatterns = async (userProfile, existingHabits) => {
  try {
    // Get Gemini client
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Analyze the following user's habit patterns and provide insights:

USER PROFILE:
- Age: ${userProfile.age}
- Fitness Level: ${userProfile.fitnessLevel}
- Primary Goal: ${userProfile.primaryGoal}
- Motivation Level: ${userProfile.motivationLevel}

EXISTING HABITS:
${existingHabits.map(habit => `- ${habit.name} (${habit.repeats.length} days/week)`).join('\n')}

Provide analysis in JSON format:
{
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendations": ["rec1", "rec2"],
  "consistency_score": 0-100,
  "balance_score": 0-100
}
`;

    const result = await model.generateContent([
      "You are a habit analysis expert. Provide insights about user's habit patterns.",
      prompt
    ]);

    const response = result.response.text();
    const analysis = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);

    return analysis;

  } catch (error) {
    console.error('Pattern Analysis Error:', error);
    // Return fallback analysis instead of throwing error
    return {
      strengths: ["You have some good habits established"],
      gaps: ["Consider adding more variety"],
      recommendations: ["Focus on consistency"],
      consistency_score: 50,
      balance_score: 50
    };
  }
}; 