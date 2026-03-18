// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'polling_booth_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(PollingBooths)
final pollingBoothsProvider = PollingBoothsFamily._();

final class PollingBoothsProvider
    extends $AsyncNotifierProvider<PollingBooths, List<PollingBooth>> {
  PollingBoothsProvider._({
    required PollingBoothsFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'pollingBoothsProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$pollingBoothsHash();

  @override
  String toString() {
    return r'pollingBoothsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  PollingBooths create() => PollingBooths();

  @override
  bool operator ==(Object other) {
    return other is PollingBoothsProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$pollingBoothsHash() => r'73c81abc1ea8a1d7563519439f6969de53efbb2a';

final class PollingBoothsFamily extends $Family
    with
        $ClassFamilyOverride<
          PollingBooths,
          AsyncValue<List<PollingBooth>>,
          List<PollingBooth>,
          FutureOr<List<PollingBooth>>,
          int
        > {
  PollingBoothsFamily._()
    : super(
        retry: null,
        name: r'pollingBoothsProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  PollingBoothsProvider call(int electionId) =>
      PollingBoothsProvider._(argument: electionId, from: this);

  @override
  String toString() => r'pollingBoothsProvider';
}

abstract class _$PollingBooths extends $AsyncNotifier<List<PollingBooth>> {
  late final _$args = ref.$arg as int;
  int get electionId => _$args;

  FutureOr<List<PollingBooth>> build(int electionId);
  @$mustCallSuper
  @override
  void runBuild() {
    final ref =
        this.ref as $Ref<AsyncValue<List<PollingBooth>>, List<PollingBooth>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<PollingBooth>>, List<PollingBooth>>,
              AsyncValue<List<PollingBooth>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(_$args));
  }
}

@ProviderFor(VotingMachines)
final votingMachinesProvider = VotingMachinesFamily._();

final class VotingMachinesProvider
    extends $AsyncNotifierProvider<VotingMachines, List<VotingMachine>> {
  VotingMachinesProvider._({
    required VotingMachinesFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'votingMachinesProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$votingMachinesHash();

  @override
  String toString() {
    return r'votingMachinesProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  VotingMachines create() => VotingMachines();

  @override
  bool operator ==(Object other) {
    return other is VotingMachinesProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$votingMachinesHash() => r'90ee850963c76fb90d316010a3eea56fbb91e645';

final class VotingMachinesFamily extends $Family
    with
        $ClassFamilyOverride<
          VotingMachines,
          AsyncValue<List<VotingMachine>>,
          List<VotingMachine>,
          FutureOr<List<VotingMachine>>,
          int
        > {
  VotingMachinesFamily._()
    : super(
        retry: null,
        name: r'votingMachinesProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  VotingMachinesProvider call(int boothId) =>
      VotingMachinesProvider._(argument: boothId, from: this);

  @override
  String toString() => r'votingMachinesProvider';
}

abstract class _$VotingMachines extends $AsyncNotifier<List<VotingMachine>> {
  late final _$args = ref.$arg as int;
  int get boothId => _$args;

  FutureOr<List<VotingMachine>> build(int boothId);
  @$mustCallSuper
  @override
  void runBuild() {
    final ref =
        this.ref as $Ref<AsyncValue<List<VotingMachine>>, List<VotingMachine>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<VotingMachine>>, List<VotingMachine>>,
              AsyncValue<List<VotingMachine>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(_$args));
  }
}
