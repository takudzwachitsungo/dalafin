class SpendVelocityTracker {
  /// Evaluates current spending velocity based on hour of day and spent amount.
  /// Returns a map containing:
  /// - `isPacingSpike`: bool (true if spending > 75% of cap before 12:00 PM)
  /// - `velocityPercentage`: double (% of expected pace consumed)
  /// - `warningMessage`: String? (Pacing alert message)
  static Map<String, dynamic> evaluateVelocity({
    required double todaySpent,
    required double availableDailyCap,
    DateTime? nowTime,
  }) {
    if (availableDailyCap <= 0) {
      return {'isPacingSpike': false, 'velocityPercentage': 0.0, 'warningMessage': null};
    }

    final now = nowTime ?? DateTime.now();
    final currentHour = now.hour; // 0 to 23
    final spentRatio = todaySpent / availableDailyCap;

    // Pacing Spike Condition: > 75% of daily limit spent before 12:00 PM
    final isEarlyPacingSpike = currentHour < 12 && spentRatio >= 0.75;
    
    String? warningMsg;
    if (isEarlyPacingSpike) {
      final percentUsed = (spentRatio * 100).toInt();
      warningMsg = "⚠️ Pacing Alert: You've used $percentUsed% of your daily cap before noon. Slow down to protect your streak!";
    } else if (spentRatio >= 0.90 && spentRatio < 1.0) {
      warningMsg = "⚠️ Caution: You've used 90% of today's safe allowance.";
    }

    return {
      'isPacingSpike': isEarlyPacingSpike,
      'spentRatio': spentRatio,
      'warningMessage': warningMsg,
    };
  }

  /// Adaptive Day-of-Week Cap Multiplier:
  /// Mon-Thu: 0.9x (Save extra for weekend)
  /// Fri-Sat: 1.2x (Slightly higher weekend allowance)
  /// Sun: 1.0x (Standard)
  static double getDayOfWeekMultiplier(int weekday) {
    switch (weekday) {
      case DateTime.monday:
      case DateTime.tuesday:
      case DateTime.wednesday:
      case DateTime.thursday:
        return 0.9;
      case DateTime.friday:
      case DateTime.saturday:
        return 1.2;
      case DateTime.sunday:
      default:
        return 1.0;
    }
  }
}
