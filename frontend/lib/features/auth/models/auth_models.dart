import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_models.freezed.dart';
part 'auth_models.g.dart';

@freezed
abstract class AuthUser with _$AuthUser {
  const factory AuthUser({
    required int id,
    required String role,
    @JsonKey(name: 'school_id') required int schoolId,
    @JsonKey(name: 'school_name') String? schoolName,
    @JsonKey(name: 'school_logo') String? schoolLogo,
    @JsonKey(name: 'booth_id') int? boothId,
  }) = _AuthUser;

  const AuthUser._();

  factory AuthUser.fromJson(Map<String, dynamic> json) => _$AuthUserFromJson(json);
}

@freezed
abstract class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required String message,
    required String token,
    required String role,
    @JsonKey(name: 'school_id') required int schoolId,
    @JsonKey(name: 'school_name') String? schoolName,
    @JsonKey(name: 'school_logo') String? schoolLogo,
    @JsonKey(name: 'booth_id') int? boothId,
  }) = _AuthResponse;

  const AuthResponse._();

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
}
