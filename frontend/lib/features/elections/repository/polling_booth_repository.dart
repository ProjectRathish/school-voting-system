import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';

part 'polling_booth_repository.g.dart';

class PollingBoothRepository {
  final Dio _dio;

  PollingBoothRepository(this._dio);

  Future<List<PollingBooth>> getPollingBooths(int electionId) async {
    try {
      final response = await _dio.get('/polling-booths', queryParameters: {'election_id': electionId});
      final List<dynamic> data = response.data['data'];
      return data.map((json) => PollingBooth.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createPollingBooth({
    required int electionId,
    required String boothNumber,
    required String location,
    int? capacity,
  }) async {
    try {
      await _dio.post('/polling-booths', data: {
        'election_id': electionId,
        'booth_number': boothNumber,
        'location': location,
        'capacity': capacity,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePollingBooth(int boothId) async {
    try {
      await _dio.delete('/polling-booths/$boothId');
    } catch (e) {
      rethrow;
    }
  }

  // Voting Machine Methods
  Future<List<VotingMachine>> getMachinesInBooth(int boothId) async {
    try {
      final response = await _dio.get('/voting-machines/booth/$boothId');
      final List<dynamic> data = response.data['data'];
      return data.map((json) => VotingMachine.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> registerMachine({
    required int electionId,
    required int boothId,
    required String machineName,
  }) async {
    try {
      final response = await _dio.post('/voting-machines/register', data: {
        'election_id': electionId,
        'booth_id': boothId,
        'machine_name': machineName,
      });
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteMachine(int machineId) async {
    try {
      await _dio.delete('/voting-machines/$machineId');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> assignVoter({
    required int electionId,
    required int boothId,
    required String admissionNo,
    int? machineId,
  }) async {
    try {
      await _dio.post('/polling-booths/assign-voter', data: {
        'election_id': electionId,
        'booth_id': boothId,
        'admission_no': admissionNo,
        if (machineId != null) 'machine_id': machineId,
      });
    } catch (e) {
      rethrow;
    }
  }
}

@riverpod
PollingBoothRepository pollingBoothRepository(Ref ref) {
  return PollingBoothRepository(ref.watch(dioProvider));
}
