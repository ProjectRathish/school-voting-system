// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'class_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(Classes)
final classesProvider = ClassesFamily._();

final class ClassesProvider
    extends $AsyncNotifierProvider<Classes, List<SchoolClass>> {
  ClassesProvider._({
    required ClassesFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'classesProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$classesHash();

  @override
  String toString() {
    return r'classesProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  Classes create() => Classes();

  @override
  bool operator ==(Object other) {
    return other is ClassesProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$classesHash() => r'383f057de96434ebb0582da0bf12484f3dfc37ff';

final class ClassesFamily extends $Family
    with
        $ClassFamilyOverride<
          Classes,
          AsyncValue<List<SchoolClass>>,
          List<SchoolClass>,
          FutureOr<List<SchoolClass>>,
          int
        > {
  ClassesFamily._()
    : super(
        retry: null,
        name: r'classesProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  ClassesProvider call(int electionId) =>
      ClassesProvider._(argument: electionId, from: this);

  @override
  String toString() => r'classesProvider';
}

abstract class _$Classes extends $AsyncNotifier<List<SchoolClass>> {
  late final _$args = ref.$arg as int;
  int get electionId => _$args;

  FutureOr<List<SchoolClass>> build(int electionId);
  @$mustCallSuper
  @override
  void runBuild() {
    final ref =
        this.ref as $Ref<AsyncValue<List<SchoolClass>>, List<SchoolClass>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<SchoolClass>>, List<SchoolClass>>,
              AsyncValue<List<SchoolClass>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(_$args));
  }
}
