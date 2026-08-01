import 'package:flutter/material.dart';

class AppColors {
  // Backgrounds
  static const Color background = Color(0xFF0B0F17); // Deep slate black
  static const Color surface = Color(0xFF161E2E);    // Glass card surface
  static const Color surfaceLight = Color(0xFF1E293B);

  // Accents
  static const Color primaryEmerald = Color(0xFF10B981); // Savings / Safe days
  static const Color warningAmber = Color(0xFFF59E0B);  // Pacing alerts / Approaching limit
  static const Color dangerRose = Color(0xFFEF4444);    // Over-budget / Emergency pause
  static const Color infoIndigo = Color(0xFF6366F1);    // Benchmarks / Info

  // Text
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Glass borders & overlays
  static const Color glassBorder = Color(0x1AFFFFFF); // 10% white border
  static const Color glassHighlight = Color(0x0FFFFFFF); // 5% white overlay
}
