import { apiGet } from '../api';
import type { District, Plan, PlanWithSummary } from '../types';

export interface UserDashboardStats {
  activePlansCount: number;
  totalObjectivesCount: number;
  districtsCount: number;
}

export class UserDashboardService {
  /**
   * Get all districts the current user has admin access to
   */
  static async getUserDistricts(): Promise<District[]> {
    return apiGet<District[]>('/user/districts');
  }

  /**
   * Get all plans across all districts the user has access to
   */
  static async getUserPlans(): Promise<Plan[]> {
    return apiGet<Plan[]>('/user/plans');
  }

  /**
   * Get plans with objective counts for the dashboard
   */
  static async getUserPlansWithCounts(): Promise<PlanWithSummary[]> {
    return apiGet<PlanWithSummary[]>('/user/plans-with-counts');
  }

  /**
   * Get dashboard statistics for the welcome banner
   */
  static async getDashboardStats(): Promise<UserDashboardStats> {
    return apiGet<UserDashboardStats>('/user/dashboard');
  }
}
