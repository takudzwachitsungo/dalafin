import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/tariff_calculator.dart';

class LogSpendScreen extends StatefulWidget {
  const LogSpendScreen({super.key});

  @override
  State<LogSpendScreen> createState() => _LogSpendScreenState();
}

class _LogSpendScreenState extends State<LogSpendScreen> {
  final _amountController = TextEditingController();

  String _selectedCategory = 'Food & Dining';
  String _selectedAccount = 'EcoCash USD';
  String _selectedTariff = 'ecocash_usd';

  bool _showBeforeYouBuy = false;
  final double _monthlyIncome = 600.00; // Demo income for work-hour calculation

  final List<String> _categories = [
    'Food & Dining',
    'Entertainment',
    'Shopping',
    'Transport',
    'Bills & Utilities',
    'Health & Fitness',
    'Other'
  ];

  final List<Map<String, String>> _accounts = [
    {'name': 'USD Cash', 'tariff': 'none'},
    {'name': 'EcoCash USD', 'tariff': 'ecocash_usd'},
    {'name': 'CBZ Bank Card', 'tariff': 'imtt_2percent'},
  ];

  @override
  Widget build(BuildContext context) {
    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final feeData = TariffCalculator.calculateFee(amount, _selectedTariff);
    final fee = feeData['fee']!;
    final totalDeducted = feeData['total']!;

    // Hourly rate = Income / 160 hours
    final hourlyRate = _monthlyIncome / 160.0;
    final hoursWorked = amount > 0 ? (amount / hourlyRate) : 0.0;
    final futureValue5Yr = amount * 1.4025; // 7% compounding 5 yrs (~40.25% growth)

    return Scaffold(
      appBar: AppBar(
        title: const Text("Log Expense"),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. AMOUNT INPUT FIELD
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.glassBorder),
              ),
              child: TextField(
                controller: _amountController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppColors.primaryEmerald),
                decoration: const InputDecoration(
                  prefixText: "\$ ",
                  prefixStyle: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppColors.primaryEmerald),
                  border: InputBorder.none,
                  hintText: "0.00",
                  hintStyle: TextStyle(color: AppColors.textMuted),
                ),
                onChanged: (val) => setState(() {}),
              ),
            ),

            const SizedBox(height: 16),

            // 2. TARIFF & FEE BREAKDOWN DISPLAY
            if (amount > 0 && fee > 0)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.warningAmber.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.warningAmber.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.receipt_long, color: AppColors.warningAmber, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          "Tariff Fee: +\$${fee.toStringAsFixed(2)}",
                          style: const TextStyle(color: AppColors.warningAmber, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                    Text(
                      "Total Deducted: \$${totalDeducted.toStringAsFixed(2)}",
                      style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 20),

            // 3. SELECT ACCOUNT & TARIFF
            const Text("Pay From Account", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _accounts.map((acc) {
                final isSelected = _selectedAccount == acc['name'];
                return ChoiceChip(
                  label: Text(acc['name']!),
                  selected: isSelected,
                  selectedColor: AppColors.primaryEmerald,
                  backgroundColor: AppColors.surface,
                  labelStyle: TextStyle(color: isSelected ? Colors.black : AppColors.textPrimary, fontWeight: FontWeight.bold),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedAccount = acc['name']!;
                        _selectedTariff = acc['tariff']!;
                      });
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // 4. CATEGORY SELECTOR
            const Text("Category", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                return ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppColors.infoIndigo,
                  backgroundColor: AppColors.surface,
                  labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedCategory = cat);
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // 5. BEFORE-YOU-BUY CALCULATOR TOGGLE & PANEL
            if (amount > 0) ...[
              OutlinedButton.icon(
                onPressed: () => setState(() => _showBeforeYouBuy = !_showBeforeYouBuy),
                icon: const Icon(Icons.calculate_outlined, color: AppColors.primaryEmerald),
                label: Text(
                  _showBeforeYouBuy ? "Hide Purchase Analysis" : "Show Before-You-Buy Analysis",
                  style: const TextStyle(color: AppColors.primaryEmerald, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primaryEmerald),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),

              if (_showBeforeYouBuy) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.glassBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.timer, color: AppColors.warningAmber, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            "Costs ${hoursWorked.toStringAsFixed(1)} hours of your labor",
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.trending_up, color: AppColors.primaryEmerald, size: 20),
                          const SizedBox(width: 8),
                          Text(
                            "5-Yr Opportunity Cost: \$${futureValue5Yr.toStringAsFixed(2)}",
                            style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryEmerald),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        "Is this purchase worth ${hoursWorked.toStringAsFixed(1)} hours of your life?",
                        style: const TextStyle(fontStyle: FontStyle.italic, color: AppColors.textSecondary, fontSize: 13),
                      )
                    ],
                  ),
                ),
              ],
            ],

            const SizedBox(height: 28),

            // 6. SAVE EXPENSE BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  if (amount >= 50.0 && _selectedCategory != 'Bills & Utilities') {
                    _showEmergencyPauseDialog(context, amount);
                  } else {
                    _saveTransaction();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryEmerald,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text("Save Expense", style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }

  void _showEmergencyPauseDialog(BuildContext context, double amount) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.pause_circle_filled, color: AppColors.dangerRose),
            SizedBox(width: 8),
            Text("Emergency Pause", style: TextStyle(color: AppColors.dangerRose, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "This purchase is \$${amount.toStringAsFixed(2)}. To prevent impulse buys, please write a brief justification (min 20 chars).",
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              maxLines: 3,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                hintText: "Why do you really need this right now?",
                hintStyle: TextStyle(color: AppColors.textMuted),
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel Purchase", style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              if (reasonController.text.length >= 10) {
                Navigator.pop(ctx);
                _saveTransaction();
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerRose),
            child: const Text("Override & Save", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _saveTransaction() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Expense logged successfully! 🎉"), backgroundColor: AppColors.primaryEmerald),
    );
    Navigator.pop(context);
  }
}
