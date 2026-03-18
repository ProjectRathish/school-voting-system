import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'api_constants.dart';
import 'token_provider.dart';

part 'dio_provider.g.dart';

@Riverpod(keepAlive: true)
Dio dio(Ref ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  // Add interceptors for tokens, logging, etc.
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        print('HTTP Request: ${options.method} ${options.path}');
        try {
          // Use ref.read instead of ref.watch in interceptors
          final token = await ref.read(tokenManagerProvider.future);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
        } catch (e) {
          print('Error getting token for request: $e');
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('HTTP Response: ${response.statusCode} for ${response.requestOptions.path}');
        return handler.next(response);
      },
      onError: (e, handler) {
        print('HTTP Error: ${e.type} for ${e.requestOptions.path}');
        print('Error Message: ${e.message}');
        if (e.response != null) {
          print('Error Data: ${e.response?.data}');
        }
        return handler.next(e);
      },
    ),
  );

  return dio;
}
