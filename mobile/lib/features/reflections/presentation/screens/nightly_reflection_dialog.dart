import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/storage/preferences_helper.dart';

class NightlyReflectionDialog extends StatefulWidget {
  const NightlyReflectionDialog({super.key});

  @override
  State<NightlyReflectionDialog> createState() => _NightlyReflectionDialogState();
}

class _NightlyReflectionDialogState extends State<NightlyReflectionDialog> {
  String _selectedMood = '😄';
  final _notesController = TextEditingController();
  final _regretController = TextEditingController();
  bool _isLoadingAi = false;
  Map<String, dynamic>? _aiAnalysisResult;

  final List<String> _moods = ['😄', '😐', '😔'];

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.infoIndigo.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.nightlight_round, color: AppColors.infoIndigo, size: 24),
                ),
                const SizedBox(width: 12),
                const Text(
                  "Nightly Reflection",
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              "How do you feel about your spending decisions today?",
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
            const SizedBox(height: 16),

            // MOOD SELECTOR
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: _moods.map((mood) {
                final isSelected = _selectedMood == mood;
                return GestureDetector(
                  onTap: () => setState(() => _selectedMood = mood),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.infoIndigo.withValues(alpha: 0.2) : AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppColors.infoIndigo : AppColors.glassBorder,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Text(mood, style: const TextStyle(fontSize: 28)),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // REGRET OR PROUD NOTE
            TextField(
              controller: _regretController,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                labelText: "Any regretful or proud purchase today?",
                labelStyle: TextStyle(color: AppColors.textSecondary),
                hintText: "e.g. Spent \$12 on fast food when stressed",
                hintStyle: TextStyle(color: AppColors.textMuted),
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 16),

            // GENERAL REFLECTION NOTES
            TextField(
              controller: _notesController,
              maxLines: 2,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: const InputDecoration(
                labelText: "General learnings or thoughts",
                labelStyle: TextStyle(color: AppColors.textSecondary),
                hintText: "What did you learn today?",
                hintStyle: TextStyle(color: AppColors.textMuted),
                border: OutlineInputBorder(),
              ),
            ),

            const SizedBox(height: 20),

            // AI ANALYSIS DISPLAY PANEL
            if (_isLoadingAi)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryEmerald)),
                      SizedBox(width: 12),
                      Text("Minimax AI Analyzing Triggers...", style: TextStyle(color: AppColors.primaryEmerald, fontSize: 13)),
                    ],
                  ),
                ),
              ),

            if (_aiAnalysisResult != null) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primaryEmerald.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.primaryEmerald.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.psychology, color: AppColors.primaryEmerald, size: 20),
                        SizedBox(width: 8),
                        Text("AI Behavioral Insights", style: TextStyle(color: AppColors.primaryEmerald, fontWeight: FontWeight.bold, fontSize: 14)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _aiAnalysisResult!['suggestion'] ?? "Great reflection! Awareness is the first step to financial discipline.",
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // ACTION BUTTONS
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("Skip", style: TextStyle(color: AppColors.textMuted)),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _submitReflection,
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryEmerald),
                  child: const Text("Complete Reflection", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  Future<void> _submitReflection() async {
    setState(() => _isLoadingAi = true);

    try {
      final response = await ApiClient.instance.dio.post(
        '/api/reflections',
        data: {
          'mood': _selectedMood,
          'regret_purchase': _regretController.text.isNotEmpty ? _regretController.text : null,
          'notes': _notesController.text.isNotEmpty ? _notesController.text : null,
        },
      );

      await PreferencesHelper.incrementStreak();

      if (mounted) {
        setState(() {
          _isLoadingAi = false;
          _aiAnalysisResult = response.data as Map<String, dynamic>?;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Reflection saved! Streak incremented 🔥"), backgroundColor: AppColors.primaryEmerald),
        );

        Future.delayed(const Duration(seconds: 2), () {
          if (mounted) Navigator.pop(context);
        });
      }
    } catch (_) {
      await PreferencesHelper.incrementStreak();
      if (mounted) {
        setState(() => _isLoadingAi = false);
        Navigator.pop(context);
      }
    }
  }
}
