/**
 * LinkedIn Compliance and Safety Service
 * Ensures recruiting automation stays within LinkedIn's terms of service
 */

export interface LinkedInLimits {
  connectionsPerDay: number;
  connectionsPerWeek: number;
  messagesPerDay: number;
  messagesPerWeek: number;
  profileViewsPerDay: number;
  searchesPerDay: number;
  withdrawalsPerDay: number;
}

export interface SafetySettings {
  accountType: 'basic' | 'premium' | 'recruiter_lite' | 'sales_navigator';
  accountAge: number; // months
  connectionAcceptanceRate: number;
  currentConnections: number;
  maxConnections: number;
  recentActivity: {
    connectionsToday: number;
    messagesToday: number;
    profileViewsToday: number;
    searchesToday: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  warningFlags: string[];
}

export interface ComplianceCheck {
  action: 'connection_request' | 'message' | 'profile_view' | 'search';
  allowed: boolean;
  reason?: string;
  waitTimeMinutes?: number;
  recommendations?: string[];
}

export interface AccountWarming {
  phase: 'new' | 'warming' | 'established' | 'full_capacity';
  daysInPhase: number;
  recommendedLimits: LinkedInLimits;
  nextPhaseDate: string;
  warmingTips: string[];
}

const LINKEDIN_LIMITS = {
  basic: {
    connectionsPerDay: 15,
    connectionsPerWeek: 100,
    messagesPerDay: 20,
    messagesPerWeek: 100,
    profileViewsPerDay: 80,
    searchesPerDay: 30,
    withdrawalsPerDay: 5
  },
  premium: {
    connectionsPerDay: 25,
    connectionsPerWeek: 150,
    messagesPerDay: 30,
    messagesPerWeek: 150,
    profileViewsPerDay: 120,
    searchesPerDay: 50,
    withdrawalsPerDay: 8
  },
  recruiter_lite: {
    connectionsPerDay: 50,
    connectionsPerWeek: 300,
    messagesPerDay: 50,
    messagesPerWeek: 250,
    profileViewsPerDay: 200,
    searchesPerDay: 100,
    withdrawalsPerDay: 15
  },
  sales_navigator: {
    connectionsPerDay: 40,
    connectionsPerWeek: 250,
    messagesPerDay: 40,
    messagesPerWeek: 200,
    profileViewsPerDay: 150,
    searchesPerDay: 80,
    withdrawalsPerDay: 12
  }
};

const WARMING_PHASES = {
  new: { // 0-7 days
    multiplier: 0.3,
    duration: 7
  },
  warming: { // 7-21 days
    multiplier: 0.6,
    duration: 14
  },
  established: { // 21-60 days
    multiplier: 0.8,
    duration: 39
  },
  full_capacity: { // 60+ days
    multiplier: 1.0,
    duration: Infinity
  }
};

export class LinkedInComplianceService {
  private settings: SafetySettings;
  private limits: LinkedInLimits;

  constructor(settings: SafetySettings) {
    this.settings = settings;
    this.limits = this.calculateSafeLimits();
  }

  /**
   * Check if a specific action is allowed
   */
  checkAction(action: ComplianceCheck['action']): ComplianceCheck {
    const currentActivity = this.settings.recentActivity;
    
    switch (action) {
      case 'connection_request':
        return this.checkConnectionRequest(currentActivity.connectionsToday);
      
      case 'message':
        return this.checkMessage(currentActivity.messagesToday);
      
      case 'profile_view':
        return this.checkProfileView(currentActivity.profileViewsToday);
      
      case 'search':
        return this.checkSearch(currentActivity.searchesToday);
      
      default:
        return { action, allowed: false, reason: 'Unknown action type' };
    }
  }

  /**
   * Get account warming recommendations
   */
  getAccountWarming(): AccountWarming {
    const accountAgeDays = this.settings.accountAge * 30; // Convert months to days
    
    let phase: AccountWarming['phase'] = 'new';
    let daysInPhase = accountAgeDays;
    
    if (accountAgeDays >= 60) {
      phase = 'full_capacity';
      daysInPhase = accountAgeDays - 60;
    } else if (accountAgeDays >= 21) {
      phase = 'established';
      daysInPhase = accountAgeDays - 21;
    } else if (accountAgeDays >= 7) {
      phase = 'warming';
      daysInPhase = accountAgeDays - 7;
    }

    const warmingPhase = WARMING_PHASES[phase];
    const baseLimits = LINKEDIN_LIMITS[this.settings.accountType];
    const recommendedLimits: LinkedInLimits = {
      connectionsPerDay: Math.floor(baseLimits.connectionsPerDay * warmingPhase.multiplier),
      connectionsPerWeek: Math.floor(baseLimits.connectionsPerWeek * warmingPhase.multiplier),
      messagesPerDay: Math.floor(baseLimits.messagesPerDay * warmingPhase.multiplier),
      messagesPerWeek: Math.floor(baseLimits.messagesPerWeek * warmingPhase.multiplier),
      profileViewsPerDay: Math.floor(baseLimits.profileViewsPerDay * warmingPhase.multiplier),
      searchesPerDay: Math.floor(baseLimits.searchesPerDay * warmingPhase.multiplier),
      withdrawalsPerDay: Math.floor(baseLimits.withdrawalsPerDay * warmingPhase.multiplier)
    };

    const nextPhaseDate = this.calculateNextPhaseDate(phase, daysInPhase);
    const warmingTips = this.getWarmingTips(phase);

    return {
      phase,
      daysInPhase,
      recommendedLimits,
      nextPhaseDate,
      warmingTips
    };
  }

