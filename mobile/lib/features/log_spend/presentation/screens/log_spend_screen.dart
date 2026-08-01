import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/tariff_calculator.dart';
import '../../../../core/storage/app_database.dart';

class LogSpendScreen extends StatefulWidget {
  const LogSpendScreen({super.key});

  @override
  State<LogSpendScreen> createState() => _LogSpendScreenState();
}

class _LogSpendScreenState extends State<LogSpendScreen> {
  String _amountStr = '';
  final _noteController = TextEditingController();

  String _selectedCategory = 'Food & Dining';
  String? _selectedAccountId;
  String _selectedAccountName = 'USD Cash';
  String _selectedTariff = 'none';

  bool _showBeforeYouBuy = false;
  final double _monthlyIncome = 600.00;
  List<Map<String, dynamic>> _accounts = [];

  final List<String> _categories = [
    'Food & Dining',
    'Entertainment',
    'Shopping',
    'Transport',
    'Bills & Utilities',
    'Health & Fitness',
    'Other'
  ];

  @override
  void initState() {
    super.initState();
    _loadAccounts();
  }

  Future<void> _loadAccounts() async {
    final accs = await AppDatabase.instance.getAccounts();
    if (accs.isNotEmpty) {
      setState(() {
        _accounts = accs;
        _selectedAccountId = accs.first['id'] as String;
        _selectedAccountName = accs.first['name'] as String;
        _selectedTariff = accs.first['fee_tariff_type'] as String;
      });
    }
  }

  void _handleKeyPress(String key) {
    if (key == '.') {
      if (_amountStr.contains('.')) return;
      if (_amountStr.isEmpty) _amountStr = '0';
    }
    if (_amountStr.length >= 7) return;
    setState(() {
      _amountStr += key;
    });
  }

