import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';

part 'post_repository.g.dart';

class PostRepository {
  final Dio _dio;

  PostRepository(this._dio);

  Future<List<Post>> getPosts(int electionId) async {
    try {
      final response = await _dio.get('/posts/get-posts', queryParameters: {'election_id': electionId});
      final List<dynamic> data = response.data;
      return data.map((json) => Post.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> createPost({
    required int electionId,
    required String name,
    required String genderRule,
    required List<int> candidateClasses,
    required List<int> votingClasses,
  }) async {
    try {
      await _dio.post(
        '/posts/create',
        data: {
          'election_id': electionId,
          'name': name,
          'gender_rule': genderRule,
          'candidate_classes': candidateClasses,
          'voting_classes': votingClasses,
        },
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updatePost(int postId, Map<String, dynamic> updates) async {
    try {
      await _dio.put('/posts/$postId', data: updates);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePost(int postId) async {
    try {
      await _dio.delete('/posts/$postId');
    } catch (e) {
      rethrow;
    }
  }
}

@riverpod
PostRepository postRepository(Ref ref) {
  return PostRepository(ref.watch(dioProvider));
}
