import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';

part 'voter_repository.g.dart';

class VoterRepository {
  final Dio _dio;

  VoterRepository(this._dio);

  Future<List<Voter>> getVoters(int electionId) async {
    try {
      final response = await _dio.get('/voters/get-voters', queryParameters: {'election_id': electionId});
      final List<dynamic> data = response.data;
      return data.map((json) => Voter.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createVoter({
    required int electionId,
    required String admissionNo,
    required String name,
    required String className,
    required String sex,
  }) async {
    try {
      await _dio.post('/voters/create', data: {
        'election_id': electionId,
        'admission_no': admissionNo,
        'name': name,
        'class_name': className,
        'sex': sex,
      });
    } catch (e) {
      rethrow;
    }
  }

  Future<void> uploadVoters(int electionId, List<int> fileBytes, String fileName) async {
    try {
      final formData = FormData.fromMap({
        'election_id': electionId,
        'file': MultipartFile.fromBytes(fileBytes, filename: fileName),
      });
      await _dio.post('/voters/upload', data: formData);
    } catch (e) {
      rethrow;
    }
  }

  String getTemplateUrl() {
    return '${_dio.options.baseUrl}/voters/download-template';
  }
}

@riverpod
VoterRepository voterRepository(Ref ref) {
  return VoterRepository(ref.watch(dioProvider));
}
