import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/storage/app_database.dart';
import '../../../../core/storage/preferences_helper.dart';
import '../../../../core/utils/spend_velocity_tracker.dart';
import '../../../reflections/presentation/screens/nightly_reflection_dialog.dart';

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
  int impulsesAvoided = 3;
  bool isLoading = true;

  List<Map<String, dynamic>> pockets = [];
  List<Map<String, dynamic>> todayTransactions = [];

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
    List<Map<String, dynamic>> todayList = [];

    for (var tx in transactions) {
      final dateStr = (tx['date'] as String).split('T')[0];
      if (dateStr == todayStr) {
        spentSum += (tx['amount'] as num).toDouble();
        todayList.add(tx);
      }
    }

    setState(() {
      dailyLimit = limit;
      rolloverBudget = rollover;
      streakDays = streak;
      todaySpent = spentSum;
      pockets = dbAccounts;
      todayTransactions = todayList;
      isLoading = false;
    });
  }

  /// Color status matching original React MoneyDisplay component
  Color _getStatusTextColor() {
    if (dailyLimit <= 0 || todaySpent == 0) return AppColors.textPrimary;
    if (todaySpent < dailyLimit * 0.7) return AppColors.safeGreen;
    if (todaySpent <= dailyLimit) return AppColors.warningOrange;
    return AppColors.dangerRed;
  }

  Color _getStatusBgColor() {
    if (dailyLimit <= 0 || todaySpent == 0) return AppColors.surfaceLight;
    if (todaySpent < dailyLimit * 0.7) return AppColors.safeBg;
    if (todaySpent <= dailyLimit) return AppColors.warningBg;
    return AppColors.dangerBg;
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primaryEmerald)),
      );
    }

    final availableToday = dailyLimit + rolloverBudget;
    final progress = availableToday > 0 ? (todaySpent / availableToday).clamp(0.0, 1.0) : 0.0;

    final velocityEval = SpendVelocityTracker.evaluateVelocity(
      todaySpent: todaySpent,
      availableDailyCap: availableToday,
    );
    final String? warningMessage = velocityEval['warningMessage'] as String?;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("Dalafin", style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 24)),
        actions: [
          IconButton(
            icon: const Icon(Icons.nightlight_round, color: AppColors.infoIndigo),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => const NightlyReflectionDialog(),
              ).then((_) => _loadOfflineData());
            },
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadOfflineData,
        color: AppColors.primaryEmerald,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // VELOCITY WARNING BANNER (IF TRIGGERED)
              if (warningMessage != null) ...[
                _buildVelocityWarningBanner(warningMessage),
                const SizedBox(height: 20),
              ],

              // 1. ORIGINAL REACT "MONEY DISPLAY" HEADER
              _buildReactMoneyDisplay(),

              const SizedBox(height: 16),

              // 2. SPENDING PROGRESS BAR
              _buildSpendingProgressBar(availableToday, progress),

              const SizedBox(height: 20),

              // 3. STREAK & IMPULSES AVOIDED PILLS
              _buildStreakPillsRow(),

              const SizedBox(height: 28),

              // 4. PRIMARY ACTIONS (LOG SPEND / LOG INCOME GRID)
              _buildPrimaryActionGrid(),

              const SizedBox(height: 28),

              // 5. POCKET WALLETS (Cash, EcoCash, Bank Card)
              _buildPocketWalletsSection(),

              const SizedBox(height: 28),

              // 6. TODAY'S ACTIVITY
              _buildTodayActivitySection(),
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
        color: AppColors.dangerBg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.dangerRed.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.speed, color: AppColors.dangerRed, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppColors.dangerRed, fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  /// 1-to-1 Mirror of original React MoneyDisplay component
  Widget _buildReactMoneyDisplay() {
    final textColor = _getStatusTextColor();
    final bgColor = _getStatusBgColor();

    return Column(
      children: [
        const Text(
          "SPENT TODAY",
          style: TextStyle(
            color: AppColors.textSecondary,
            fontSize: 13,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            "\$${todaySpent.toStringAsFixed(2)}",
            style: TextStyle(
              color: textColor,
              fontSize: 52,
              fontWeight: FontWeight.bold,
              letterSpacing: -1.0,
            ),
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          "Resets at midnight",
          style: TextStyle(color: AppColors.textMuted, fontSize: 13),
        ),
      ],
    );
  }

  Widget _buildSpendingProgressBar(double dailyBudget, double progress) {
    if (dailyBudget <= 0) return const SizedBox.shrink();

    final statusColor = _getStatusTextColor();
    final isOver = todaySpent > dailyBudget;

    return SizedBox(
      width: 280,
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: AppColors.surfaceLight,
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                isOver ? "Over budget" : "${(progress * 100).toInt()}% of daily budget",
                style: TextStyle(
                  color: isOver ? AppColors.dangerRed : AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: isOver ? FontWeight.bold : FontWeight.normal,
                ),
              ),
              Text(
                "\$${dailyBudget.toStringAsFixed(0)}",
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildStreakPillsRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Flame streak pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF7ED),
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: const Color(0xFFFFEDD5)),
          ),
          child: Row(
            children: [
              const Icon(Icons.local_fire_department, color: Color(0xFFEA580C), size: 18),
              const SizedBox(width: 6),
              Text(
                "$streakDays day streak",
                style: const TextStyle(color: Color(0xFF9A3412), fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        // Impulses avoided pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.safeBg,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: const Color(0xFFD1FAE5)),
          ),
          child: Row(
            children: [
              const Icon(Icons.trending_up, color: AppColors.safeGreen, size: 18),
              const SizedBox(width: 6),
              Text(
                "$impulsesAvoided impulses avoided",
                style: const TextStyle(color: Color(0xFF065F46), fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// 1-to-1 Mirror of original React primary 2-button grid
  Widget _buildPrimaryActionGrid() {
    return Row(
      children: [
        Expanded(
          child: InkWell(
            onTap: widget.onLogSpendPressed,
            borderRadius: BorderRadius.circular(20),
            child: Container(
              height: 110,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.textPrimary,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_circle, color: Colors.white, size: 32),
                  SizedBox(height: 8),
                  Text(
                    "Log Spend",
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  )
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Log Income feature ready!"), backgroundColor: AppColors.primaryEmerald),
              );
            },
            borderRadius: BorderRadius.circular(20),
            child: Container(
              height: 110,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.glassBorder, width: 1.5),
              ),
              child: const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.account_balance_wallet, color: AppColors.textPrimary, size: 32),
                  SizedBox(height: 8),
                  Text(
                    "Log Income",
                    style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                  )
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPocketWalletsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Pocket Wallets",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 12),
        Column(
          children: pockets.map((pocket) {
            final name = pocket['name'] as String;
            final balance = (pocket['current_balance'] as num).toDouble();
            final type = pocket['account_type'] as String;

            IconData icon = Icons.payments;
            Color color = AppColors.safeGreen;

            if (type == 'mobile_money') {
              icon = Icons.phone_android;
              color = AppColors.warningOrange;
            } else if (type == 'bank') {
              icon = Icons.account_balance;
              color = AppColors.infoIndigo;
            }

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
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
                      color: color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: color, size: 22),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      name,
                      style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                  Text(
                    "\$${balance.toStringAsFixed(2)}",
                    style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                  )
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildTodayActivitySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              "Today's Activity",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            Text(
              "-\$${todaySpent.toStringAsFixed(2)}",
              style: TextStyle(
                color: _getStatusTextColor(),
                fontWeight: FontWeight.bold,
                fontSize: 15,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (todayTransactions.isNotEmpty)
          Column(
            children: todayTransactions.map((tx) {
              final note = (tx['note'] as String?) ?? 'Purchase';
              final amount = (tx['amount'] as num).toDouble();
              final cat = (tx['category'] as String?) ?? 'Other';

              return Container(
                margin: const EdgeInsets.only(bottom: 10),
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
                        color: AppColors.surfaceLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.shopping_bag, color: AppColors.textPrimary, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            note.isNotEmpty ? note : 'Purchase',
                            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          Text(
                            cat,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      "-\$${amount.toStringAsFixed(2)}",
                      style: const TextStyle(color: AppColors.dangerRed, fontWeight: FontWeight.bold, fontSize: 15),
                    )
                  ],
                ),
              );
            }).toList(),
          )
        else
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 32),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: const Column(
              children: [
                Text(
                  "No transactions yet today",
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 14, fontWeight: FontWeight.w500),
                ),
                SizedBox(height: 4),
                Text(
                  "Great start! Keep it up 🎯",
                  style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          )
      ],
    );
  }
}
