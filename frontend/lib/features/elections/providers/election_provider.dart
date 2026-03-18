import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/election_models.dart';
import '../repository/election_repository.dart';

part 'election_provider.g.dart';

@riverpod
class Elections extends _$Elections {
  @override
  FutureOr<List<Election>> build() async {
    return await ref.watch(electionRepositoryProvider).getElections();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(electionRepositoryProvider).getElections(),
    );
  }

  Future<void> createElection(String name, String? startTime, String? endTime) async {
    await ref.read(electionRepositoryProvider).createElection(name, startTime, endTime);
    await refresh();
  }

  Future<void> updateElectionStatus(int id, ElectionStatus status, {String? confirmationText}) async {
    await ref.read(electionRepositoryProvider).updateStatus(id, status, confirmationText: confirmationText);
    await refresh();
  }
}

@riverpod
Future<ElectionTurnout> electionTurnout(Ref ref, int electionId) async {
  return await ref.watch(electionRepositoryProvider).getTurnout(electionId);
}

@riverpod
Future<Map<String, dynamic>> electionResults(Ref ref, int electionId) async {
  return await ref.watch(electionRepositoryProvider).getResults(electionId);
}
