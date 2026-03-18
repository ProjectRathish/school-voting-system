// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'token_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(SecureStorage)
final secureStorageProvider = SecureStorageProvider._();

final class SecureStorageProvider
    extends $NotifierProvider<SecureStorage, FlutterSecureStorage> {
  SecureStorageProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'secureStorageProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$secureStorageHash();

  @$internal
  @override
  SecureStorage create() => SecureStorage();

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(FlutterSecureStorage value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<FlutterSecureStorage>(value),
    );
  }
}

String _$secureStorageHash() => r'ae193e0236cee41d279a1f0028853b8ac9a1beb8';

abstract class _$SecureStorage extends $Notifier<FlutterSecureStorage> {
  FlutterSecureStorage build();
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<FlutterSecureStorage, FlutterSecureStorage>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<FlutterSecureStorage, FlutterSecureStorage>,
              FlutterSecureStorage,
              Object?,
              Object?
            >;
    element.handleCreate(ref, build);
  }
}

@ProviderFor(TokenManager)
final tokenManagerProvider = TokenManagerProvider._();

final class TokenManagerProvider
    extends $AsyncNotifierProvider<TokenManager, String?> {
  TokenManagerProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'tokenManagerProvider',
        isAutoDispose: false,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$tokenManagerHash();

  @$internal
  @override
  TokenManager create() => TokenManager();
}

String _$tokenManagerHash() => r'5dd05d2e46196a71f13aaf65f7fdc9d29ce54459';

abstract class _$TokenManager extends $AsyncNotifier<String?> {
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
