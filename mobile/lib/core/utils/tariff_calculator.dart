class TariffCalculator {
  /// Calculates transaction fee and total deducted amount.
  /// Tariff Types: "ecocash_usd", "ecocash_zig", "imtt_2percent", "custom", "none"
  static Map<String, double> calculateFee(double amount, String tariffType) {
    if (amount <= 0) {
      return {'fee': 0.0, 'total': 0.0};
    }

    double fee = 0.0;
    final type = tariffType.toLowerCase();

    if (type == 'ecocash_usd') {
      if (amount <= 2.0) {
        fee = 0.05;
      } else if (amount <= 5.0) {
        fee = 0.12;
      } else if (amount <= 10.0) {
        fee = 0.25;
      } else if (amount <= 20.0) {
        fee = 0.45;
      } else if (amount <= 50.0) {
        fee = 0.95;
      } else if (amount <= 100.0) {
        fee = 1.85;
      } else {
        fee = (amount * 0.02 * 100).roundToDouble() / 100;
      }
    } else if (type == 'imtt_2percent') {
      fee = (amount * 0.02 * 100).roundToDouble() / 100;
    } else if (type == 'ecocash_zig') {
      fee = (amount * 0.025 * 100).roundToDouble() / 100;
    } else {
      fee = 0.0;
    }

    final total = (amount + fee * 100).roundToDouble() / 100;
    return {
      'fee': fee,
      'total': total,
    };
  }
}
