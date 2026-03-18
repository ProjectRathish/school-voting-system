// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_AuthUser _$AuthUserFromJson(Map<String, dynamic> json) => _AuthUser(
  id: (json['id'] as num).toInt(),
  role: json['role'] as String,
  schoolId: (json['school_id'] as num).toInt(),
  schoolName: json['school_name'] as String?,
  schoolLogo: json['school_logo'] as String?,
  boothId: (json['booth_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$AuthUserToJson(_AuthUser instance) => <String, dynamic>{
  'id': instance.id,
  'role': instance.role,
  'school_id': instance.schoolId,
  'school_name': instance.schoolName,
  'school_logo': instance.schoolLogo,
  'booth_id': instance.boothId,
};

_AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) =>
    _AuthResponse(
      message: json['message'] as String,
      token: json['token'] as String,
      role: json['role'] as String,
      schoolId: (json['school_id'] as num).toInt(),
      schoolName: json['school_name'] as String?,
      schoolLogo: json['school_logo'] as String?,
      boothId: (json['booth_id'] as num?)?.toInt(),
    );

Map<String, dynamic> _$AuthResponseToJson(_AuthResponse instance) =>
    <String, dynamic>{
      'message': instance.message,
      'token': instance.token,
      'role': instance.role,
      'school_id': instance.schoolId,
      'school_name': instance.schoolName,
      'school_logo': instance.schoolLogo,
      'booth_id': instance.boothId,
    };
