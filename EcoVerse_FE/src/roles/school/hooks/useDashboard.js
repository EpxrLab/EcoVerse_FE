import {
  weeklyActivityData,
  classPerformanceData,
  topStudentsData,
  recentRewardsData,
  dashboardStats,
  subscriptionInfo,
  leaderboardStudentsData,
  leaderboardClassesData
} from '../data/dashboard.data';

export function useDashboard() {
  return {
    weeklyActivity: weeklyActivityData,
    classPerformance: classPerformanceData,
    topStudents: topStudentsData,
    recentRewards: recentRewardsData,
    stats: dashboardStats,
    subscription: subscriptionInfo,
    leaderboardStudents: leaderboardStudentsData,
    leaderboardClasses: leaderboardClassesData,
  };
}