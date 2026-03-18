import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'token_provider.g.dart';

@Riverpod(keepAlive: true)
class SecureStorage extends _$SecureStorage {
  @override
  FlutterSecureStorage build() {
    return const FlutterSecureStorage();
  }
}

@Riverpod(keepAlive: true)
class TokenManager extends _$TokenManager {
  static const _tokenKey = 'auth_token';

  @override
  FutureOr<String?> build() async {
    return await ref.watch(secureStorageProvider).read(key: _tokenKey);
  }

  Future<void> saveToken(String token) async {
    await ref.read(secureStorageProvider).write(key: _tokenKey, value: token);
    ref.invalidateSelf();
  }

  Future<void> deleteToken() async {
    await ref.read(secureStorageProvider).delete(key: _tokenKey);
    ref.invalidateSelf();
  }
}
