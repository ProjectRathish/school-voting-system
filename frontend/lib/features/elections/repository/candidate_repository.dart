import 'dart:io';
import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';

part 'candidate_repository.g.dart';

class CandidateRepository {
  final Dio _dio;

  CandidateRepository(this._dio);

  Future<List<Candidate>> getCandidates(int electionId) async {
    final response = await _dio.get(
      '/candidates/get-candidates',
      queryParameters: {'election_id': electionId},
    );
    return (response.data as List).map((json) => Candidate.fromJson(json)).toList();
  }

  Future<void> createCandidate({
    required int electionId,
    required String admissionNo,
    required int postId,
    File? photo,
    File? symbol,
  }) async {
    final formData = FormData.fromMap({
      'election_id': electionId,
      'admission_no': admissionNo,
      'post_id': postId,
      if (photo != null)
        'photo': await MultipartFile.fromFile(photo.path, filename: 'photo.jpg'),
      if (symbol != null)
        'symbol': await MultipartFile.fromFile(symbol.path, filename: 'symbol.png'),
    });

    await _dio.post('/candidates/create', data: formData);
  }

  Future<void> deleteCandidate(int candidateId) async {
    await _dio.delete('/candidates/$candidateId');
  }
}

@riverpod
CandidateRepository candidateRepository(Ref ref) {
  return CandidateRepository(ref.watch(dioProvider));
}
