import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  final List<Map<String, dynamic>> _wishlistItems = [
    {
      'id': '1',
      'name': 'Wireless Headphones',
      'price': 65.00,
      'cooldownDays': 30,
      'daysRemaining': 18,
      'status': 'waiting',
    },
    {
      'id': '2',
      'name': 'Gaming Keyboard',
      'price': 45.00,
      'cooldownDays': 14,
      'daysRemaining': 0,
      'status': 'ready',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Wishlist Icebox"),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.infoIndigo.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.infoIndigo.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.ac_unit, color: AppColors.infoIndigo, size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "Impulse Icebox cools non-essentials for 14-45 days. If you still want it when the timer expires, buy it!",
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: _wishlistItems.length,
                itemBuilder: (ctx, i) {
                  final item = _wishlistItems[i];
                  final isReady = item['daysRemaining'] == 0;
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
                            color: isReady ? AppColors.primaryEmerald.withValues(alpha: 0.15) : AppColors.warningAmber.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isReady ? Icons.check_circle_outline : Icons.hourglass_top,
                            color: isReady ? AppColors.primaryEmerald : AppColors.warningAmber,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item['name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary)),
                              const SizedBox(height: 4),
                              Text(
                                isReady ? "Ready to buy!" : "${item['daysRemaining']} days cooldown remaining",
                                style: TextStyle(
                                  color: isReady ? AppColors.primaryEmerald : AppColors.warningAmber,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              )
                            ],
                          ),
                        ),
                        Text(
                          "\$${(item['price'] as double).toStringAsFixed(2)}",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                        )
                      ],
                    ),
                  );
                },
              ),
            )
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddWishlistDialog,
        backgroundColor: AppColors.infoIndigo,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  void _showAddWishlistDialog() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surface,
        title: const Text("Add to Wishlist Icebox", style: TextStyle(color: AppColors.textPrimary)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: "Item name (e.g. Shoes)", hintStyle: TextStyle(color: AppColors.textMuted)),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: priceCtrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: AppColors.textPrimary),
              decoration: const InputDecoration(hintText: "Price (\$)", hintStyle: TextStyle(color: AppColors.textMuted)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () {
              if (nameCtrl.text.isNotEmpty && priceCtrl.text.isNotEmpty) {
                final price = double.tryParse(priceCtrl.text) ?? 0.0;
                int cooldown = price <= 50 ? 14 : (price <= 150 ? 30 : 45);
                setState(() {
                  _wishlistItems.add({
                    'id': DateTime.now().toString(),
                    'name': nameCtrl.text,
                    'price': price,
                    'cooldownDays': cooldown,
                    'daysRemaining': cooldown,
                    'status': 'waiting',
                  });
                });
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.infoIndigo),
            child: const Text("Put on Ice", style: TextStyle(color: Colors.white)),
          )
        ],
      ),
    );
  }
}
