import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class AppDatabase {
  static final AppDatabase instance = AppDatabase._init();
  static Database? _database;

  AppDatabase._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('dalafin.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Accounts Table
    await db.execute('''
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        current_balance REAL NOT NULL DEFAULT 0.0,
        fee_tariff_type TEXT NOT NULL DEFAULT 'none',
        is_active INTEGER NOT NULL DEFAULT 1
      )
    ''');

    // Transactions Table
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        amount REAL NOT NULL,
        fee_amount REAL NOT NULL DEFAULT 0.0,
        total_deducted REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        is_impulse INTEGER NOT NULL DEFAULT 0,
        is_pacing_flag INTEGER NOT NULL DEFAULT 0,
        note TEXT,
        emergency_reason TEXT,
        is_synced INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
      )
    ''');

    // Wishlist Items Table
    await db.execute('''
      CREATE TABLE wishlist_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        cooldown_days INTEGER NOT NULL,
        added_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'waiting'
      )
    ''');

    // Recurring Expenses Table
    await db.execute('''
      CREATE TABLE recurring_expenses (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        frequency TEXT NOT NULL DEFAULT 'monthly',
        due_day INTEGER NOT NULL,
        is_auto_log INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
      )
    ''');

    // Seed Default Accounts if empty
    await db.insert('accounts', {
      'id': 'acc_cash',
      'name': 'USD Cash',
      'account_type': 'cash',
      'currency': 'USD',
      'current_balance': 50.00,
      'fee_tariff_type': 'none',
      'is_active': 1,
    });

    await db.insert('accounts', {
      'id': 'acc_ecocash',
      'name': 'EcoCash USD',
      'account_type': 'mobile_money',
      'currency': 'USD',
      'current_balance': 30.00,
      'fee_tariff_type': 'ecocash_usd',
      'is_active': 1,
    });

    await db.insert('accounts', {
      'id': 'acc_cbz',
      'name': 'CBZ Bank Card',
      'account_type': 'bank',
      'currency': 'USD',
      'current_balance': 150.00,
      'fee_tariff_type': 'imtt_2percent',
      'is_active': 1,
    });
  }

  // --- ACCOUNTS DATA METHODS ---
  Future<List<Map<String, dynamic>>> getAccounts() async {
    final db = await instance.database;
    return await db.query('accounts', where: 'is_active = 1');
  }

  Future<int> insertAccount(Map<String, dynamic> account) async {
    final db = await instance.database;
    return await db.insert('accounts', account, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<int> updateAccountBalance(String id, double newBalance) async {
    final db = await instance.database;
    return await db.update(
      'accounts',
      {'current_balance': newBalance},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // --- TRANSACTIONS DATA METHODS ---
  Future<List<Map<String, dynamic>>> getTransactions() async {
    final db = await instance.database;
    return await db.query('transactions', orderBy: 'date DESC');
  }

  Future<int> insertTransaction(Map<String, dynamic> transaction) async {
    final db = await instance.database;
    
    // Debit account balance
    final accountId = transaction['account_id'] as String?;
    final totalDeducted = (transaction['total_deducted'] as num).toDouble();

    if (accountId != null && accountId.isNotEmpty) {
      final accList = await db.query('accounts', where: 'id = ?', whereArgs: [accountId]);
      if (accList.isNotEmpty) {
        final currentBal = (accList.first['current_balance'] as num).toDouble();
        await updateAccountBalance(accountId, currentBal - totalDeducted);
      }
    }

    return await db.insert('transactions', transaction, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  // --- WISHLIST DATA METHODS ---
  Future<List<Map<String, dynamic>>> getWishlistItems() async {
    final db = await instance.database;
    return await db.query('wishlist_items', orderBy: 'added_date DESC');
  }

  Future<int> insertWishlistItem(Map<String, dynamic> item) async {
    final db = await instance.database;
    return await db.insert('wishlist_items', item, conflictAlgorithm: ConflictAlgorithm.replace);
  }
}
