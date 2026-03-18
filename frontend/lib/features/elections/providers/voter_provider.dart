import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/election_models.dart';
import '../repository/voter_repository.dart';

part 'voter_provider.g.dart';

@riverpod
class Voters extends _$Voters {
  @override
  FutureOr<List<Voter>> build(int electionId) async {
    return await ref.watch(voterRepositoryProvider).getVoters(electionId);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(voterRepositoryProvider).getVoters(electionId),
    );
  }

  Future<void> createVoter({
    required String admissionNo,
    required String name,
    required String className,
    required String sex,
  }) async {
    await ref.read(voterRepositoryProvider).createVoter(
      electionId: electionId,
      admissionNo: admissionNo,
      name: name,
      className: className,
      sex: sex,
    );
    await refresh();
  }

  Future<void> uploadVoters(List<int> fileBytes, String fileName) async {
    await ref.read(voterRepositoryProvider).uploadVoters(electionId, fileBytes, fileName);
    await refresh();
  }
}