  /**
   * Generate safety recommendations
   */
  generateSafetyRecommendations(): string[] {
    const recommendations: string[] = [];
    const activity = this.settings.recentActivity;

    // Connection recommendations
    if (activity.connectionsToday >= this.limits.connectionsPerDay * 0.8) {
      recommendations.push('Approaching daily connection limit - consider spacing out requests');
    }

    // Message recommendations
    if (activity.messagesToday >= this.limits.messagesPerDay * 0.8) {
      recommendations.push('High message volume today - ensure messages are personalized');
    }

    // Profile view recommendations
    if (activity.profileViewsToday >= this.limits.profileViewsPerDay * 0.9) {
      recommendations.push('Many profile views today - vary your browsing patterns');
    }

    // Account health recommendations
    if (this.settings.connectionAcceptanceRate < 30) {
      recommendations.push('Low connection acceptance rate - review your connection messages');
    }

    if (this.settings.riskLevel === 'high') {
      recommendations.push('High risk detected - reduce activity and focus on quality over quantity');
    }

    // Account warming recommendations
    const warming = this.getAccountWarming();
    if (warming.phase !== 'full_capacity') {
      recommendations.push(`Account in ${warming.phase} phase - gradually increase activity levels`);
    }

    return recommendations;
  }

  /**
   * Check for compliance violations
   */
  checkCompliance(): { violations: string[]; warnings: string[]; score: number } {
    const violations: string[] = [];
    const warnings: string[] = [];
    const activity = this.settings.recentActivity;

    // Check hard limits
    if (activity.connectionsToday > this.limits.connectionsPerDay) {
      violations.push(`Exceeded daily connection limit (${activity.connectionsToday}/${this.limits.connectionsPerDay})`);
    }

    if (activity.messagesToday > this.limits.messagesPerDay) {
      violations.push(`Exceeded daily message limit (${activity.messagesToday}/${this.limits.messagesPerDay})`);
    }

    if (activity.profileViewsToday > this.limits.profileViewsPerDay) {
      violations.push(`Exceeded daily profile view limit (${activity.profileViewsToday}/${this.limits.profileViewsPerDay})`);
    }

    // Check warning thresholds (80% of limits)
    if (activity.connectionsToday > this.limits.connectionsPerDay * 0.8) {
      warnings.push('Approaching daily connection limit');
    }

    if (activity.messagesToday > this.limits.messagesPerDay * 0.8) {
      warnings.push('Approaching daily message limit');
    }

    // Check acceptance rate
    if (this.settings.connectionAcceptanceRate < 20) {
      warnings.push('Very low connection acceptance rate');
    } else if (this.settings.connectionAcceptanceRate < 35) {
      warnings.push('Low connection acceptance rate');
    }

    // Calculate compliance score (0-100)
    let score = 100;
    score -= violations.length * 20;
    score -= warnings.length * 10;
    score -= this.settings.warningFlags.length * 5;
    
    if (this.settings.riskLevel === 'high') score -= 15;
    else if (this.settings.riskLevel === 'medium') score -= 5;

    return {
      violations,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Get delay recommendations between actions
   */
  getActionDelay(action: ComplianceCheck['action']): { min: number; max: number } {
    const baseDelays = {
      connection_request: { min: 30, max: 180 }, // 30 seconds to 3 minutes
      message: { min: 45, max: 300 }, // 45 seconds to 5 minutes
      profile_view: { min: 15, max: 60 }, // 15 seconds to 1 minute
      search: { min: 10, max: 30 } // 10 to 30 seconds
    };

    const delay = baseDelays[action];
    
    // Increase delays based on risk level
    const multiplier = this.settings.riskLevel === 'high' ? 2 : 
                      this.settings.riskLevel === 'medium' ? 1.5 : 1;

    return {
      min: Math.floor(delay.min * multiplier),
      max: Math.floor(delay.max * multiplier)
    };
  }

  /**
   * Private helper methods
   */
  private calculateSafeLimits(): LinkedInLimits {
    const baseLimits = LINKEDIN_LIMITS[this.settings.accountType];
    const warming = this.getAccountWarming();
    
    // Apply warming multiplier
    const warmingMultiplier = WARMING_PHASES[warming.phase].multiplier;
    
    // Apply risk level adjustment
    const riskMultiplier = this.settings.riskLevel === 'high' ? 0.5 :
                          this.settings.riskLevel === 'medium' ? 0.7 : 1.0;

    const finalMultiplier = warmingMultiplier * riskMultiplier;

    return {
      connectionsPerDay: Math.floor(baseLimits.connectionsPerDay * finalMultiplier),
      connectionsPerWeek: Math.floor(baseLimits.connectionsPerWeek * finalMultiplier),
      messagesPerDay: Math.floor(baseLimits.messagesPerDay * finalMultiplier),
      messagesPerWeek: Math.floor(baseLimits.messagesPerWeek * finalMultiplier),
      profileViewsPerDay: Math.floor(baseLimits.profileViewsPerDay * finalMultiplier),
      searchesPerDay: Math.floor(baseLimits.searchesPerDay * finalMultiplier),
      withdrawalsPerDay: Math.floor(baseLimits.withdrawalsPerDay * finalMultiplier)
    };
  }

  private checkConnectionRequest(currentConnections: number): ComplianceCheck {
    if (currentConnections >= this.limits.connectionsPerDay) {
      return {
        action: 'connection_request',
        allowed: false,
        reason: 'Daily connection limit reached',
        waitTimeMinutes: this.getTimeUntilReset(),
        recommendations: ['Wait until tomorrow to send more connection requests']
      };
    }

    if (currentConnections >= this.limits.connectionsPerDay * 0.9) {
      return {
        action: 'connection_request',
        allowed: true,
        reason: 'Approaching daily limit',
        recommendations: ['Consider spacing out remaining connection requests']
      };
    }

    return { action: 'connection_request', allowed: true };
  }

  private checkMessage(currentMessages: number): ComplianceCheck {
    if (currentMessages >= this.limits.messagesPerDay) {
      return {
        action: 'message',
        allowed: false,
        reason: 'Daily message limit reached',
        waitTimeMinutes: this.getTimeUntilReset(),
        recommendations: ['Wait until tomorrow to send more messages']
      };
    }

    return { action: 'message', allowed: true };
  }

  private checkProfileView(currentViews: number): ComplianceCheck {
    if (currentViews >= this.limits.profileViewsPerDay) {
      return {
        action: 'profile_view',
        allowed: false,
        reason: 'Daily profile view limit reached',
        waitTimeMinutes: this.getTimeUntilReset()
      };
    }

    return { action: 'profile_view', allowed: true };
  }

  private checkSearch(currentSearches: number): ComplianceCheck {
    if (currentSearches >= this.limits.searchesPerDay) {
      return {
        action: 'search',
        allowed: false,
        reason: 'Daily search limit reached',
        waitTimeMinutes: this.getTimeUntilReset()
      };
    }

    return { action: 'search', allowed: true };
  }

  private calculateNextPhaseDate(currentPhase: AccountWarming['phase'], daysInPhase: number): string {
    const phaseDuration = WARMING_PHASES[currentPhase].duration;
    if (phaseDuration === Infinity) {
      return 'N/A - Already at full capacity';
    }

    const daysRemaining = phaseDuration - daysInPhase;
    const nextPhaseDate = new Date();
    nextPhaseDate.setDate(nextPhaseDate.getDate() + daysRemaining);
    
    return nextPhaseDate.toISOString().split('T')[0];
  }

  private getWarmingTips(phase: AccountWarming['phase']): string[] {
    const tips = {
      new: [
        'Focus on connecting with people you know personally',
        'Keep connection messages short and personalized',
        'Avoid automated tools in the first week',
        'Build a complete profile before heavy activity'
      ],
      warming: [
        'Gradually increase daily connection requests',
        'Mix manual and semi-automated activities',
        'Engage with your network regularly',
        'Share relevant content to increase visibility'
      ],
      established: [
        'You can increase activity levels moderately',
        'Focus on building relationships, not just connections',
        'Use LinkedIn groups for organic engagement',
        'Monitor your acceptance rates closely'
      ],
      full_capacity: [
        'You can operate at full recommended limits',
        'Continue monitoring for any warning signs',
        'Maintain high-quality, personalized outreach',
        'Regular account health checks recommended'
      ]
    };

    return tips[phase];
  }

  private getTimeUntilReset(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60));
  }
}

// Export default compliance settings
export const createComplianceService = (settings: SafetySettings) => {
  return new LinkedInComplianceService(settings);
};

// Helper function to assess account risk level
export const assessRiskLevel = (settings: Partial<SafetySettings>): SafetySettings['riskLevel'] => {
  let riskScore = 0;

  // Account age factor
  if ((settings.accountAge || 0) < 3) riskScore += 2;
  else if ((settings.accountAge || 0) < 6) riskScore += 1;

  // Acceptance rate factor  
  if ((settings.connectionAcceptanceRate || 0) < 20) riskScore += 3;
  else if ((settings.connectionAcceptanceRate || 0) < 35) riskScore += 2;
  else if ((settings.connectionAcceptanceRate || 0) < 50) riskScore += 1;

  // Warning flags
  riskScore += (settings.warningFlags?.length || 0);

  // Current connections vs max
  const connectionRatio = (settings.currentConnections || 0) / (settings.maxConnections || 30000);
  if (connectionRatio > 0.9) riskScore += 2;
  else if (connectionRatio > 0.7) riskScore += 1;

  if (riskScore >= 5) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
};
