// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'election_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(electionRepository)
final electionRepositoryProvider = ElectionRepositoryProvider._();

final class ElectionRepositoryProvider
    extends
        $FunctionalProvider<
          ElectionRepository,
          ElectionRepository,
          ElectionRepository
        >
    with $Provider<ElectionRepository> {
  ElectionRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'electionRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$electionRepositoryHash();

  @$internal
  @override
  $ProviderElement<ElectionRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  ElectionRepository create(Ref ref) {
    return electionRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ElectionRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ElectionRepository>(value),
    );
  }
}

String _$electionRepositoryHash() =>
    r'7aa14c546c2ccde1fbdd08b90650b526e7cc9332';
