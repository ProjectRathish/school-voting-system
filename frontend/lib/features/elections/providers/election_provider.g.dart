// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'election_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(Elections)
final electionsProvider = ElectionsProvider._();

final class ElectionsProvider
    extends $AsyncNotifierProvider<Elections, List<Election>> {
  ElectionsProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'electionsProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$electionsHash();

  @$internal
  @override
  Elections create() => Elections();
}

String _$electionsHash() => r'8047936cfa133453e121f7988a5f2b8528853d24';

abstract class _$Elections extends $AsyncNotifier<List<Election>> {
  FutureOr<List<Election>> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<List<Election>>, List<Election>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<Election>>, List<Election>>,
              AsyncValue<List<Election>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

@ProviderFor(electionTurnout)
final electionTurnoutProvider = ElectionTurnoutFamily._();

final class ElectionTurnoutProvider
    extends
        $FunctionalProvider<
          AsyncValue<ElectionTurnout>,
          ElectionTurnout,
          FutureOr<ElectionTurnout>
        >
    with $FutureModifier<ElectionTurnout>, $FutureProvider<ElectionTurnout> {
  ElectionTurnoutProvider._({
    required ElectionTurnoutFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'electionTurnoutProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$electionTurnoutHash();

  @override
  String toString() {
    return r'electionTurnoutProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<ElectionTurnout> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<ElectionTurnout> create(Ref ref) {
    final argument = this.argument as int;
    return electionTurnout(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is ElectionTurnoutProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$electionTurnoutHash() => r'e4ec1c368b22d97dd13dd172f80114904a2cdc30';

final class ElectionTurnoutFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<ElectionTurnout>, int> {
  ElectionTurnoutFamily._()
    : super(
        retry: null,
        name: r'electionTurnoutProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  ElectionTurnoutProvider call(int electionId) =>
      ElectionTurnoutProvider._(argument: electionId, from: this);

  @override
  String toString() => r'electionTurnoutProvider';
}

@ProviderFor(electionResults)
final electionResultsProvider = ElectionResultsFamily._();

final class ElectionResultsProvider
    extends
        $FunctionalProvider<
          AsyncValue<Map<String, dynamic>>,
          Map<String, dynamic>,
          FutureOr<Map<String, dynamic>>
        >
    with
        $FutureModifier<Map<String, dynamic>>,
        $FutureProvider<Map<String, dynamic>> {
  ElectionResultsProvider._({
    required ElectionResultsFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'electionResultsProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$electionResultsHash();

  @override
  String toString() {
    return r'electionResultsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  $FutureProviderElement<Map<String, dynamic>> $createElement(
    $ProviderPointer pointer,
  ) => $FutureProviderElement(pointer);

  @override
  FutureOr<Map<String, dynamic>> create(Ref ref) {
    final argument = this.argument as int;
    return electionResults(ref, argument);
  }

  @override
  bool operator ==(Object other) {
    return other is ElectionResultsProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$electionResultsHash() => r'11f5fcd94dc996e705d9c2ce6b43192712eb6cc7';

final class ElectionResultsFamily extends $Family
    with $FunctionalFamilyOverride<FutureOr<Map<String, dynamic>>, int> {
  ElectionResultsFamily._()
    : super(
        retry: null,
        name: r'electionResultsProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  ElectionResultsProvider call(int electionId) =>
      ElectionResultsProvider._(argument: electionId, from: this);

  @override
  String toString() => r'electionResultsProvider';
}
