import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/election_models.dart';
import '../repository/class_repository.dart';

part 'class_provider.g.dart';

@riverpod
class Classes extends _$Classes {
  @override
  FutureOr<List<SchoolClass>> build(int electionId) async {
    return await ref.watch(classRepositoryProvider).getClasses(electionId);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(classRepositoryProvider).getClasses(electionId),
    );
  }
}