  void _handleDelete() {
    if (_amountStr.isNotEmpty) {
      setState(() {
        _amountStr = _amountStr.substring(0, _amountStr.length - 1);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final amount = double.tryParse(_amountStr) ?? 0.0;
    final feeData = TariffCalculator.calculateFee(amount, _selectedTariff);
    final fee = feeData['fee']!;
    final totalDeducted = feeData['total']!;

    final hourlyRate = _monthlyIncome / 160.0;
    final hoursWorked = amount > 0 ? (amount / hourlyRate) : 0.0;
    final futureValue5Yr = amount * 1.4025;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text("Log Expense", style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                const Text("\$", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                Text(
                  _amountStr.isEmpty ? "0" : _amountStr,
                  style: TextStyle(
                    fontSize: 56,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -1.5,
                    color: _amountStr.isEmpty ? AppColors.textMuted : AppColors.textPrimary,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            if (amount > 0 && !_showBeforeYouBuy)
              TextButton.icon(
                onPressed: () => setState(() => _showBeforeYouBuy = true),
                icon: const Icon(Icons.calculate_outlined, color: AppColors.infoIndigo, size: 18),
                label: const Text(
                  "Show Purchase Analysis",
                  style: TextStyle(color: AppColors.infoIndigo, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                style: TextButton.styleFrom(
                  backgroundColor: AppColors.infoIndigo.withValues(alpha: 0.1),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
              ),

            if (_showBeforeYouBuy && amount > 0) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.glassBorder),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Costs in Labor Hours:", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        Text("${hoursWorked.toStringAsFixed(1)} hrs", style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.warningOrange)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("5-Yr Opportunity Cost:", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        Text("\$${futureValue5Yr.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.safeGreen)),
                      ],
                    ),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => setState(() => _showBeforeYouBuy = false),
                        child: const Text("Hide Analysis", style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                      ),
                    )
                  ],
                ),
              )
            ],

            const SizedBox(height: 16),

            if (amount > 0 && fee > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.warningBg,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.warningOrange.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text("Tariff Fee: +\$${fee.toStringAsFixed(2)}", style: const TextStyle(color: AppColors.warningOrange, fontWeight: FontWeight.bold, fontSize: 13)),
                    Text("Total: \$${totalDeducted.toStringAsFixed(2)}", style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
              ),

            const SizedBox(height: 20),

            TextField(
              controller: _noteController,
              decoration: InputDecoration(
                labelText: "What's this for? (optional)",
                hintText: "e.g., Coffee, Lunch, Groceries",
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                filled: true,
                fillColor: AppColors.surface,
              ),
            ),

            const SizedBox(height: 20),

            const Align(
              alignment: Alignment.centerLeft,
              child: Text("Pay From Account", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary, fontSize: 13)),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: _accounts.map((acc) {
                final isSelected = _selectedAccountId == acc['id'];
                return ChoiceChip(
                  label: Text(acc['name'] as String),
                  selected: isSelected,
                  selectedColor: AppColors.textPrimary,
                  backgroundColor: AppColors.surface,
                  labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary, fontWeight: FontWeight.bold),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedAccountId = acc['id'] as String;
                        _selectedAccountName = acc['name'] as String;
                        _selectedTariff = acc['fee_tariff_type'] as String;
                      });
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            const Align(
              alignment: Alignment.centerLeft,
              child: Text("Category", style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textSecondary, fontSize: 13)),
            ),
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
                  labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary, fontSize: 13),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedCategory = cat);
                    }
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 24),

            _buildReactKeypadGrid(),

            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: amount <= 0 ? null : () {
                  if (amount >= 50.0 && _selectedCategory != 'Bills & Utilities') {
                    _showEmergencyPauseDialog(context, amount, fee, totalDeducted);
                  } else {
                    _saveTransaction(fee, totalDeducted, null);
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.textPrimary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                child: const Text("Save Expense", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildReactKeypadGrid() {
    final keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'DEL'];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 2.2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: keys.length,
      itemBuilder: (ctx, idx) {
        final k = keys[idx];
        return InkWell(
          onTap: () {
            if (k == 'DEL') {
              _handleDelete();
            } else {
              _handleKeyPress(k);
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.glassBorder),
            ),
            child: Center(
              child: k == 'DEL'
                  ? const Icon(Icons.backspace_outlined, size: 20, color: AppColors.textPrimary)
                  : Text(k, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            ),
          ),
        );
      },
    );
  }

  void _showEmergencyPauseDialog(BuildContext context, double amount, double fee, double totalDeducted) {
    final reasonController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.pause_circle_filled, color: AppColors.dangerRed),
            SizedBox(width: 8),
            Text("Emergency Pause", style: TextStyle(color: AppColors.dangerRed, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "This purchase is \$${amount.toStringAsFixed(2)}. To prevent impulse buys, please write a brief justification (min 10 chars).",
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
                _saveTransaction(fee, totalDeducted, reasonController.text);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.dangerRed),
            child: const Text("Override & Save", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Future<void> _saveTransaction(double fee, double totalDeducted, String? emergencyReason) async {
    final amount = double.tryParse(_amountStr) ?? 0.0;
    final txId = const Uuid().v4();
    final nowIso = DateTime.now().toIso8601String();

    await AppDatabase.instance.insertTransaction({
      'id': txId,
      'account_id': _selectedAccountId,
      'amount': amount,
      'fee_amount': fee,
      'total_deducted': totalDeducted,
      'category': _selectedCategory,
      'date': nowIso,
      'is_impulse': emergencyReason != null ? 1 : 0,
      'is_pacing_flag': 0,
      'note': _noteController.text.isNotEmpty ? _noteController.text : null,
      'emergency_reason': emergencyReason,
      'is_synced': 0,
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Logged \$${amount.toStringAsFixed(2)} from $_selectedAccountName! 🎉"),
          backgroundColor: AppColors.safeGreen,
        ),
      );
      Navigator.pop(context);
    }
  }
}
