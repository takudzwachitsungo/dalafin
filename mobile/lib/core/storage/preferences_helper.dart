import 'package:shared_preferences/shared_preferences.dart';

class PreferencesHelper {
  static const String _keyMonthlyIncome = 'monthly_income';
  static const String _keyFixedExpenses = 'fixed_expenses';
  static const String _keyDailyLimit = 'daily_limit';
  static const String _keyRolloverBudget = 'rollover_budget';
  static const String _keyStreakDays = 'streak_days';

  static Future<void> initDefaults() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey(_keyMonthlyIncome)) {
      await prefs.setDouble(_keyMonthlyIncome, 600.00);
    }
    if (!prefs.containsKey(_keyFixedExpenses)) {
      await prefs.setDouble(_keyFixedExpenses, 150.00);
    }
    if (!prefs.containsKey(_keyDailyLimit)) {
      await prefs.setDouble(_keyDailyLimit, 15.00);
    }
    if (!prefs.containsKey(_keyRolloverBudget)) {
      await prefs.setDouble(_keyRolloverBudget, 0.00);
    }
    if (!prefs.containsKey(_keyStreakDays)) {
      await prefs.setInt(_keyStreakDays, 1);
    }
  }

  static Future<double> getDailyLimit() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_keyDailyLimit) ?? 15.00;
  }

  static Future<double> getRolloverBudget() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getDouble(_keyRolloverBudget) ?? 0.00;
  }

  static Future<void> setRolloverBudget(double amount) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setDouble(_keyRolloverBudget, amount);
  }

  static Future<int> getStreakDays() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(_keyStreakDays) ?? 1;
  }

  static Future<void> incrementStreak() async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_keyStreakDays) ?? 1;
    await prefs.setInt(_keyStreakDays, current + 1);
  }
}
