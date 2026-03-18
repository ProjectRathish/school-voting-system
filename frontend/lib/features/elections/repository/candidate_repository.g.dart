// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'candidate_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(candidateRepository)
final candidateRepositoryProvider = CandidateRepositoryProvider._();

final class CandidateRepositoryProvider
    extends
        $FunctionalProvider<
          CandidateRepository,
          CandidateRepository,
          CandidateRepository
        >
    with $Provider<CandidateRepository> {
  CandidateRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'candidateRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$candidateRepositoryHash();

  @$internal
  @override
  $ProviderElement<CandidateRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  CandidateRepository create(Ref ref) {
    return candidateRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(CandidateRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<CandidateRepository>(value),
    );
  }
}

String _$candidateRepositoryHash() =>
    r'aa31d9bbf0c622d7adb3a184a090cf7e71d4ec6c';
