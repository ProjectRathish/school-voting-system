import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';

part 'class_repository.g.dart';

class ClassRepository {
  final Dio _dio;

  ClassRepository(this._dio);

  Future<List<SchoolClass>> getClasses(int electionId) async {
    try {
      final response = await _dio.get('/classes/get-classes', queryParameters: {'election_id': electionId});
      final List<dynamic> data = response.data;
      return data.map((json) => SchoolClass.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }
}

@Riverpod(keepAlive: true)
ClassRepository classRepository(Ref ref) {
  return ClassRepository(ref.watch(dioProvider));
}
