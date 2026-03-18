// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'terminal_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(TerminalToken)
final terminalTokenProvider = TerminalTokenProvider._();

final class TerminalTokenProvider
    extends $AsyncNotifierProvider<TerminalToken, String?> {
  TerminalTokenProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'terminalTokenProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$terminalTokenHash();

  @$internal
  @override
  TerminalToken create() => TerminalToken();
}

String _$terminalTokenHash() => r'65f2e6c5d7e051ae794bf6e9e238cf83320cda18';

abstract class _$TerminalToken extends $AsyncNotifier<String?> {
  FutureOr<String?> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<String?>, String?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<String?>, String?>,
              AsyncValue<String?>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

@ProviderFor(TerminalState)
final terminalStateProvider = TerminalStateProvider._();

final class TerminalStateProvider
    extends $AsyncNotifierProvider<TerminalState, VotingMachine?> {
  TerminalStateProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'terminalStateProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$terminalStateHash();

  @$internal
  @override
  TerminalState create() => TerminalState();
}

String _$terminalStateHash() => r'45fc906849652ba3df48813b8e459ec322bc70a2';

abstract class _$TerminalState extends $AsyncNotifier<VotingMachine?> {
  FutureOr<VotingMachine?> build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<VotingMachine?>, VotingMachine?>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<VotingMachine?>, VotingMachine?>,
              AsyncValue<VotingMachine?>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}
