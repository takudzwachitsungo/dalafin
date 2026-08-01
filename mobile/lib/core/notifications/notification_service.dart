import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final NotificationService instance = NotificationService._init();
  final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  NotificationService._init();

  Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const darwinSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: darwinSettings,
    );

    await _notificationsPlugin.initialize(initSettings);
  }

  /// Displays immediate notification alert
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'dalafin_alerts',
      'Dalafin Interventions',
      channelDescription: 'Impulse control and financial notifications',
      importance: Importance.max,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notificationsPlugin.show(id, title, body, details);
  }

  /// Helper to trigger 8:00 PM Nightly Reflection Alert
  Future<void> showNightlyReflectionPrompt() async {
    await showNotification(
      id: 1001,
      title: "Nightly Reflection Journal 🌙",
      body: "Did you stick to your daily allowance today? Take 10 seconds to reflect!",
    );
  }

  /// Helper to trigger Recurring Bill Due Alert
  Future<void> showBillDueAlert(String billName, double amount, int daysRemaining) async {
    await showNotification(
      id: 1002,
      title: "Upcoming Bill Alert 🔔",
      body: "$billName (\$$amount) is due in $daysRemaining days. Ensure funds are allocated!",
    );
  }

  /// Helper to trigger Wishlist Cooldown Expired Alert
  Future<void> showWishlistCooldownExpired(String itemName) async {
    await showNotification(
      id: 1003,
      title: "Wishlist Cooldown Expired 🎉",
      body: "Your cooling timer for '$itemName' has finished. Still want to buy it?",
    );
  }
}
