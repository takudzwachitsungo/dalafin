import 'package:flutter/material.dart';
import 'core/constants/app_theme.dart';
import 'core/notifications/notification_service.dart';
import 'features/dashboard/presentation/screens/today_dashboard_screen.dart';
import 'features/log_spend/presentation/screens/log_spend_screen.dart';
import 'features/wishlist/presentation/screens/wishlist_screen.dart';
import 'features/reports/presentation/screens/trends_reports_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NotificationService.instance.initialize();
  runApp(const DalafinApp());
}

class DalafinApp extends StatelessWidget {
  const DalafinApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dalafin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainNavigationWrapper(),
    );
  }
}

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      TodayDashboardScreen(
        onLogSpendPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (ctx) => const LogSpendScreen()),
          );
        },
      ),
      const LogSpendScreen(),
      const WishlistScreen(),
      const TrendsReportsScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.today),
            label: "Today",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add_circle_outline),
            label: "Log Spend",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite_border),
            label: "Wishlist",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart),
            label: "Reports",
          ),
        ],
      ),
    );
  }
}
