import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static final ApiClient instance = ApiClient._init();
  late final Dio _dio;

  // Base URL (Adjust for Android Emulator: 10.0.2.2 or physical IP)
  static const String baseUrl = "http://10.0.2.2:8000";

  ApiClient._init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  Dio get dio => _dio;

  // --- AUTH ENDPOINTS ---
  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'username': email,
          'password': password,
        },
        options: Options(contentType: Headers.formUrlEncodedContentType),
      );
      if (response.statusCode == 200) {
        final token = response.data['access_token'] as String;
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', token);
        return response.data as Map<String, dynamic>;
      }
    } catch (_) {}
    return null;
  }

  // --- TRANSACTION SYNC ENDPOINTS ---
  Future<bool> postTransaction(Map<String, dynamic> txData) async {
    try {
      final response = await _dio.post(
        '/api/transactions',
        data: {
          'amount': txData['amount'],
          'fee_amount': txData['fee_amount'],
          'total_deducted': txData['total_deducted'],
          'category': txData['category'],
          'is_impulse': (txData['is_impulse'] ?? 0) == 1,
          'note': txData['note'],
          'emergency_reason': txData['emergency_reason'],
        },
      );
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
