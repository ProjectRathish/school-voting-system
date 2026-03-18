// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$AuthUser {

 int get id; String get role;@JsonKey(name: 'school_id') int get schoolId;@JsonKey(name: 'school_name') String? get schoolName;@JsonKey(name: 'school_logo') String? get schoolLogo;@JsonKey(name: 'booth_id') int? get boothId;
/// Create a copy of AuthUser
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthUserCopyWith<AuthUser> get copyWith => _$AuthUserCopyWithImpl<AuthUser>(this as AuthUser, _$identity);

  /// Serializes this AuthUser to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthUser&&(identical(other.id, id) || other.id == id)&&(identical(other.role, role) || other.role == role)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.schoolName, schoolName) || other.schoolName == schoolName)&&(identical(other.schoolLogo, schoolLogo) || other.schoolLogo == schoolLogo)&&(identical(other.boothId, boothId) || other.boothId == boothId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,role,schoolId,schoolName,schoolLogo,boothId);

@override
String toString() {
  return 'AuthUser(id: $id, role: $role, schoolId: $schoolId, schoolName: $schoolName, schoolLogo: $schoolLogo, boothId: $boothId)';
}


}

/// @nodoc
abstract mixin class $AuthUserCopyWith<$Res>  {
  factory $AuthUserCopyWith(AuthUser value, $Res Function(AuthUser) _then) = _$AuthUserCopyWithImpl;
@useResult
$Res call({
 int id, String role,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'school_name') String? schoolName,@JsonKey(name: 'school_logo') String? schoolLogo,@JsonKey(name: 'booth_id') int? boothId
});




}
/// @nodoc
class _$AuthUserCopyWithImpl<$Res>
    implements $AuthUserCopyWith<$Res> {
  _$AuthUserCopyWithImpl(this._self, this._then);

  final AuthUser _self;
  final $Res Function(AuthUser) _then;

/// Create a copy of AuthUser
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? role = null,Object? schoolId = null,Object? schoolName = freezed,Object? schoolLogo = freezed,Object? boothId = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,schoolName: freezed == schoolName ? _self.schoolName : schoolName // ignore: cast_nullable_to_non_nullable
as String?,schoolLogo: freezed == schoolLogo ? _self.schoolLogo : schoolLogo // ignore: cast_nullable_to_non_nullable
as String?,boothId: freezed == boothId ? _self.boothId : boothId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [AuthUser].
extension AuthUserPatterns on AuthUser {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuthUser value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuthUser() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuthUser value)  $default,){
final _that = this;
switch (_that) {
case _AuthUser():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuthUser value)?  $default,){
final _that = this;
switch (_that) {
case _AuthUser() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id,  String role, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'school_name')  String? schoolName, @JsonKey(name: 'school_logo')  String? schoolLogo, @JsonKey(name: 'booth_id')  int? boothId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuthUser() when $default != null:
return $default(_that.id,_that.role,_that.schoolId,_that.schoolName,_that.schoolLogo,_that.boothId);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id,  String role, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'school_name')  String? schoolName, @JsonKey(name: 'school_logo')  String? schoolLogo, @JsonKey(name: 'booth_id')  int? boothId)  $default,) {final _that = this;
switch (_that) {
case _AuthUser():
return $default(_that.id,_that.role,_that.schoolId,_that.schoolName,_that.schoolLogo,_that.boothId);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id,  String role, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'school_name')  String? schoolName, @JsonKey(name: 'school_logo')  String? schoolLogo, @JsonKey(name: 'booth_id')  int? boothId)?  $default,) {final _that = this;
switch (_that) {
case _AuthUser() when $default != null:
return $default(_that.id,_that.role,_that.schoolId,_that.schoolName,_that.schoolLogo,_that.boothId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AuthUser extends AuthUser {
  const _AuthUser({required this.id, required this.role, @JsonKey(name: 'school_id') required this.schoolId, @JsonKey(name: 'school_name') this.schoolName, @JsonKey(name: 'school_logo') this.schoolLogo, @JsonKey(name: 'booth_id') this.boothId}): super._();
  factory _AuthUser.fromJson(Map<String, dynamic> json) => _$AuthUserFromJson(json);

@override final  int id;
@override final  String role;
@override@JsonKey(name: 'school_id') final  int schoolId;
@override@JsonKey(name: 'school_name') final  String? schoolName;
@override@JsonKey(name: 'school_logo') final  String? schoolLogo;
@override@JsonKey(name: 'booth_id') final  int? boothId;

/// Create a copy of AuthUser
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuthUserCopyWith<_AuthUser> get copyWith => __$AuthUserCopyWithImpl<_AuthUser>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthUserToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuthUser&&(identical(other.id, id) || other.id == id)&&(identical(other.role, role) || other.role == role)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.schoolName, schoolName) || other.schoolName == schoolName)&&(identical(other.schoolLogo, schoolLogo) || other.schoolLogo == schoolLogo)&&(identical(other.boothId, boothId) || other.boothId == boothId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,role,schoolId,schoolName,schoolLogo,boothId);

@override
String toString() {
  return 'AuthUser(id: $id, role: $role, schoolId: $schoolId, schoolName: $schoolName, schoolLogo: $schoolLogo, boothId: $boothId)';
}


}

/// @nodoc
abstract mixin class _$AuthUserCopyWith<$Res> implements $AuthUserCopyWith<$Res> {
  factory _$AuthUserCopyWith(_AuthUser value, $Res Function(_AuthUser) _then) = __$AuthUserCopyWithImpl;
@override @useResult
$Res call({
 int id, String role,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'school_name') String? schoolName,@JsonKey(name: 'school_logo') String? schoolLogo,@JsonKey(name: 'booth_id') int? boothId
});




}
/// @nodoc
class __$AuthUserCopyWithImpl<$Res>
    implements _$AuthUserCopyWith<$Res> {
  __$AuthUserCopyWithImpl(this._self, this._then);

  final _AuthUser _self;
  final $Res Function(_AuthUser) _then;

/// Create a copy of AuthUser
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? role = null,Object? schoolId = null,Object? schoolName = freezed,Object? schoolLogo = freezed,Object? boothId = freezed,}) {
  return _then(_AuthUser(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,schoolName: freezed == schoolName ? _self.schoolName : schoolName // ignore: cast_nullable_to_non_nullable
as String?,schoolLogo: freezed == schoolLogo ? _self.schoolLogo : schoolLogo // ignore: cast_nullable_to_non_nullable
as String?,boothId: freezed == boothId ? _self.boothId : boothId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$AuthResponse {

 String get message; String get token; String get role;@JsonKey(name: 'school_id') int get schoolId;@JsonKey(name: 'school_name') String? get schoolName;@JsonKey(name: 'school_logo') String? get schoolLogo;@JsonKey(name: 'booth_id') int? get boothId;
/// Create a copy of AuthResponse
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthResponseCopyWith<AuthResponse> get copyWith => _$AuthResponseCopyWithImpl<AuthResponse>(this as AuthResponse, _$identity);

  /// Serializes this AuthResponse to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthResponse&&(identical(other.message, message) || other.message == message)&&(identical(other.token, token) || other.token == token)&&(identical(other.role, role) || other.role == role)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.schoolName, schoolName) || other.schoolName == schoolName)&&(identical(other.schoolLogo, schoolLogo) || other.schoolLogo == schoolLogo)&&(identical(other.boothId, boothId) || other.boothId == boothId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,message,token,role,schoolId,schoolName,schoolLogo,boothId);

@override
String toString() {
  return 'AuthResponse(message: $message, token: $token, role: $role, schoolId: $schoolId, schoolName: $schoolName, schoolLogo: $schoolLogo, boothId: $boothId)';
}


}

/// @nodoc
abstract mixin class $AuthResponseCopyWith<$Res>  {
  factory $AuthResponseCopyWith(AuthResponse value, $Res Function(AuthResponse) _then) = _$AuthResponseCopyWithImpl;
@useResult
$Res call({
 String message, String token, String role,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'school_name') String? schoolName,@JsonKey(name: 'school_logo') String? schoolLogo,@JsonKey(name: 'booth_id') int? boothId
});




}
/// @nodoc
class _$AuthResponseCopyWithImpl<$Res>
    implements $AuthResponseCopyWith<$Res> {
  _$AuthResponseCopyWithImpl(this._self, this._then);

  final AuthResponse _self;
  final $Res Function(AuthResponse) _then;

/// Create a copy of AuthResponse
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? message = null,Object? token = null,Object? role = null,Object? schoolId = null,Object? schoolName = freezed,Object? schoolLogo = freezed,Object? boothId = freezed,}) {
  return _then(_self.copyWith(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,token: null == token ? _self.token : token // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,schoolName: freezed == schoolName ? _self.schoolName : schoolName // ignore: cast_nullable_to_non_nullable
as String?,schoolLogo: freezed == schoolLogo ? _self.schoolLogo : schoolLogo // ignore: cast_nullable_to_non_nullable
as String?,boothId: freezed == boothId ? _self.boothId : boothId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [AuthResponse].
extension AuthResponsePatterns on AuthResponse {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuthResponse value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuthResponse() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuthResponse value)  $default,){
final _that = this;
switch (_that) {
case _AuthResponse():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuthResponse value)?  $default,){
final _that = this;
switch (_that) {
case _AuthResponse() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String message,  String token,  String role, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'school_name')  String? schoolName, @JsonKey(name: 'school_logo')  String? schoolLogo, @JsonKey(name: 'booth_id')  int? boothId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuthResponse() when $default != null:
return $default(_that.message,_that.token,_that.role,_that.schoolId,_that.schoolName,_that.schoolLogo,_that.boothId);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String message,  String token,  String role, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'school_name')  String? schoolName, @JsonKey(name: 'school_logo')  String? schoolLogo, @JsonKey(name: 'booth_id')  int? boothId)  $default,) {final _that = this;
switch (_that) {
case _AuthResponse():
return $default(_that.message,_that.token,_that.role,_that.schoolId,_that.schoolName,_that.schoolLogo,_that.boothId);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String message,  String token,  String role, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'school_name')  String? schoolName, @JsonKey(name: 'school_logo')  String? schoolLogo, @JsonKey(name: 'booth_id')  int? boothId)?  $default,) {final _that = this;
switch (_that) {
case _AuthResponse() when $default != null:
return $default(_that.message,_that.token,_that.role,_that.schoolId,_that.schoolName,_that.schoolLogo,_that.boothId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _AuthResponse extends AuthResponse {
  const _AuthResponse({required this.message, required this.token, required this.role, @JsonKey(name: 'school_id') required this.schoolId, @JsonKey(name: 'school_name') this.schoolName, @JsonKey(name: 'school_logo') this.schoolLogo, @JsonKey(name: 'booth_id') this.boothId}): super._();
  factory _AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);

@override final  String message;
@override final  String token;
@override final  String role;
@override@JsonKey(name: 'school_id') final  int schoolId;
@override@JsonKey(name: 'school_name') final  String? schoolName;
@override@JsonKey(name: 'school_logo') final  String? schoolLogo;
@override@JsonKey(name: 'booth_id') final  int? boothId;

/// Create a copy of AuthResponse
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuthResponseCopyWith<_AuthResponse> get copyWith => __$AuthResponseCopyWithImpl<_AuthResponse>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$AuthResponseToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuthResponse&&(identical(other.message, message) || other.message == message)&&(identical(other.token, token) || other.token == token)&&(identical(other.role, role) || other.role == role)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.schoolName, schoolName) || other.schoolName == schoolName)&&(identical(other.schoolLogo, schoolLogo) || other.schoolLogo == schoolLogo)&&(identical(other.boothId, boothId) || other.boothId == boothId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,message,token,role,schoolId,schoolName,schoolLogo,boothId);

@override
String toString() {
  return 'AuthResponse(message: $message, token: $token, role: $role, schoolId: $schoolId, schoolName: $schoolName, schoolLogo: $schoolLogo, boothId: $boothId)';
}


}

