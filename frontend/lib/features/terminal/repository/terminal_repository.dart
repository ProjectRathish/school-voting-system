import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../../elections/models/election_models.dart';

part 'terminal_repository.g.dart';

class TerminalRepository {
  final Dio _dio;

  TerminalRepository(this._dio);

  Future<VotingMachine> verifyMachine(String token) async {
    try {
      final response = await _dio.get('/voting-machines/verify', queryParameters: {'token': token});
      return VotingMachine.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> fetchBallot(String token) async {
    try {
      final response = await _dio.get(
        '/voting-machines/ballot/fetch',
        options: Options(headers: {'machine-token': token}),
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> castVote({
    required String token,
    required List<Map<String, dynamic>> votes, // List of {post_id, candidate_id}
  }) async {
    try {
      await _dio.post(
        '/voting-machines/vote/cast',
        data: {'votes': votes},
        options: Options(headers: {'machine-token': token}),
      );
    } catch (e) {
      rethrow;
    }
  }
}

@riverpod
TerminalRepository terminalRepository(Ref ref) {
  return TerminalRepository(ref.watch(dioProvider));
}
