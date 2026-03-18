import 'dart:io';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/election_models.dart';
import '../repository/candidate_repository.dart';

part 'candidate_provider.g.dart';

@riverpod
class Candidates extends _$Candidates {
  @override
  FutureOr<List<Candidate>> build(int electionId) async {
    return await ref.watch(candidateRepositoryProvider).getCandidates(electionId);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(candidateRepositoryProvider).getCandidates(electionId),
    );
  }

  Future<void> createCandidate({
    required String admissionNo,
    required int postId,
    List<int>? photoBytes,
    String? photoName,
    List<int>? symbolBytes,
    String? symbolName,
  }) async {
    File? photoFile;
    if (photoBytes != null && photoName != null) {
      final tempDir = Directory.systemTemp;
      photoFile = File('${tempDir.path}/$photoName');
      await photoFile.writeAsBytes(photoBytes);
    }

    File? symbolFile;
    if (symbolBytes != null && symbolName != null) {
      final tempDir = Directory.systemTemp;
      symbolFile = File('${tempDir.path}/$symbolName');
      await symbolFile.writeAsBytes(symbolBytes);
    }

    await ref.read(candidateRepositoryProvider).createCandidate(
      electionId: electionId,
      admissionNo: admissionNo,
      postId: postId,
      photo: photoFile,
      symbol: symbolFile,
    );
    await refresh();
  }

  Future<void> deleteCandidate(int candidateId) async {
    await ref.read(candidateRepositoryProvider).deleteCandidate(candidateId);
    await refresh();
  }
}
