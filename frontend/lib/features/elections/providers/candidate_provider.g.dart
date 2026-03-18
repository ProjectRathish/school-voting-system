// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'candidate_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(Candidates)
final candidatesProvider = CandidatesFamily._();

final class CandidatesProvider
    extends $AsyncNotifierProvider<Candidates, List<Candidate>> {
  CandidatesProvider._({
    required CandidatesFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'candidatesProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$candidatesHash();

  @override
  String toString() {
    return r'candidatesProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  Candidates create() => Candidates();

  @override
  bool operator ==(Object other) {
    return other is CandidatesProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$candidatesHash() => r'c40c5c27bc43bf499bccea582b05c840804abd92';

final class CandidatesFamily extends $Family
    with
        $ClassFamilyOverride<
          Candidates,
          AsyncValue<List<Candidate>>,
          List<Candidate>,
          FutureOr<List<Candidate>>,
          int
        > {
  CandidatesFamily._()
    : super(
        retry: null,
        name: r'candidatesProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  CandidatesProvider call(int electionId) =>
      CandidatesProvider._(argument: electionId, from: this);

  @override
  String toString() => r'candidatesProvider';
}

abstract class _$Candidates extends $AsyncNotifier<List<Candidate>> {
  late final _$args = ref.$arg as int;
  int get electionId => _$args;

  FutureOr<List<Candidate>> build(int electionId);
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<List<Candidate>>, List<Candidate>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<Candidate>>, List<Candidate>>,
              AsyncValue<List<Candidate>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(_$args));
  }
}
