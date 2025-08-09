const { getMessaging } = require('../config/firebase');
const User = require('../models/User');
const Habit = require('../models/Habit');

class NotificationService {
  constructor() {
    this.messaging = getMessaging();
  }

  /**
   * Send notification to a single user
   * @param {string} userId - User ID
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendNotificationToUser(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        console.log(`User ${userId} not found or no FCM token`);
        return { success: false, error: 'User not found or no FCM token' };
      }

      // Check if this is a test token
      if (user.fcmToken.startsWith('test_') || user.fcmToken.includes('test')) {
        console.log(`Test token detected for user ${userId}, returning mock success`);
        return { success: true, messageId: 'mock_message_id_' + Date.now() };
      }

      const message = {
        token: user.fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type || 'general',
          habitId: notification.habitId || '',
          userId: userId.toString(),
          ...Object.fromEntries(
            Object.entries(notification.data || {}).map(([key, value]) => [key, value.toString()])
          )
        },
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'habit-notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log(`Notification sent to user ${userId}:`, response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} notification - Notification object
   * @returns {Promise<Object>} - Result of the notifications
   */
  async sendNotificationToUsers(userIds, notification) {
    try {
      const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true, $ne: null } });
      const tokens = users.map(user => user.fcmToken);

      if (tokens.length === 0) {
        return { success: false, error: 'No valid FCM tokens found' };
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type || 'general',
          habitId: notification.habitId || '',
          ...Object.fromEntries(
            Object.entries(notification.data || {}).map(([key, value]) => [key, value.toString()])
          )
        },
        android: {
          notification: {
            sound: 'default',
            priority: 'high',
            channelId: 'habit-notifications'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        },
        tokens: tokens
      };

      const response = await this.messaging.sendMulticast(message);
      console.log(`Multicast notification sent:`, response);
      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notification for new AI-based habit suggestions
   * @param {string} userId - User ID
   * @param {Object} suggestion - Habit suggestion object
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendNewHabitSuggestionNotification(userId, suggestion) {
    const notification = {
      title: 'New Habit Suggestion! 💡',
      body: `We found a perfect habit for you: "${suggestion.name}". Tap to learn more!`,
      type: 'new_suggestion',
      data: {
        suggestionId: suggestion.id || '',
        category: suggestion.category || 'general',
        difficulty: suggestion.difficulty || 'beginner'
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for incomplete habits reminder
   * @param {string} userId - User ID
   * @param {Array} incompleteHabits - Array of incomplete habits
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendIncompleteHabitsReminder(userId, incompleteHabits) {
    const habitNames = incompleteHabits.map(habit => habit.name).join(', ');
    const notification = {
      title: 'Don\'t forget your habits! ⏰',
      body: `You have ${incompleteHabits.length} habit(s) to complete: ${habitNames}`,
      type: 'incomplete_habits',
      data: {
        habitCount: incompleteHabits.length.toString(),
        habitIds: incompleteHabits.map(h => h._id.toString()).join(',')
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit completion streak
   * @param {string} userId - User ID
   * @param {Object} habit - Habit object
   * @param {number} streak - Current streak count
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendStreakNotification(userId, habit, streak) {
    const notification = {
      title: `Amazing! ${streak} day streak! 🔥`,
      body: `You've been consistent with "${habit.name}" for ${streak} days! Keep it up!`,
      type: 'streak',
      habitId: habit._id.toString(),
      data: {
        streak: streak.toString(),
        habitName: habit.name
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit completion
   * @param {string} userId - User ID
   * @param {Object} habit - Habit object
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendHabitCompletionNotification(userId, habit) {
    const notification = {
      title: 'Habit Completed! ✅',
      body: `Great job completing "${habit.name}"! You're building a better you!`,
      type: 'habit_completion',
      habitId: habit._id.toString(),
      data: {
        habitName: habit.name,
        completedAt: new Date().toISOString()
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit creation
   * @param {string} userId - User ID
   * @param {Object} habit - Habit object
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendHabitCreationNotification(userId, habit) {
    const notification = {
      title: 'New Habit Created! 🎯',
      body: `You've added "${habit.name}" to your routine. Time to start building this habit!`,
      type: 'habit_creation',
      habitId: habit._id.toString(),
      data: {
        habitName: habit.name,
        targetTime: habit.target_time,
        repeatDays: habit.repeats.join(',')
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for daily habit reminders
   * @param {string} userId - User ID
   * @param {Array} todaysHabits - Array of habits for today
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendDailyHabitReminder(userId, todaysHabits) {
    const notification = {
      title: 'Your Habits Await! 📋',
      body: `You have ${todaysHabits.length} habit(s) scheduled for today. Let's make today count!`,
      type: 'daily_reminder',
      data: {
        habitCount: todaysHabits.length.toString(),
        habitIds: todaysHabits.map(h => h._id.toString()).join(',')
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for weekly progress summary
   * @param {string} userId - User ID
   * @param {Object} weeklyStats - Weekly statistics
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendWeeklyProgressNotification(userId, weeklyStats) {
    const { completedHabits, totalHabits, completionRate } = weeklyStats;
    const notification = {
      title: 'Weekly Progress Report 📊',
      body: `You completed ${completedHabits}/${totalHabits} habits this week (${completionRate}% success rate)!`,
      type: 'weekly_progress',
      data: {
        completedHabits: completedHabits.toString(),
        totalHabits: totalHabits.toString(),
        completionRate: completionRate.toString()
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for motivation boost
   * @param {string} userId - User ID
   * @param {string} motivationMessage - Motivation message
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendMotivationNotification(userId, motivationMessage) {
    const notification = {
      title: 'Motivation Boost! 💪',
      body: motivationMessage,
      type: 'motivation',
      data: {
        timestamp: new Date().toISOString()
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit streak milestone
   * @param {string} userId - User ID
   * @param {Object} habit - Habit object
   * @param {number} milestone - Milestone number (7, 30, 100, etc.)
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendMilestoneNotification(userId, habit, milestone) {
    const notification = {
      title: `${milestone} Day Milestone! 🏆`,
      body: `Congratulations! You've maintained "${habit.name}" for ${milestone} days! You're unstoppable!`,
      type: 'milestone',
      habitId: habit._id.toString(),
      data: {
        milestone: milestone.toString(),
        habitName: habit.name
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit suggestions based on user profile
   * @param {string} userId - User ID
   * @param {Array} suggestions - Array of habit suggestions
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendPersonalizedSuggestionsNotification(userId, suggestions) {
    const notification = {
      title: 'Personalized Habit Suggestions! 🎯',
      body: `We've found ${suggestions.length} new habits perfect for your goals. Check them out!`,
      type: 'personalized_suggestions',
      data: {
        suggestionCount: suggestions.length.toString(),
        categories: [...new Set(suggestions.map(s => s.category))].join(',')
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit reminder (specific time)
   * @param {string} userId - User ID
   * @param {Object} habit - Habit object
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendHabitTimeReminder(userId, habit) {
    const notification = {
      title: `Time for "${habit.name}"! ⏰`,
      body: `It's time to complete your habit. Don't let this moment slip away!`,
      type: 'habit_reminder',
      habitId: habit._id.toString(),
      data: {
        habitName: habit.name,
        targetTime: habit.target_time
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }

  /**
   * Send notification for habit streak at risk
   * @param {string} userId - User ID
   * @param {Object} habit - Habit object
   * @param {number} currentStreak - Current streak count
   * @returns {Promise<Object>} - Result of the notification
   */
  async sendStreakAtRiskNotification(userId, habit, currentStreak) {
    const notification = {
      title: 'Your Streak is at Risk! ⚠️',
      body: `Don't break your ${currentStreak}-day streak with "${habit.name}"! Complete it now!`,
      type: 'streak_at_risk',
      habitId: habit._id.toString(),
      data: {
        currentStreak: currentStreak.toString(),
        habitName: habit.name
      }
    };

    return await this.sendNotificationToUser(userId, notification);
  }
}

module.exports = new NotificationService(); 