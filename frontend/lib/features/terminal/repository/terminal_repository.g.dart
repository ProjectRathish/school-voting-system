// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'terminal_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(terminalRepository)
final terminalRepositoryProvider = TerminalRepositoryProvider._();

final class TerminalRepositoryProvider
    extends
        $FunctionalProvider<
          TerminalRepository,
          TerminalRepository,
          TerminalRepository
        >
    with $Provider<TerminalRepository> {
  TerminalRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'terminalRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$terminalRepositoryHash();

  @$internal
  @override
  $ProviderElement<TerminalRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  TerminalRepository create(Ref ref) {
    return terminalRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(TerminalRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<TerminalRepository>(value),
    );
  }
}

String _$terminalRepositoryHash() =>
    r'3e5e1642457971c6fe043981e5630d75fa9cd691';
