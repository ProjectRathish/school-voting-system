import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/token_provider.dart';
import '../models/auth_models.dart';
import '../repository/auth_repository.dart';

part 'auth_provider.g.dart';

@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  @override
  AsyncValue<AuthUser?> build() {
    return const AsyncValue.data(null);
  }

  Future<void> login(String schoolCode, String username, String password) async {
    state = const AsyncValue.loading();
    try {
      print('Starting login request for $username at $schoolCode...');
      final response = await ref.read(authRepositoryProvider).login(schoolCode, username, password);
      print('Login response received. Status: ${response.message}');
      
      // Save token
      print('Saving token to storage...');
      await ref.read(tokenManagerProvider.notifier).saveToken(response.token);
      print('Token saved successfully.');
      
      // Update state
      state = AsyncValue.data(AuthUser(
        id: 0,
        role: response.role,
        schoolId: response.schoolId,
        schoolName: response.schoolName,
        schoolLogo: response.schoolLogo,
        boothId: response.boothId,
      ));
      print('Auth state updated. Redirecting soon...');
    } catch (e, stack) {
      print('Login error: $e');
      print('Stack trace: $stack');
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> boothLogin(String schoolCode, String username, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await ref.read(authRepositoryProvider).boothLogin(schoolCode, username, password);
      await ref.read(tokenManagerProvider.notifier).saveToken(response.token);
      state = AsyncValue.data(AuthUser(
        id: 0,
        role: response.role,
        schoolId: response.schoolId,
        schoolName: response.schoolName,
        schoolLogo: response.schoolLogo,
        boothId: response.boothId,
      ));
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> logout() async {
    await ref.read(tokenManagerProvider.notifier).deleteToken();
    state = const AsyncValue.data(null);
  }
}
