// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, type=warning

@ProviderFor(Posts)
final postsProvider = PostsFamily._();

final class PostsProvider extends $AsyncNotifierProvider<Posts, List<Post>> {
  PostsProvider._({
    required PostsFamily super.from,
    required int super.argument,
  }) : super(
         retry: null,
         name: r'postsProvider',
         isAutoDispose: true,
         dependencies: null,
         $allTransitiveDependencies: null,
       );

  @override
  String debugGetCreateSourceHash() => _$postsHash();

  @override
  String toString() {
    return r'postsProvider'
        ''
        '($argument)';
  }

  @$internal
  @override
  Posts create() => Posts();

  @override
  bool operator ==(Object other) {
    return other is PostsProvider && other.argument == argument;
  }

  @override
  int get hashCode {
    return argument.hashCode;
  }
}

String _$postsHash() => r'df7fdceddd867e75f6f4652dc4d59f73bce79cd5';

final class PostsFamily extends $Family
    with
        $ClassFamilyOverride<
          Posts,
          AsyncValue<List<Post>>,
          List<Post>,
          FutureOr<List<Post>>,
          int
        > {
  PostsFamily._()
    : super(
        retry: null,
        name: r'postsProvider',
        dependencies: null,
        $allTransitiveDependencies: null,
        isAutoDispose: true,
      );

  PostsProvider call(int electionId) =>
      PostsProvider._(argument: electionId, from: this);

  @override
  String toString() => r'postsProvider';
}

abstract class _$Posts extends $AsyncNotifier<List<Post>> {
  late final _$args = ref.$arg as int;
  int get electionId => _$args;

  FutureOr<List<Post>> build(int electionId);
  @$mustCallSuper
  @override
  void runBuild() {
    final ref = this.ref as $Ref<AsyncValue<List<Post>>, List<Post>>;
    final element =
        ref.element
            as $ClassProviderElement<
              AnyNotifier<AsyncValue<List<Post>>, List<Post>>,
              AsyncValue<List<Post>>,
              Object?,
              Object?
            >;
    element.handleCreate(ref, () => build(_$args));
  }
}
