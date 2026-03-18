// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voter_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(voterRepository)
final voterRepositoryProvider = VoterRepositoryProvider._();

final class VoterRepositoryProvider
    extends
        $FunctionalProvider<VoterRepository, VoterRepository, VoterRepository>
    with $Provider<VoterRepository> {
  VoterRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'voterRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$voterRepositoryHash();

  @$internal
  @override
  $ProviderElement<VoterRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  VoterRepository create(Ref ref) {
    return voterRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(VoterRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<VoterRepository>(value),
    );
  }
}

String _$voterRepositoryHash() => r'e76639f7fd619fb766a6b1d3ada00d5df931eb0b';
