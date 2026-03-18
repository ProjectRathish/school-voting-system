import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../../../core/network/api_constants.dart';
import '../models/auth_models.dart';

part 'auth_repository.g.dart';

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<AuthResponse> login(String schoolCode, String username, String password) async {
    try {
      final response = await _dio.post(
        ApiConstants.login,
        data: {
          'school_code': schoolCode,
          'username': username,
          'password': password,
        },
      );
      return AuthResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<AuthResponse> boothLogin(String schoolCode, String username, String password) async {
    try {
      final response = await _dio.post(
        '/auth/booth-login',
        data: {
          'school_code': schoolCode,
          'username': username,
          'password': password,
        },
      );
      return AuthResponse.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}

@Riverpod(keepAlive: true)
AuthRepository authRepository(Ref ref) {
  return AuthRepository(ref.watch(dioProvider));
}
