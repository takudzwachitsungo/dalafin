from datetime import datetime
from typing import Dict, Any, Optional

class AdaptiveVelocityEngine:
    """Calculates time-of-day spend pacing and adaptive day-of-week budget allowances."""
    
    @staticmethod
    def evaluate_velocity(
        today_spent: float,
        available_daily_cap: float,
        now_time: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Evaluates spending velocity.
        Flags pacing spikes if >75% of daily cap is spent before 12:00 PM.
        """
        if available_daily_cap <= 0:
            return {
                "is_pacing_spike": False,
                "spent_ratio": 0.0,
                "warning_message": None
            }
            
        now = now_time or datetime.utcnow()
        current_hour = now.hour
        spent_ratio = today_spent / available_daily_cap
        
        is_early_spike = current_hour < 12 and spent_ratio >= 0.75
        warning_msg = None
        
        if is_early_spike:
            pct = int(spent_ratio * 100)
            warning_msg = f"⚠️ Pacing Alert: You've used {pct}% of your daily cap before noon. Slow down to keep your streak!"
        elif spent_ratio >= 0.90 and spent_ratio < 1.0:
            warning_msg = "⚠️ Caution: You've used 90% of today's safe allowance."
        elif spent_ratio >= 1.0:
            warning_msg = "🚨 Over Cap: You have exceeded today's safe limit."
            
        return {
            "is_pacing_spike": is_early_spike,
            "spent_ratio": round(spent_ratio, 2),
            "warning_message": warning_msg
        }

    @staticmethod
    def get_adaptive_daily_cap(base_daily_cap: float, weekday: int) -> float:
        """
        Applies day-of-week multiplier while preserving monthly total cap.
        Mon-Thu (0-3): 0.9x
        Fri-Sat (4-5): 1.2x
        Sun (6): 1.0x
        """
        multipliers = {0: 0.9, 1: 0.9, 2: 0.9, 3: 0.9, 4: 1.2, 5: 1.2, 6: 1.0}
        mult = multipliers.get(weekday, 1.0)
        return round(base_daily_cap * mult, 2)

adaptive_engine = AdaptiveVelocityEngine()
