// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voter_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(Voters)
final votersProvider = VotersFamily._();

final class VotersProvider extends $AsyncNotifierProvider<Voters, List<Voter>> {
  VotersProvider._({
    required VotersFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'votersProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$votersHash();

  @override
  String toString() {
    return r'votersProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  Voters create() => Voters();

  @override
  bool operator ==(Object other) {
    return other is VotersProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$votersHash() => r'ffe2a954f3f4dd9320266a0a1cd450842059bb4e';

final class VotersFamily extends $Family
    with
        $ClassFamilyOverride<
          Voters,
          AsyncValue<List<Voter>>,
          List<Voter>,
          FutureOr<List<Voter>>,
          int
        > {
  VotersFamily._()
    : super(
        retry: null,
        name: r'votersProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  VotersProvider call(int electionId) =>
      VotersProvider._(argument: electionId, from: this);

  @override
  String toString() => r'votersProvider';
}

abstract class _$Voters extends $AsyncNotifier<List<Voter>> {
  late final _$args = ref.$arg as int;
  int get electionId => _$args;

  FutureOr<List<Voter>> build(int electionId);
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<List<Voter>>, List<Voter>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<Voter>>, List<Voter>>,
              AsyncValue<List<Voter>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(_$args));
  }
}
