import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.fee_engine import fee_engine

class TestTariffEngine(unittest.TestCase):
    def test_ecocash_usd_tariffs(self):
        """Test EcoCash USD tiered tariff structure"""
        # <= $2 -> $0.05
        fee, total = fee_engine.calculate_fee(2.00, "ecocash_usd")
        self.assertEqual(fee, 0.05)
        self.assertEqual(total, 2.05)

        # <= $5 -> $0.12
        fee, total = fee_engine.calculate_fee(5.00, "ecocash_usd")
        self.assertEqual(fee, 0.12)
        self.assertEqual(total, 5.12)

        # <= $10 -> $0.25
        fee, total = fee_engine.calculate_fee(10.00, "ecocash_usd")
        self.assertEqual(fee, 0.25)
        self.assertEqual(total, 10.25)

        # > $100 -> 2% ($200 -> $4.00)
        fee, total = fee_engine.calculate_fee(200.00, "ecocash_usd")
        self.assertEqual(fee, 4.00)
        self.assertEqual(total, 204.00)

    def test_imtt_2percent_tariff(self):
        """Test IMTT 2% bank transfer tax"""
        fee, total = fee_engine.calculate_fee(100.00, "imtt_2percent")
        self.assertEqual(fee, 2.00)
        self.assertEqual(total, 102.00)

        fee, total = fee_engine.calculate_fee(50.00, "imtt_2percent")
        self.assertEqual(fee, 1.00)
        self.assertEqual(total, 51.00)

    def test_ecocash_zig_tariff(self):
        """Test ZiG 2.5% mobile money tariff"""
        fee, total = fee_engine.calculate_fee(100.00, "ecocash_zig")
        self.assertEqual(fee, 2.50)
        self.assertEqual(total, 102.50)

    def test_no_tariff(self):
        """Test cash wallet with no tariff"""
        fee, total = fee_engine.calculate_fee(45.00, "none")
        self.assertEqual(fee, 0.00)
        self.assertEqual(total, 45.00)

if __name__ == "__main__":
    unittest.main()
