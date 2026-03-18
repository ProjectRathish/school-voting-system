// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'school_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(schoolRepository)
final schoolRepositoryProvider = SchoolRepositoryProvider._();

final class SchoolRepositoryProvider
    extends
        $FunctionalProvider<
          SchoolRepository,
          SchoolRepository,
          SchoolRepository
        >
    with $Provider<SchoolRepository> {
  SchoolRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'schoolRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$schoolRepositoryHash();

  @$internal
  @override
  $ProviderElement<SchoolRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  SchoolRepository create(Ref ref) {
    return schoolRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(SchoolRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<SchoolRepository>(value),
    );
  }
}

String _$schoolRepositoryHash() => r'633da9f7c5fc07b217b395c129717e60304e4fff';
