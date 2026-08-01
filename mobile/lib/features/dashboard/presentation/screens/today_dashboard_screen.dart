import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class TodayDashboardScreen extends StatefulWidget {
  final VoidCallback onLogSpendPressed;

  const TodayDashboardScreen({super.key, required this.onLogSpendPressed});

  @override
  State<TodayDashboardScreen> createState() => _TodayDashboardScreenState();
}

class _TodayDashboardScreenState extends State<TodayDashboardScreen> {
  // Demo State
  double dailyLimit = 15.00;
  double rolloverBudget = 8.50;
  double todaySpent = 6.20;
  int streakDays = 7;

  List<Map<String, dynamic>> pockets = [
    {'name': 'USD Cash', 'balance': 45.00, 'icon': Icons.payments, 'color': AppColors.primaryEmerald},
    {'name': 'EcoCash USD', 'balance': 28.50, 'icon': Icons.phone_android, 'color': AppColors.warningAmber},
    {'name': 'CBZ Bank', 'balance': 120.00, 'icon': Icons.account_balance, 'color': AppColors.infoIndigo},
  ];

  @override
  Widget build(BuildContext context) {
    final availableToday = dailyLimit + rolloverBudget;
    final remainingToday = (availableToday - todaySpent).clamp(0.0, availableToday);
    final progress = (todaySpent / availableToday).clamp(0.0, 1.0);

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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. TODAY SPEND PROGRESS CARD
            _buildSpendCard(availableToday, remainingToday, progress),

            const SizedBox(height: 20),

            // 2. ROLLOVER BONUS BADGE
            if (rolloverBudget > 0) _buildRolloverBadge(),

            const SizedBox(height: 24),

            // 3. POCKET WALLETS SECTION
            const Text(
              "Pocket Wallets",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 12),
            _buildPocketWalletsGrid(),

            const SizedBox(height: 24),

            // 4. QUICK ACTION BANNER
            _buildQuickActionButton(),
          ],
        ),
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
          // Progress Bar
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
    return Column(
      children: pockets.map((pocket) {
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
                  color: (pocket['color'] as Color).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(pocket['icon'] as IconData, color: pocket['color'] as Color, size: 22),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  pocket['name'] as String,
                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              Text(
                "\$${(pocket['balance'] as double).toStringAsFixed(2)}",
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
        onPressed: widget.onLogSpendPressed,
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
