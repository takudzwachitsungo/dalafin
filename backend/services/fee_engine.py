from typing import Tuple

class TariffFeeEngine:
    """Calculates transaction fees and taxes (e.g. EcoCash tariffs, 2% IMTT tax, bank charges)."""
    
    @staticmethod
    def calculate_fee(amount: float, fee_tariff_type: str) -> Tuple[float, float]:
        """
        Calculates fee amount and total deduction.
        Returns: (fee_amount, total_deducted)
        """
        if amount <= 0:
            return 0.0, 0.0
            
        fee_tariff_type = (fee_tariff_type or "none").lower()
        fee = 0.0
        
        if fee_tariff_type == "ecocash_usd":
            # Tiered EcoCash USD fee approximation
            if amount <= 2.0:
                fee = 0.05
            elif amount <= 5.0:
                fee = 0.12
            elif amount <= 10.0:
                fee = 0.25
            elif amount <= 20.0:
                fee = 0.45
            elif amount <= 50.0:
                fee = 0.95
            elif amount <= 100.0:
                fee = 1.85
            else:
                fee = round(amount * 0.02, 2) # ~2% above $100
                
        elif fee_tariff_type == "imtt_2percent":
            # 2% IMTT Bank / Card Transfer Tax
            fee = round(amount * 0.02, 2)
            
        elif fee_tariff_type == "ecocash_zig":
            # EcoCash ZiG Tiered / %
            fee = round(amount * 0.025, 2)
            
        else:
            fee = 0.0
            
        total_deducted = round(amount + fee, 2)
        return round(fee, 2), total_deducted

fee_engine = TariffFeeEngine()
