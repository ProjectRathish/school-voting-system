import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../repository/terminal_repository.dart';
import '../../elections/models/election_models.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

part 'terminal_provider.g.dart';

@riverpod
class TerminalToken extends _$TerminalToken {
  static const _key = 'terminal_token';
  static const _storage = FlutterSecureStorage();

  @override
  FutureOr<String?> build() async {
    return await _storage.read(key: _key);
  }

  Future<void> setToken(String token) async {
    await _storage.write(key: _key, value: token);
    state = AsyncData(token);
  }

  Future<void> clearToken() async {
    await _storage.delete(key: _key);
    state = const AsyncData(null);
  }
}

@riverpod
class TerminalState extends _$TerminalState {
  Timer? _timer;

  @override
  FutureOr<VotingMachine?> build() async {
    final token = await ref.watch(terminalTokenProvider.future);
    if (token == null) return null;
    
    // Initial verification
    final machine = await _verify(token);

    // Setup polling if machine is FREE (waiting for voter)
    if (machine != null && machine.status == 'FREE') {
      _startPolling(token);
    } else {
      _stopPolling();
    }

    ref.onDispose(() {
      _stopPolling();
    });

    return machine;
  }

  Future<VotingMachine?> _verify(String token) async {
    try {
      return await ref.read(terminalRepositoryProvider).verifyMachine(token);
    } catch (e) {
      return null;
    }
  }

  void _startPolling(String token) {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      try {
        final machine = await _verify(token);
        if (machine != null && machine.status == 'BUSY') {
          // Status changed! Update state to trigger ballot fetch
          state = AsyncData(machine);
          _stopPolling();
        }
      } catch (_) {}
    });
  }

  void _stopPolling() {
    _timer?.cancel();
    _timer = null;
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    ref.invalidateSelf();
  }
}
