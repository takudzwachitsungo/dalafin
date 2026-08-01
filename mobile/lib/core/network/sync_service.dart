import '../storage/app_database.dart';
import 'api_client.dart';

class SyncService {
  static final SyncService instance = SyncService._init();
  SyncService._init();

  /// Scans SQLite database for unsynced transactions (`is_synced = 0`)
  /// and attempts to push them to the backend.
  Future<int> syncOfflineTransactions() async {
    final db = await AppDatabase.instance.database;
    final unsynced = await db.query(
      'transactions',
      where: 'is_synced = 0',
    );

    if (unsynced.isEmpty) return 0;

    int syncedCount = 0;
    for (var tx in unsynced) {
      final success = await ApiClient.instance.postTransaction(tx);
      if (success) {
        final txId = tx['id'] as String;
        await db.update(
          'transactions',
          {'is_synced': 1},
          where: 'id = ?',
          whereArgs: [txId],
        );
        syncedCount++;
      }
    }

    return syncedCount;
  }
}
