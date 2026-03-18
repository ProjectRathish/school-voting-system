import 'dart:io';
import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';

part 'school_repository.g.dart';

class SchoolRepository {
  final Dio _dio;

  SchoolRepository(this._dio);

  Future<String> uploadLogo(File logoFile) async {
    final fileName = logoFile.path.split('/').last;
    final formData = FormData.fromMap({
      'logo': await MultipartFile.fromFile(logoFile.path, filename: fileName),
    });

    final response = await _dio.post('/school/logo', data: formData);
    return response.data['logo'];
  }

  Future<Map<String, dynamic>> getSchoolInfo() async {
    final response = await _dio.get('/school/me');
    return response.data;
  }
}

@riverpod
SchoolRepository schoolRepository(Ref ref) {
  return SchoolRepository(ref.watch(dioProvider));
}
