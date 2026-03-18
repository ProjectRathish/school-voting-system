// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(classRepository)
final classRepositoryProvider = ClassRepositoryProvider._();

final class ClassRepositoryProvider
    extends
        $FunctionalProvider<ClassRepository, ClassRepository, ClassRepository>
    with $Provider<ClassRepository> {
  ClassRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'classRepositoryProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$classRepositoryHash();

  @$internal
  @override
  $ProviderElement<ClassRepository> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  ClassRepository create(Ref ref) {
    return classRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(ClassRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<ClassRepository>(value),
    );
  }
}

String _$classRepositoryHash() => r'3e80477ccdde3ca4b6a3226c07629c2acd570af3';