/// @nodoc
abstract mixin class _$AuthResponseCopyWith<$Res> implements $AuthResponseCopyWith<$Res> {
  factory _$AuthResponseCopyWith(_AuthResponse value, $Res Function(_AuthResponse) _then) = __$AuthResponseCopyWithImpl;
@override @useResult
$Res call({
 String message, String token, String role,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'school_name') String? schoolName,@JsonKey(name: 'school_logo') String? schoolLogo,@JsonKey(name: 'booth_id') int? boothId
});




}
/// @nodoc
class __$AuthResponseCopyWithImpl<$Res>
    implements _$AuthResponseCopyWith<$Res> {
  __$AuthResponseCopyWithImpl(this._self, this._then);

  final _AuthResponse _self;
  final $Res Function(_AuthResponse) _then;

/// Create a copy of AuthResponse
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? message = null,Object? token = null,Object? role = null,Object? schoolId = null,Object? schoolName = freezed,Object? schoolLogo = freezed,Object? boothId = freezed,}) {
  return _then(_AuthResponse(
message: null == message ? _self.message : message // ignore: cast_nullable_to_non_nullable
as String,token: null == token ? _self.token : token // ignore: cast_nullable_to_non_nullable
as String,role: null == role ? _self.role : role // ignore: cast_nullable_to_non_nullable
as String,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,schoolName: freezed == schoolName ? _self.schoolName : schoolName // ignore: cast_nullable_to_non_nullable
as String?,schoolLogo: freezed == schoolLogo ? _self.schoolLogo : schoolLogo // ignore: cast_nullable_to_non_nullable
as String?,boothId: freezed == boothId ? _self.boothId : boothId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

// dart format on
