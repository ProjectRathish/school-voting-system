import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/election_models.dart';
import '../repository/post_repository.dart';

part 'post_provider.g.dart';

@riverpod
class Posts extends _$Posts {
  @override
  FutureOr<List<Post>> build(int electionId) async {
    return await ref.watch(postRepositoryProvider).getPosts(electionId);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(postRepositoryProvider).getPosts(electionId),
    );
  }

  Future<void> createPost({
    required String name,
    required String genderRule,
    required List<int> candidateClasses,
    required List<int> votingClasses,
  }) async {
    await ref.read(postRepositoryProvider).createPost(
      electionId: electionId,
      name: name,
      genderRule: genderRule,
      candidateClasses: candidateClasses,
      votingClasses: votingClasses,
    );
    await refresh();
  }

  Future<void> deletePost(int postId) async {
    await ref.read(postRepositoryProvider).deletePost(postId);
    await refresh();
  }
}
