import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class TrendsReportsScreen extends StatefulWidget {
  const TrendsReportsScreen({super.key});

  @override
  State<TrendsReportsScreen> createState() => _TrendsReportsScreenState();
}

class _TrendsReportsScreenState extends State<TrendsReportsScreen> {
  String _selectedPeriod = 'weekly';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("Weekly Report", style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Last 7 days", style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
            const SizedBox(height: 16),

            // 1. WEEKLY WINS SUMMARY CARD
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF059669), Color(0xFF2563EB)],
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.emoji_events, color: Colors.amber, size: 24),
                      SizedBox(width: 8),
                      Text("Weekly Wins 🎉", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                    ],
                  ),
                  SizedBox(height: 12),
                  Text("Saved 18% more this week compared to last week!", style: TextStyle(color: Colors.white70, fontSize: 14)),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _WinStatItem(label: "Safe Days", value: "6 / 7"),
                      _WinStatItem(label: "Impulses Blocked", value: "3"),
                      _WinStatItem(label: "Saved", value: "\$24.50"),
                    ],
                  )
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 2. 30-DAY SPENDING HEAT MAP
            const Text("30-Day Spending Pattern", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.glassBorder),
              ),
              child: Column(
                children: [
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 7,
                      crossAxisSpacing: 6,
                      mainAxisSpacing: 6,
                    ),
                    itemCount: 30,
                    itemBuilder: (ctx, index) {
                      Color tileColor = AppColors.safeGreen.withValues(alpha: 0.3);
                      if (index == 4 || index == 12 || index == 21) {
                        tileColor = AppColors.dangerRed.withValues(alpha: 0.8);
                      } else if (index == 8 || index == 19) {
                        tileColor = AppColors.warningOrange.withValues(alpha: 0.7);
                      }

                      return Container(
                        decoration: BoxDecoration(
                          color: tileColor,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          "${index + 1}",
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _LegendItem(color: AppColors.safeGreen, label: "Under Cap"),
                      _LegendItem(color: AppColors.warningOrange, label: "80-100% Cap"),
                      _LegendItem(color: AppColors.dangerRed, label: "Over Cap"),
                    ],
                  )
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 3. CATEGORY SPENDING LIMITS
            const Text("Category Limits", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            _buildCategoryLimitItem("Food & Dining", 120.00, 180.00, AppColors.safeGreen),
            _buildCategoryLimitItem("Entertainment", 45.00, 50.00, AppColors.warningOrange),
            _buildCategoryLimitItem("Shopping", 85.00, 80.00, AppColors.dangerRed),

            const SizedBox(height: 24),

            // 4. EXCEL REPORT EXPORTER (MATCHING REACT UI)
            const Text("Export Reports", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.safeBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.safeGreen.withValues(alpha: 0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.file_download_outlined, color: AppColors.safeGreen, size: 24),
                      SizedBox(width: 10),
                      Text("Download Excel Report", style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text("Get a formatted spreadsheet with income, expenses, and insights", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  const SizedBox(height: 16),
                  const Text("Report Period", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary, fontSize: 13)),
                  const SizedBox(height: 8),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    childAspectRatio: 3.2,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    children: ['weekly', 'monthly', 'quarterly', 'yearly'].map((period) {
                      final isSelected = _selectedPeriod == period;
                      return InkWell(
                        onTap: () => setState(() => _selectedPeriod = period),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.safeGreen : AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: isSelected ? AppColors.safeGreen : AppColors.glassBorder),
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            period.toUpperCase(),
                            style: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text("Exporting ${_selectedPeriod.toUpperCase()} Excel Report... 📊"),
                            backgroundColor: AppColors.safeGreen,
                          ),
                        );
                      },
                      icon: const Icon(Icons.download, color: Colors.white),
                      label: Text("Download ${_selectedPeriod.toUpperCase()} Report", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.safeGreen,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryLimitItem(String name, double spent, double limit, Color color) {
    final progress = (spent / limit).clamp(0.0, 1.0);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.glassBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
              Text("\$${spent.toStringAsFixed(0)} / \$${limit.toStringAsFixed(0)}", style: TextStyle(color: color, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 8,
              backgroundColor: AppColors.surfaceLight,
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          )
        ],
      ),
    );
  }
}

class _WinStatItem extends StatelessWidget {
  final String label;
  final String value;
  const _WinStatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 11)),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  const _LegendItem({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
      ],
    );
  }
}
