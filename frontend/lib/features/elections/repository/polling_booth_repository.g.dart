// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'polling_booth_repository.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(pollingBoothRepository)
final pollingBoothRepositoryProvider = PollingBoothRepositoryProvider._();

final class PollingBoothRepositoryProvider
    extends
        $FunctionalProvider<
          PollingBoothRepository,
          PollingBoothRepository,
          PollingBoothRepository
        >
    with $Provider<PollingBoothRepository> {
  PollingBoothRepositoryProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'pollingBoothRepositoryProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$pollingBoothRepositoryHash();

  @$internal
  @override
  $ProviderElement<PollingBoothRepository> $createElement(
    $ProviderPointer pointer,
  ) => $ProviderElement(pointer);

  @override
  PollingBoothRepository create(Ref ref) {
    return pollingBoothRepository(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(PollingBoothRepository value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<PollingBoothRepository>(value),
    );
  }
}

String _$pollingBoothRepositoryHash() =>
    r'14ca5d29c94f181c45e2fb75c718efffe97fc689';
