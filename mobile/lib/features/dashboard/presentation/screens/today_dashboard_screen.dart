import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/storage/preferences_helper.dart';
import '../../../../core/utils/spend_velocity_tracker.dart';

class TodayDashboardScreen extends StatefulWidget {
  final VoidCallback onLogSpendPressed;

  const TodayDashboardScreen({super.key, required this.onLogSpendPressed});

  @override
  State<TodayDashboardScreen> createState() => _TodayDashboardScreenState();
}

class _TodayDashboardScreenState extends State<TodayDashboardScreen> {
  double dailyLimit = 15.00;
  double rolloverBudget = 0.00;
  double todaySpent = 0.00;
  int streakDays = 1;
  bool isLoading = true;

  List<Map<String, dynamic>> pockets = [];

  @override
  void initState() {
    super.initState();
    _loadOfflineData();
  }

  Future<void> _loadOfflineData() async {
    await PreferencesHelper.initDefaults();
    final limit = await PreferencesHelper.getDailyLimit();
    final rollover = await PreferencesHelper.getRolloverBudget();
    final streak = await PreferencesHelper.getStreakDays();

    final dbAccounts = await AppDatabase.instance.getAccounts();
    final transactions = await AppDatabase.instance.getTransactions();

    final todayStr = DateTime.now().toIso8601String().split('T')[0];
    double spentSum = 0.0;

    for (var tx in transactions) {
      final dateStr = (tx['date'] as String).split('T')[0];
      if (dateStr == todayStr) {
        spentSum += (tx['amount'] as num).toDouble();
      }
    }

    setState(() {
      dailyLimit = limit;
      rolloverBudget = rollover;
      streakDays = streak;
      todaySpent = spentSum;
      pockets = dbAccounts;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryEmerald)),
      );
    }

    final availableToday = dailyLimit + rolloverBudget;
    final remainingToday = (availableToday - todaySpent).clamp(0.0, availableToday);
    final progress = availableToday > 0 ? (todaySpent / availableToday).clamp(0.0, 1.0) : 0.0;

    // Evaluate Velocity Pacing
    final velocityEval = SpendVelocityTracker.evaluateVelocity(
      todaySpent: todaySpent,
      availableDailyCap: availableToday,
    );
    final String? warningMessage = velocityEval['warningMessage'] as String?;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryEmerald.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.diamond_outlined, color: AppColors.primaryEmerald, size: 20),
            ),
            const SizedBox(width: 12),
            const Text("Dalafin", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22)),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.warningAmber.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.warningAmber.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.local_fire_department, color: AppColors.warningAmber, size: 18),
                const SizedBox(width: 4),
                Text(
                  "$streakDays Day Streak",
                  style: const TextStyle(color: AppColors.warningAmber, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ],
            ),
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadOfflineData,
        color: AppColors.primaryEmerald,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. VELOCITY PACING WARNING BANNER (IF TRIGGERED)
              if (warningMessage != null) ...[
                _buildVelocityWarningBanner(warningMessage),
                const SizedBox(height: 16),
              ],

              // 2. TODAY SPEND PROGRESS CARD
              _buildSpendCard(availableToday, remainingToday, progress),

              const SizedBox(height: 20),

              // 3. ROLLOVER BONUS BADGE
              if (rolloverBudget > 0) _buildRolloverBadge(),

              const SizedBox(height: 24),

              // 4. POCKET WALLETS SECTION
              const Text(
                "Pocket Wallets",
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 12),
              _buildPocketWalletsGrid(),

              const SizedBox(height: 24),

              // 5. QUICK ACTION BANNER
              _buildQuickActionButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVelocityWarningBanner(String message) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.dangerRose.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.dangerRose.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.speed, color: AppColors.dangerRose, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppColors.dangerRose, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpendCard(double available, double remaining, double progress) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.glassBorder),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 16,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Spent Today", style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                  const SizedBox(height: 4),
                  Text(
                    "\$${todaySpent.toStringAsFixed(2)}",
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text("Safe Allowance", style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                  const SizedBox(height: 4),
                  Text(
                    "\$${available.toStringAsFixed(2)}",
                    style: const TextStyle(color: AppColors.primaryEmerald, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ],
              )
            ],
          ),
          const SizedBox(height: 20),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 12,
              backgroundColor: AppColors.surfaceLight,
              valueColor: AlwaysStoppedAnimation<Color>(
                progress > 0.9 ? AppColors.dangerRose : AppColors.primaryEmerald,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "\$${remaining.toStringAsFixed(2)} remaining today",
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
              Text(
                "${(progress * 100).toInt()}% used",
                style: TextStyle(
                  color: progress > 0.9 ? AppColors.dangerRose : AppColors.primaryEmerald,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildRolloverBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primaryEmerald.withValues(alpha: 0.2), AppColors.infoIndigo.withValues(alpha: 0.2)],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primaryEmerald.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.card_giftcard, color: AppColors.primaryEmerald, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Rollover Bonus Active!",
                  style: TextStyle(color: AppColors.primaryEmerald, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                Text(
                  "+\$${rolloverBudget.toStringAsFixed(2)} carried forward from unspent daily caps",
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPocketWalletsGrid() {
    if (pockets.isEmpty) {
      return const Text("No wallets created", style: TextStyle(color: AppColors.textMuted));
    }

    return Column(
      children: pockets.map((pocket) {
        final name = pocket['name'] as String;
        final balance = (pocket['current_balance'] as num).toDouble();
        final type = pocket['account_type'] as String;

        IconData icon = Icons.payments;
        Color color = AppColors.primaryEmerald;

        if (type == 'mobile_money') {
          icon = Icons.phone_android;
          color = AppColors.warningAmber;
        } else if (type == 'bank') {
          icon = Icons.account_balance;
          color = AppColors.infoIndigo;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.glassBorder),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  name,
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              Text(
                "\$${balance.toStringAsFixed(2)}",
                style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 18),
              )
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildQuickActionButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: () async {
          widget.onLogSpendPressed();
          await _loadOfflineData();
        },
        icon: const Icon(Icons.add, color: Colors.black),
        label: const Text(
          "Log Spend (Instant 2-Tap)",
          style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primaryEmerald,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
      ),
    );
  }
}
