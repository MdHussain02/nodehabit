const cron = require('node-cron');
const User = require('../models/User');
const Habit = require('../models/Habit');
const notificationService = require('./notificationService');

class ScheduledNotificationService {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Initialize all scheduled notifications
   */
  initializeScheduledNotifications() {
    console.log('Initializing scheduled notifications...');

    // Daily morning reminder (8:00 AM)
    this.scheduleDailyMorningReminder();

    // Daily evening reminder (8:00 PM)
    this.scheduleDailyEveningReminder();

    // Weekly progress report (Sunday 9:00 AM)
    this.scheduleWeeklyProgressReport();

    // Habit time reminders (every hour)
    this.scheduleHabitTimeReminders();

    // Streak at risk notifications (daily at 10:00 PM)
    this.scheduleStreakAtRiskNotifications();

    // Motivation notifications (random times)
    this.scheduleMotivationNotifications();

    console.log('Scheduled notifications initialized successfully');
  }

  /**
   * Schedule daily morning reminder
   */
  scheduleDailyMorningReminder() {
    const job = cron.schedule('0 8 * * *', async () => {
      console.log('Running daily morning reminder...');
      try {
        const users = await User.find({ notifications: true });
        
        for (const user of users) {
          const todaysHabits = await this.getTodaysHabits(user._id);
          if (todaysHabits.length > 0) {
            await notificationService.sendDailyHabitReminder(user._id, todaysHabits);
          }
        }
      } catch (error) {
        console.error('Error in daily morning reminder:', error);
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs.set('dailyMorningReminder', job);
  }

  /**
   * Schedule daily evening reminder
   */
  scheduleDailyEveningReminder() {
    const job = cron.schedule('0 20 * * *', async () => {
      console.log('Running daily evening reminder...');
      try {
        const users = await User.find({ notifications: true });
        
        for (const user of users) {
          const incompleteHabits = await this.getIncompleteHabits(user._id);
          if (incompleteHabits.length > 0) {
            await notificationService.sendIncompleteHabitsReminder(user._id, incompleteHabits);
          }
        }
      } catch (error) {
        console.error('Error in daily evening reminder:', error);
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs.set('dailyEveningReminder', job);
  }

  /**
   * Schedule weekly progress report
   */
  scheduleWeeklyProgressReport() {
    const job = cron.schedule('0 9 * * 0', async () => {
      console.log('Running weekly progress report...');
      try {
        const users = await User.find({ notifications: true });
        
        for (const user of users) {
          const weeklyStats = await this.getWeeklyStats(user._id);
          if (weeklyStats.totalHabits > 0) {
            await notificationService.sendWeeklyProgressNotification(user._id, weeklyStats);
          }
        }
      } catch (error) {
        console.error('Error in weekly progress report:', error);
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs.set('weeklyProgressReport', job);
  }

  /**
   * Schedule habit time reminders
   */
  scheduleHabitTimeReminders() {
    const job = cron.schedule('0 * * * *', async () => {
      console.log('Running habit time reminders...');
      try {
        const users = await User.find({ notifications: true });
        
        for (const user of users) {
          const dueHabits = await this.getDueHabits(user._id);
          for (const habit of dueHabits) {
            await notificationService.sendHabitTimeReminder(user._id, habit);
          }
        }
      } catch (error) {
        console.error('Error in habit time reminders:', error);
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs.set('habitTimeReminders', job);
  }

  /**
   * Schedule streak at risk notifications
   */
  scheduleStreakAtRiskNotifications() {
    const job = cron.schedule('0 22 * * *', async () => {
      console.log('Running streak at risk notifications...');
      try {
        const users = await User.find({ notifications: true });
        
        for (const user of users) {
          const habitsAtRisk = await this.getHabitsAtRisk(user._id);
          for (const habit of habitsAtRisk) {
            await notificationService.sendStreakAtRiskNotification(user._id, habit.habit, habit.currentStreak);
          }
        }
      } catch (error) {
        console.error('Error in streak at risk notifications:', error);
      }
    }, {
      timezone: 'UTC'
    });

    this.jobs.set('streakAtRiskNotifications', job);
  }

  /**
   * Schedule motivation notifications
   */
  scheduleMotivationNotifications() {
    // Send motivation notifications at random times during the day
    const motivationTimes = ['0 10 * * *', '0 14 * * *', '0 16 * * *', '0 18 * * *'];
    
    motivationTimes.forEach((time, index) => {
      const job = cron.schedule(time, async () => {
        console.log('Running motivation notifications...');
        try {
          const users = await User.find({ notifications: true });
          const motivationMessages = [
            "Every small step counts towards your bigger goals! 💪",
            "You're building the best version of yourself, one habit at a time! 🌟",
            "Consistency beats perfection. Keep going! 🔥",
            "Your future self will thank you for today's efforts! 🙏",
            "Small changes today, big results tomorrow! 🎯",
            "You have the power to change your life through habits! ⚡",
            "Every expert was once a beginner. Keep pushing! 🚀",
            "Your habits shape your destiny. Choose wisely! ✨"
          ];
          
          for (const user of users) {
            const randomMessage = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
            await notificationService.sendMotivationNotification(user._id, randomMessage);
          }
        } catch (error) {
          console.error('Error in motivation notifications:', error);
        }
      }, {
        timezone: 'UTC'
      });

      this.jobs.set(`motivationNotifications_${index}`, job);
    });
  }

  /**
   * Get today's habits for a user
   */
  async getTodaysHabits(userId) {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedDay = today === 0 ? 6 : today - 1; // Convert to our format (Monday = 0)
    
    return await Habit.find({
      user: userId,
      repeats: adjustedDay
    });
  }

  /**
   * Get incomplete habits for a user
   */
  async getIncompleteHabits(userId) {
    // This would need to be implemented based on your habit completion tracking
    // For now, returning all habits for today
    return await this.getTodaysHabits(userId);
  }

  /**
   * Get weekly statistics for a user
   */
  async getWeeklyStats(userId) {
    // This would need to be implemented based on your habit completion tracking
    // For now, returning mock data
    const totalHabits = await Habit.countDocuments({ user: userId });
    const completedHabits = Math.floor(totalHabits * 0.7); // Mock 70% completion rate
    const completionRate = Math.round((completedHabits / totalHabits) * 100);

    return {
      completedHabits,
      totalHabits,
      completionRate
    };
  }

  /**
   * Get habits that are due now
   */
  async getDueHabits(userId) {
    const now = new Date();
    const currentHour = now.getHours();
    const today = new Date().getDay();
    const adjustedDay = today === 0 ? 6 : today - 1;

    const habits = await Habit.find({
      user: userId,
      repeats: adjustedDay
    });

    return habits.filter(habit => {
      const targetTime = new Date(habit.target_time);
      const targetHour = targetTime.getHours();
      return targetHour === currentHour;
    });
  }

  /**
   * Get habits at risk of losing streak
   */
  async getHabitsAtRisk(userId) {
    // This would need to be implemented based on your streak tracking
    // For now, returning empty array
    return [];
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped job: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get status of all jobs
   */
  getJobsStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = job.running;
    });
    return status;
  }
}

module.exports = new ScheduledNotificationService(); 