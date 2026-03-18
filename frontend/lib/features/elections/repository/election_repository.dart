import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';

part 'election_repository.g.dart';

class ElectionRepository {
  final Dio _dio;

  ElectionRepository(this._dio);

  Future<List<Election>> getElections() async {
    try {
      final response = await _dio.get('/elections/get-elections');
      final List<dynamic> data = response.data;
      return data.map((json) => Election.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Election> getElection(int id) async {
    try {
      final response = await _dio.get('/elections/$id');
      return Election.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createElection(String name, String? startTime, String? endTime) async {
    try {
      await _dio.post(
        '/elections/create',
        data: {
          'name': name,
          'start_time': startTime,
          'end_time': endTime,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<ElectionTurnout> getTurnout(int id) async {
    try {
      final response = await _dio.get('/elections/$id/turnout');
      return ElectionTurnout.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getResults(int id) async {
    try {
      final response = await _dio.get('/elections/$id/results');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateStatus(int id, ElectionStatus status, {String? confirmationText}) async {
    try {
      await _dio.put(
        '/elections/$id/status',
        data: {
          'status': status.name.toUpperCase(),
          if (confirmationText != null) 'confirmation_text': confirmationText,
        },
      );
    } catch (e) {
      rethrow;
    }
  }
}

@riverpod
ElectionRepository electionRepository(Ref ref) {
  return ElectionRepository(ref.watch(dioProvider));
}
