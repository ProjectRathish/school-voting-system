// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'election_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$Election {

 int get id;@JsonKey(name: 'school_id') int get schoolId; String get name;@JsonKey(name: 'start_time') String? get startTime;@JsonKey(name: 'end_time') String? get endTime; ElectionStatus get status;@JsonKey(name: 'created_at') String get createdAt;@JsonKey(name: 'created_by') int get createdBy;
/// Create a copy of Election
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ElectionCopyWith<Election> get copyWith => _$ElectionCopyWithImpl<Election>(this as Election, _$identity);

  /// Serializes this Election to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Election&&(identical(other.id, id) || other.id == id)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.name, name) || other.name == name)&&(identical(other.startTime, startTime) || other.startTime == startTime)&&(identical(other.endTime, endTime) || other.endTime == endTime)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.createdBy, createdBy) || other.createdBy == createdBy));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,schoolId,name,startTime,endTime,status,createdAt,createdBy);

@override
String toString() {
  return 'Election(id: $id, schoolId: $schoolId, name: $name, startTime: $startTime, endTime: $endTime, status: $status, createdAt: $createdAt, createdBy: $createdBy)';
}


}

/// @nodoc
abstract mixin class $ElectionCopyWith<$Res>  {
  factory $ElectionCopyWith(Election value, $Res Function(Election) _then) = _$ElectionCopyWithImpl;
@useResult
$Res call({
 int id,@JsonKey(name: 'school_id') int schoolId, String name,@JsonKey(name: 'start_time') String? startTime,@JsonKey(name: 'end_time') String? endTime, ElectionStatus status,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'created_by') int createdBy
});




}
/// @nodoc
class _$ElectionCopyWithImpl<$Res>
    implements $ElectionCopyWith<$Res> {
  _$ElectionCopyWithImpl(this._self, this._then);

  final Election _self;
  final $Res Function(Election) _then;

/// Create a copy of Election
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? schoolId = null,Object? name = null,Object? startTime = freezed,Object? endTime = freezed,Object? status = null,Object? createdAt = null,Object? createdBy = null,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,startTime: freezed == startTime ? _self.startTime : startTime // ignore: cast_nullable_to_non_nullable
as String?,endTime: freezed == endTime ? _self.endTime : endTime // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as ElectionStatus,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,createdBy: null == createdBy ? _self.createdBy : createdBy // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [Election].
extension ElectionPatterns on Election {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Election value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Election() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Election value)  $default,){
final _that = this;
switch (_that) {
case _Election():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Election value)?  $default,){
final _that = this;
switch (_that) {
case _Election() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'school_id')  int schoolId,  String name, @JsonKey(name: 'start_time')  String? startTime, @JsonKey(name: 'end_time')  String? endTime,  ElectionStatus status, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'created_by')  int createdBy)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Election() when $default != null:
return $default(_that.id,_that.schoolId,_that.name,_that.startTime,_that.endTime,_that.status,_that.createdAt,_that.createdBy);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'school_id')  int schoolId,  String name, @JsonKey(name: 'start_time')  String? startTime, @JsonKey(name: 'end_time')  String? endTime,  ElectionStatus status, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'created_by')  int createdBy)  $default,) {final _that = this;
switch (_that) {
case _Election():
return $default(_that.id,_that.schoolId,_that.name,_that.startTime,_that.endTime,_that.status,_that.createdAt,_that.createdBy);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id, @JsonKey(name: 'school_id')  int schoolId,  String name, @JsonKey(name: 'start_time')  String? startTime, @JsonKey(name: 'end_time')  String? endTime,  ElectionStatus status, @JsonKey(name: 'created_at')  String createdAt, @JsonKey(name: 'created_by')  int createdBy)?  $default,) {final _that = this;
switch (_that) {
case _Election() when $default != null:
return $default(_that.id,_that.schoolId,_that.name,_that.startTime,_that.endTime,_that.status,_that.createdAt,_that.createdBy);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Election extends Election {
  const _Election({required this.id, @JsonKey(name: 'school_id') required this.schoolId, required this.name, @JsonKey(name: 'start_time') this.startTime, @JsonKey(name: 'end_time') this.endTime, required this.status, @JsonKey(name: 'created_at') required this.createdAt, @JsonKey(name: 'created_by') required this.createdBy}): super._();
  factory _Election.fromJson(Map<String, dynamic> json) => _$ElectionFromJson(json);

@override final  int id;
@override@JsonKey(name: 'school_id') final  int schoolId;
@override final  String name;
@override@JsonKey(name: 'start_time') final  String? startTime;
@override@JsonKey(name: 'end_time') final  String? endTime;
@override final  ElectionStatus status;
@override@JsonKey(name: 'created_at') final  String createdAt;
@override@JsonKey(name: 'created_by') final  int createdBy;

/// Create a copy of Election
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ElectionCopyWith<_Election> get copyWith => __$ElectionCopyWithImpl<_Election>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ElectionToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Election&&(identical(other.id, id) || other.id == id)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.name, name) || other.name == name)&&(identical(other.startTime, startTime) || other.startTime == startTime)&&(identical(other.endTime, endTime) || other.endTime == endTime)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt)&&(identical(other.createdBy, createdBy) || other.createdBy == createdBy));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,schoolId,name,startTime,endTime,status,createdAt,createdBy);

@override
String toString() {
  return 'Election(id: $id, schoolId: $schoolId, name: $name, startTime: $startTime, endTime: $endTime, status: $status, createdAt: $createdAt, createdBy: $createdBy)';
}


}

/// @nodoc
abstract mixin class _$ElectionCopyWith<$Res> implements $ElectionCopyWith<$Res> {
  factory _$ElectionCopyWith(_Election value, $Res Function(_Election) _then) = __$ElectionCopyWithImpl;
@override @useResult
$Res call({
 int id,@JsonKey(name: 'school_id') int schoolId, String name,@JsonKey(name: 'start_time') String? startTime,@JsonKey(name: 'end_time') String? endTime, ElectionStatus status,@JsonKey(name: 'created_at') String createdAt,@JsonKey(name: 'created_by') int createdBy
});




}
/// @nodoc
class __$ElectionCopyWithImpl<$Res>
    implements _$ElectionCopyWith<$Res> {
  __$ElectionCopyWithImpl(this._self, this._then);

  final _Election _self;
  final $Res Function(_Election) _then;

/// Create a copy of Election
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? schoolId = null,Object? name = null,Object? startTime = freezed,Object? endTime = freezed,Object? status = null,Object? createdAt = null,Object? createdBy = null,}) {
  return _then(_Election(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,startTime: freezed == startTime ? _self.startTime : startTime // ignore: cast_nullable_to_non_nullable
as String?,endTime: freezed == endTime ? _self.endTime : endTime // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as ElectionStatus,createdAt: null == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String,createdBy: null == createdBy ? _self.createdBy : createdBy // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$Post {

 int get id; String get name;@JsonKey(name: 'gender_rule') String get genderRule;@JsonKey(name: 'candidate_classes') List<int> get candidateClasses;@JsonKey(name: 'voting_classes') List<int> get votingClasses;@JsonKey(name: 'election_id') int? get electionId;
/// Create a copy of Post
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PostCopyWith<Post> get copyWith => _$PostCopyWithImpl<Post>(this as Post, _$identity);

  /// Serializes this Post to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Post&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.genderRule, genderRule) || other.genderRule == genderRule)&&const DeepCollectionEquality().equals(other.candidateClasses, candidateClasses)&&const DeepCollectionEquality().equals(other.votingClasses, votingClasses)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,genderRule,const DeepCollectionEquality().hash(candidateClasses),const DeepCollectionEquality().hash(votingClasses),electionId);

@override
String toString() {
  return 'Post(id: $id, name: $name, genderRule: $genderRule, candidateClasses: $candidateClasses, votingClasses: $votingClasses, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class $PostCopyWith<$Res>  {
  factory $PostCopyWith(Post value, $Res Function(Post) _then) = _$PostCopyWithImpl;
@useResult
$Res call({
 int id, String name,@JsonKey(name: 'gender_rule') String genderRule,@JsonKey(name: 'candidate_classes') List<int> candidateClasses,@JsonKey(name: 'voting_classes') List<int> votingClasses,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class _$PostCopyWithImpl<$Res>
    implements $PostCopyWith<$Res> {
  _$PostCopyWithImpl(this._self, this._then);

  final Post _self;
  final $Res Function(Post) _then;

/// Create a copy of Post
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? genderRule = null,Object? candidateClasses = null,Object? votingClasses = null,Object? electionId = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,genderRule: null == genderRule ? _self.genderRule : genderRule // ignore: cast_nullable_to_non_nullable
as String,candidateClasses: null == candidateClasses ? _self.candidateClasses : candidateClasses // ignore: cast_nullable_to_non_nullable
as List<int>,votingClasses: null == votingClasses ? _self.votingClasses : votingClasses // ignore: cast_nullable_to_non_nullable
as List<int>,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [Post].
extension PostPatterns on Post {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Post value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Post() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Post value)  $default,){
final _that = this;
switch (_that) {
case _Post():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Post value)?  $default,){
final _that = this;
switch (_that) {
case _Post() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id,  String name, @JsonKey(name: 'gender_rule')  String genderRule, @JsonKey(name: 'candidate_classes')  List<int> candidateClasses, @JsonKey(name: 'voting_classes')  List<int> votingClasses, @JsonKey(name: 'election_id')  int? electionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Post() when $default != null:
return $default(_that.id,_that.name,_that.genderRule,_that.candidateClasses,_that.votingClasses,_that.electionId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id,  String name, @JsonKey(name: 'gender_rule')  String genderRule, @JsonKey(name: 'candidate_classes')  List<int> candidateClasses, @JsonKey(name: 'voting_classes')  List<int> votingClasses, @JsonKey(name: 'election_id')  int? electionId)  $default,) {final _that = this;
switch (_that) {
case _Post():
return $default(_that.id,_that.name,_that.genderRule,_that.candidateClasses,_that.votingClasses,_that.electionId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id,  String name, @JsonKey(name: 'gender_rule')  String genderRule, @JsonKey(name: 'candidate_classes')  List<int> candidateClasses, @JsonKey(name: 'voting_classes')  List<int> votingClasses, @JsonKey(name: 'election_id')  int? electionId)?  $default,) {final _that = this;
switch (_that) {
case _Post() when $default != null:
return $default(_that.id,_that.name,_that.genderRule,_that.candidateClasses,_that.votingClasses,_that.electionId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Post extends Post {
  const _Post({required this.id, required this.name, @JsonKey(name: 'gender_rule') required this.genderRule, @JsonKey(name: 'candidate_classes') required final  List<int> candidateClasses, @JsonKey(name: 'voting_classes') required final  List<int> votingClasses, @JsonKey(name: 'election_id') this.electionId}): _candidateClasses = candidateClasses,_votingClasses = votingClasses,super._();
  factory _Post.fromJson(Map<String, dynamic> json) => _$PostFromJson(json);

@override final  int id;
@override final  String name;
@override@JsonKey(name: 'gender_rule') final  String genderRule;
 final  List<int> _candidateClasses;
@override@JsonKey(name: 'candidate_classes') List<int> get candidateClasses {
  if (_candidateClasses is EqualUnmodifiableListView) return _candidateClasses;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_candidateClasses);
}

 final  List<int> _votingClasses;
@override@JsonKey(name: 'voting_classes') List<int> get votingClasses {
  if (_votingClasses is EqualUnmodifiableListView) return _votingClasses;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_votingClasses);
}

@override@JsonKey(name: 'election_id') final  int? electionId;

/// Create a copy of Post
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PostCopyWith<_Post> get copyWith => __$PostCopyWithImpl<_Post>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PostToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Post&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.genderRule, genderRule) || other.genderRule == genderRule)&&const DeepCollectionEquality().equals(other._candidateClasses, _candidateClasses)&&const DeepCollectionEquality().equals(other._votingClasses, _votingClasses)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,genderRule,const DeepCollectionEquality().hash(_candidateClasses),const DeepCollectionEquality().hash(_votingClasses),electionId);

@override
String toString() {
  return 'Post(id: $id, name: $name, genderRule: $genderRule, candidateClasses: $candidateClasses, votingClasses: $votingClasses, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class _$PostCopyWith<$Res> implements $PostCopyWith<$Res> {
  factory _$PostCopyWith(_Post value, $Res Function(_Post) _then) = __$PostCopyWithImpl;
@override @useResult
$Res call({
 int id, String name,@JsonKey(name: 'gender_rule') String genderRule,@JsonKey(name: 'candidate_classes') List<int> candidateClasses,@JsonKey(name: 'voting_classes') List<int> votingClasses,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class __$PostCopyWithImpl<$Res>
    implements _$PostCopyWith<$Res> {
  __$PostCopyWithImpl(this._self, this._then);

  final _Post _self;
  final $Res Function(_Post) _then;

/// Create a copy of Post
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? genderRule = null,Object? candidateClasses = null,Object? votingClasses = null,Object? electionId = freezed,}) {
  return _then(_Post(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,genderRule: null == genderRule ? _self.genderRule : genderRule // ignore: cast_nullable_to_non_nullable
as String,candidateClasses: null == candidateClasses ? _self._candidateClasses : candidateClasses // ignore: cast_nullable_to_non_nullable
as List<int>,votingClasses: null == votingClasses ? _self._votingClasses : votingClasses // ignore: cast_nullable_to_non_nullable
as List<int>,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$Candidate {

@JsonKey(name: 'candidate_id') int get id;@JsonKey(name: 'admission_no') String get admissionNo; String get name; String get gender;@JsonKey(name: 'class') String get className; String get post; String? get photo; String? get symbol;@JsonKey(name: 'election_id') int? get electionId;
/// Create a copy of Candidate
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CandidateCopyWith<Candidate> get copyWith => _$CandidateCopyWithImpl<Candidate>(this as Candidate, _$identity);

  /// Serializes this Candidate to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Candidate&&(identical(other.id, id) || other.id == id)&&(identical(other.admissionNo, admissionNo) || other.admissionNo == admissionNo)&&(identical(other.name, name) || other.name == name)&&(identical(other.gender, gender) || other.gender == gender)&&(identical(other.className, className) || other.className == className)&&(identical(other.post, post) || other.post == post)&&(identical(other.photo, photo) || other.photo == photo)&&(identical(other.symbol, symbol) || other.symbol == symbol)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,admissionNo,name,gender,className,post,photo,symbol,electionId);

@override
String toString() {
  return 'Candidate(id: $id, admissionNo: $admissionNo, name: $name, gender: $gender, className: $className, post: $post, photo: $photo, symbol: $symbol, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class $CandidateCopyWith<$Res>  {
  factory $CandidateCopyWith(Candidate value, $Res Function(Candidate) _then) = _$CandidateCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'candidate_id') int id,@JsonKey(name: 'admission_no') String admissionNo, String name, String gender,@JsonKey(name: 'class') String className, String post, String? photo, String? symbol,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class _$CandidateCopyWithImpl<$Res>
    implements $CandidateCopyWith<$Res> {
  _$CandidateCopyWithImpl(this._self, this._then);

  final Candidate _self;
  final $Res Function(Candidate) _then;

/// Create a copy of Candidate
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? admissionNo = null,Object? name = null,Object? gender = null,Object? className = null,Object? post = null,Object? photo = freezed,Object? symbol = freezed,Object? electionId = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,admissionNo: null == admissionNo ? _self.admissionNo : admissionNo // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,gender: null == gender ? _self.gender : gender // ignore: cast_nullable_to_non_nullable
as String,className: null == className ? _self.className : className // ignore: cast_nullable_to_non_nullable
as String,post: null == post ? _self.post : post // ignore: cast_nullable_to_non_nullable
as String,photo: freezed == photo ? _self.photo : photo // ignore: cast_nullable_to_non_nullable
as String?,symbol: freezed == symbol ? _self.symbol : symbol // ignore: cast_nullable_to_non_nullable
as String?,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [Candidate].
extension CandidatePatterns on Candidate {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Candidate value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Candidate() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Candidate value)  $default,){
final _that = this;
switch (_that) {
case _Candidate():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Candidate value)?  $default,){
final _that = this;
switch (_that) {
case _Candidate() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'candidate_id')  int id, @JsonKey(name: 'admission_no')  String admissionNo,  String name,  String gender, @JsonKey(name: 'class')  String className,  String post,  String? photo,  String? symbol, @JsonKey(name: 'election_id')  int? electionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Candidate() when $default != null:
return $default(_that.id,_that.admissionNo,_that.name,_that.gender,_that.className,_that.post,_that.photo,_that.symbol,_that.electionId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'candidate_id')  int id, @JsonKey(name: 'admission_no')  String admissionNo,  String name,  String gender, @JsonKey(name: 'class')  String className,  String post,  String? photo,  String? symbol, @JsonKey(name: 'election_id')  int? electionId)  $default,) {final _that = this;
switch (_that) {
case _Candidate():
return $default(_that.id,_that.admissionNo,_that.name,_that.gender,_that.className,_that.post,_that.photo,_that.symbol,_that.electionId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'candidate_id')  int id, @JsonKey(name: 'admission_no')  String admissionNo,  String name,  String gender, @JsonKey(name: 'class')  String className,  String post,  String? photo,  String? symbol, @JsonKey(name: 'election_id')  int? electionId)?  $default,) {final _that = this;
switch (_that) {
case _Candidate() when $default != null:
return $default(_that.id,_that.admissionNo,_that.name,_that.gender,_that.className,_that.post,_that.photo,_that.symbol,_that.electionId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Candidate extends Candidate {
  const _Candidate({@JsonKey(name: 'candidate_id') required this.id, @JsonKey(name: 'admission_no') required this.admissionNo, required this.name, required this.gender, @JsonKey(name: 'class') required this.className, required this.post, this.photo, this.symbol, @JsonKey(name: 'election_id') this.electionId}): super._();
  factory _Candidate.fromJson(Map<String, dynamic> json) => _$CandidateFromJson(json);

@override@JsonKey(name: 'candidate_id') final  int id;
@override@JsonKey(name: 'admission_no') final  String admissionNo;
@override final  String name;
@override final  String gender;
@override@JsonKey(name: 'class') final  String className;
@override final  String post;
@override final  String? photo;
@override final  String? symbol;
@override@JsonKey(name: 'election_id') final  int? electionId;

/// Create a copy of Candidate
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CandidateCopyWith<_Candidate> get copyWith => __$CandidateCopyWithImpl<_Candidate>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$CandidateToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Candidate&&(identical(other.id, id) || other.id == id)&&(identical(other.admissionNo, admissionNo) || other.admissionNo == admissionNo)&&(identical(other.name, name) || other.name == name)&&(identical(other.gender, gender) || other.gender == gender)&&(identical(other.className, className) || other.className == className)&&(identical(other.post, post) || other.post == post)&&(identical(other.photo, photo) || other.photo == photo)&&(identical(other.symbol, symbol) || other.symbol == symbol)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,admissionNo,name,gender,className,post,photo,symbol,electionId);

@override
String toString() {
  return 'Candidate(id: $id, admissionNo: $admissionNo, name: $name, gender: $gender, className: $className, post: $post, photo: $photo, symbol: $symbol, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class _$CandidateCopyWith<$Res> implements $CandidateCopyWith<$Res> {
  factory _$CandidateCopyWith(_Candidate value, $Res Function(_Candidate) _then) = __$CandidateCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'candidate_id') int id,@JsonKey(name: 'admission_no') String admissionNo, String name, String gender,@JsonKey(name: 'class') String className, String post, String? photo, String? symbol,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class __$CandidateCopyWithImpl<$Res>
    implements _$CandidateCopyWith<$Res> {
  __$CandidateCopyWithImpl(this._self, this._then);

  final _Candidate _self;
  final $Res Function(_Candidate) _then;

/// Create a copy of Candidate
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? admissionNo = null,Object? name = null,Object? gender = null,Object? className = null,Object? post = null,Object? photo = freezed,Object? symbol = freezed,Object? electionId = freezed,}) {
  return _then(_Candidate(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,admissionNo: null == admissionNo ? _self.admissionNo : admissionNo // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,gender: null == gender ? _self.gender : gender // ignore: cast_nullable_to_non_nullable
as String,className: null == className ? _self.className : className // ignore: cast_nullable_to_non_nullable
as String,post: null == post ? _self.post : post // ignore: cast_nullable_to_non_nullable
as String,photo: freezed == photo ? _self.photo : photo // ignore: cast_nullable_to_non_nullable
as String?,symbol: freezed == symbol ? _self.symbol : symbol // ignore: cast_nullable_to_non_nullable
as String?,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$SchoolClass {

 int get id; String get name;@JsonKey(name: 'section_name') String get sectionName;@JsonKey(name: 'election_id') int? get electionId;
/// Create a copy of SchoolClass
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$SchoolClassCopyWith<SchoolClass> get copyWith => _$SchoolClassCopyWithImpl<SchoolClass>(this as SchoolClass, _$identity);

  /// Serializes this SchoolClass to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is SchoolClass&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.sectionName, sectionName) || other.sectionName == sectionName)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,sectionName,electionId);

@override
String toString() {
  return 'SchoolClass(id: $id, name: $name, sectionName: $sectionName, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class $SchoolClassCopyWith<$Res>  {
  factory $SchoolClassCopyWith(SchoolClass value, $Res Function(SchoolClass) _then) = _$SchoolClassCopyWithImpl;
@useResult
$Res call({
 int id, String name,@JsonKey(name: 'section_name') String sectionName,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class _$SchoolClassCopyWithImpl<$Res>
    implements $SchoolClassCopyWith<$Res> {
  _$SchoolClassCopyWithImpl(this._self, this._then);

  final SchoolClass _self;
  final $Res Function(SchoolClass) _then;

/// Create a copy of SchoolClass
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? sectionName = null,Object? electionId = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,sectionName: null == sectionName ? _self.sectionName : sectionName // ignore: cast_nullable_to_non_nullable
as String,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [SchoolClass].
extension SchoolClassPatterns on SchoolClass {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _SchoolClass value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _SchoolClass() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _SchoolClass value)  $default,){
final _that = this;
switch (_that) {
case _SchoolClass():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _SchoolClass value)?  $default,){
final _that = this;
switch (_that) {
case _SchoolClass() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id,  String name, @JsonKey(name: 'section_name')  String sectionName, @JsonKey(name: 'election_id')  int? electionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _SchoolClass() when $default != null:
return $default(_that.id,_that.name,_that.sectionName,_that.electionId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id,  String name, @JsonKey(name: 'section_name')  String sectionName, @JsonKey(name: 'election_id')  int? electionId)  $default,) {final _that = this;
switch (_that) {
case _SchoolClass():
return $default(_that.id,_that.name,_that.sectionName,_that.electionId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id,  String name, @JsonKey(name: 'section_name')  String sectionName, @JsonKey(name: 'election_id')  int? electionId)?  $default,) {final _that = this;
switch (_that) {
case _SchoolClass() when $default != null:
return $default(_that.id,_that.name,_that.sectionName,_that.electionId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _SchoolClass extends SchoolClass {
  const _SchoolClass({required this.id, required this.name, @JsonKey(name: 'section_name') required this.sectionName, @JsonKey(name: 'election_id') this.electionId}): super._();
  factory _SchoolClass.fromJson(Map<String, dynamic> json) => _$SchoolClassFromJson(json);

@override final  int id;
@override final  String name;
@override@JsonKey(name: 'section_name') final  String sectionName;
@override@JsonKey(name: 'election_id') final  int? electionId;

/// Create a copy of SchoolClass
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$SchoolClassCopyWith<_SchoolClass> get copyWith => __$SchoolClassCopyWithImpl<_SchoolClass>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$SchoolClassToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _SchoolClass&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.sectionName, sectionName) || other.sectionName == sectionName)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,name,sectionName,electionId);

@override
String toString() {
  return 'SchoolClass(id: $id, name: $name, sectionName: $sectionName, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class _$SchoolClassCopyWith<$Res> implements $SchoolClassCopyWith<$Res> {
  factory _$SchoolClassCopyWith(_SchoolClass value, $Res Function(_SchoolClass) _then) = __$SchoolClassCopyWithImpl;
@override @useResult
$Res call({
 int id, String name,@JsonKey(name: 'section_name') String sectionName,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class __$SchoolClassCopyWithImpl<$Res>
    implements _$SchoolClassCopyWith<$Res> {
  __$SchoolClassCopyWithImpl(this._self, this._then);

  final _SchoolClass _self;
  final $Res Function(_SchoolClass) _then;

/// Create a copy of SchoolClass
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? sectionName = null,Object? electionId = freezed,}) {
  return _then(_SchoolClass(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,sectionName: null == sectionName ? _self.sectionName : sectionName // ignore: cast_nullable_to_non_nullable
as String,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$TurnoutBreakdown {

@JsonKey(name: 'class_name') String? get className; String? get sex; int get total; int get voted;
/// Create a copy of TurnoutBreakdown
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TurnoutBreakdownCopyWith<TurnoutBreakdown> get copyWith => _$TurnoutBreakdownCopyWithImpl<TurnoutBreakdown>(this as TurnoutBreakdown, _$identity);

  /// Serializes this TurnoutBreakdown to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TurnoutBreakdown&&(identical(other.className, className) || other.className == className)&&(identical(other.sex, sex) || other.sex == sex)&&(identical(other.total, total) || other.total == total)&&(identical(other.voted, voted) || other.voted == voted));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,className,sex,total,voted);

@override
String toString() {
  return 'TurnoutBreakdown(className: $className, sex: $sex, total: $total, voted: $voted)';
}


}

/// @nodoc
abstract mixin class $TurnoutBreakdownCopyWith<$Res>  {
  factory $TurnoutBreakdownCopyWith(TurnoutBreakdown value, $Res Function(TurnoutBreakdown) _then) = _$TurnoutBreakdownCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'class_name') String? className, String? sex, int total, int voted
});




}
/// @nodoc
class _$TurnoutBreakdownCopyWithImpl<$Res>
    implements $TurnoutBreakdownCopyWith<$Res> {
  _$TurnoutBreakdownCopyWithImpl(this._self, this._then);

  final TurnoutBreakdown _self;
  final $Res Function(TurnoutBreakdown) _then;

/// Create a copy of TurnoutBreakdown
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? className = freezed,Object? sex = freezed,Object? total = null,Object? voted = null,}) {
  return _then(_self.copyWith(
className: freezed == className ? _self.className : className // ignore: cast_nullable_to_non_nullable
as String?,sex: freezed == sex ? _self.sex : sex // ignore: cast_nullable_to_non_nullable
as String?,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,voted: null == voted ? _self.voted : voted // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [TurnoutBreakdown].
extension TurnoutBreakdownPatterns on TurnoutBreakdown {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TurnoutBreakdown value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TurnoutBreakdown() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TurnoutBreakdown value)  $default,){
final _that = this;
switch (_that) {
case _TurnoutBreakdown():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TurnoutBreakdown value)?  $default,){
final _that = this;
switch (_that) {
case _TurnoutBreakdown() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'class_name')  String? className,  String? sex,  int total,  int voted)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TurnoutBreakdown() when $default != null:
return $default(_that.className,_that.sex,_that.total,_that.voted);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'class_name')  String? className,  String? sex,  int total,  int voted)  $default,) {final _that = this;
switch (_that) {
case _TurnoutBreakdown():
return $default(_that.className,_that.sex,_that.total,_that.voted);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'class_name')  String? className,  String? sex,  int total,  int voted)?  $default,) {final _that = this;
switch (_that) {
case _TurnoutBreakdown() when $default != null:
return $default(_that.className,_that.sex,_that.total,_that.voted);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TurnoutBreakdown extends TurnoutBreakdown {
  const _TurnoutBreakdown({@JsonKey(name: 'class_name') this.className, this.sex, required this.total, required this.voted}): super._();
  factory _TurnoutBreakdown.fromJson(Map<String, dynamic> json) => _$TurnoutBreakdownFromJson(json);

@override@JsonKey(name: 'class_name') final  String? className;
@override final  String? sex;
@override final  int total;
@override final  int voted;

/// Create a copy of TurnoutBreakdown
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TurnoutBreakdownCopyWith<_TurnoutBreakdown> get copyWith => __$TurnoutBreakdownCopyWithImpl<_TurnoutBreakdown>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TurnoutBreakdownToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TurnoutBreakdown&&(identical(other.className, className) || other.className == className)&&(identical(other.sex, sex) || other.sex == sex)&&(identical(other.total, total) || other.total == total)&&(identical(other.voted, voted) || other.voted == voted));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,className,sex,total,voted);

@override
String toString() {
  return 'TurnoutBreakdown(className: $className, sex: $sex, total: $total, voted: $voted)';
}


}

/// @nodoc
abstract mixin class _$TurnoutBreakdownCopyWith<$Res> implements $TurnoutBreakdownCopyWith<$Res> {
  factory _$TurnoutBreakdownCopyWith(_TurnoutBreakdown value, $Res Function(_TurnoutBreakdown) _then) = __$TurnoutBreakdownCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'class_name') String? className, String? sex, int total, int voted
});




}
/// @nodoc
class __$TurnoutBreakdownCopyWithImpl<$Res>
    implements _$TurnoutBreakdownCopyWith<$Res> {
  __$TurnoutBreakdownCopyWithImpl(this._self, this._then);

  final _TurnoutBreakdown _self;
  final $Res Function(_TurnoutBreakdown) _then;

/// Create a copy of TurnoutBreakdown
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? className = freezed,Object? sex = freezed,Object? total = null,Object? voted = null,}) {
  return _then(_TurnoutBreakdown(
className: freezed == className ? _self.className : className // ignore: cast_nullable_to_non_nullable
as String?,sex: freezed == sex ? _self.sex : sex // ignore: cast_nullable_to_non_nullable
as String?,total: null == total ? _self.total : total // ignore: cast_nullable_to_non_nullable
as int,voted: null == voted ? _self.voted : voted // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}


/// @nodoc
mixin _$TurnoutSummary {

@JsonKey(name: 'total_voters') int get totalVoters;@JsonKey(name: 'voted_count') int get votedCount;@JsonKey(name: 'turnout_percentage') double get turnoutPercentage;
/// Create a copy of TurnoutSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TurnoutSummaryCopyWith<TurnoutSummary> get copyWith => _$TurnoutSummaryCopyWithImpl<TurnoutSummary>(this as TurnoutSummary, _$identity);

  /// Serializes this TurnoutSummary to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TurnoutSummary&&(identical(other.totalVoters, totalVoters) || other.totalVoters == totalVoters)&&(identical(other.votedCount, votedCount) || other.votedCount == votedCount)&&(identical(other.turnoutPercentage, turnoutPercentage) || other.turnoutPercentage == turnoutPercentage));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,totalVoters,votedCount,turnoutPercentage);

@override
String toString() {
  return 'TurnoutSummary(totalVoters: $totalVoters, votedCount: $votedCount, turnoutPercentage: $turnoutPercentage)';
}


}

/// @nodoc
abstract mixin class $TurnoutSummaryCopyWith<$Res>  {
  factory $TurnoutSummaryCopyWith(TurnoutSummary value, $Res Function(TurnoutSummary) _then) = _$TurnoutSummaryCopyWithImpl;
@useResult
$Res call({
@JsonKey(name: 'total_voters') int totalVoters,@JsonKey(name: 'voted_count') int votedCount,@JsonKey(name: 'turnout_percentage') double turnoutPercentage
});




}
/// @nodoc
class _$TurnoutSummaryCopyWithImpl<$Res>
    implements $TurnoutSummaryCopyWith<$Res> {
  _$TurnoutSummaryCopyWithImpl(this._self, this._then);

  final TurnoutSummary _self;
  final $Res Function(TurnoutSummary) _then;

/// Create a copy of TurnoutSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? totalVoters = null,Object? votedCount = null,Object? turnoutPercentage = null,}) {
  return _then(_self.copyWith(
totalVoters: null == totalVoters ? _self.totalVoters : totalVoters // ignore: cast_nullable_to_non_nullable
as int,votedCount: null == votedCount ? _self.votedCount : votedCount // ignore: cast_nullable_to_non_nullable
as int,turnoutPercentage: null == turnoutPercentage ? _self.turnoutPercentage : turnoutPercentage // ignore: cast_nullable_to_non_nullable
as double,
  ));
}

}


/// Adds pattern-matching-related methods to [TurnoutSummary].
extension TurnoutSummaryPatterns on TurnoutSummary {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TurnoutSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TurnoutSummary() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TurnoutSummary value)  $default,){
final _that = this;
switch (_that) {
case _TurnoutSummary():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TurnoutSummary value)?  $default,){
final _that = this;
switch (_that) {
case _TurnoutSummary() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function(@JsonKey(name: 'total_voters')  int totalVoters, @JsonKey(name: 'voted_count')  int votedCount, @JsonKey(name: 'turnout_percentage')  double turnoutPercentage)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TurnoutSummary() when $default != null:
return $default(_that.totalVoters,_that.votedCount,_that.turnoutPercentage);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function(@JsonKey(name: 'total_voters')  int totalVoters, @JsonKey(name: 'voted_count')  int votedCount, @JsonKey(name: 'turnout_percentage')  double turnoutPercentage)  $default,) {final _that = this;
switch (_that) {
case _TurnoutSummary():
return $default(_that.totalVoters,_that.votedCount,_that.turnoutPercentage);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function(@JsonKey(name: 'total_voters')  int totalVoters, @JsonKey(name: 'voted_count')  int votedCount, @JsonKey(name: 'turnout_percentage')  double turnoutPercentage)?  $default,) {final _that = this;
switch (_that) {
case _TurnoutSummary() when $default != null:
return $default(_that.totalVoters,_that.votedCount,_that.turnoutPercentage);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _TurnoutSummary extends TurnoutSummary {
  const _TurnoutSummary({@JsonKey(name: 'total_voters') required this.totalVoters, @JsonKey(name: 'voted_count') required this.votedCount, @JsonKey(name: 'turnout_percentage') required this.turnoutPercentage}): super._();
  factory _TurnoutSummary.fromJson(Map<String, dynamic> json) => _$TurnoutSummaryFromJson(json);

@override@JsonKey(name: 'total_voters') final  int totalVoters;
@override@JsonKey(name: 'voted_count') final  int votedCount;
@override@JsonKey(name: 'turnout_percentage') final  double turnoutPercentage;

/// Create a copy of TurnoutSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TurnoutSummaryCopyWith<_TurnoutSummary> get copyWith => __$TurnoutSummaryCopyWithImpl<_TurnoutSummary>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$TurnoutSummaryToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _TurnoutSummary&&(identical(other.totalVoters, totalVoters) || other.totalVoters == totalVoters)&&(identical(other.votedCount, votedCount) || other.votedCount == votedCount)&&(identical(other.turnoutPercentage, turnoutPercentage) || other.turnoutPercentage == turnoutPercentage));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,totalVoters,votedCount,turnoutPercentage);

@override
String toString() {
  return 'TurnoutSummary(totalVoters: $totalVoters, votedCount: $votedCount, turnoutPercentage: $turnoutPercentage)';
}


}

/// @nodoc
abstract mixin class _$TurnoutSummaryCopyWith<$Res> implements $TurnoutSummaryCopyWith<$Res> {
  factory _$TurnoutSummaryCopyWith(_TurnoutSummary value, $Res Function(_TurnoutSummary) _then) = __$TurnoutSummaryCopyWithImpl;
@override @useResult
$Res call({
@JsonKey(name: 'total_voters') int totalVoters,@JsonKey(name: 'voted_count') int votedCount,@JsonKey(name: 'turnout_percentage') double turnoutPercentage
});




}
/// @nodoc
class __$TurnoutSummaryCopyWithImpl<$Res>
    implements _$TurnoutSummaryCopyWith<$Res> {
  __$TurnoutSummaryCopyWithImpl(this._self, this._then);

  final _TurnoutSummary _self;
  final $Res Function(_TurnoutSummary) _then;

/// Create a copy of TurnoutSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? totalVoters = null,Object? votedCount = null,Object? turnoutPercentage = null,}) {
  return _then(_TurnoutSummary(
totalVoters: null == totalVoters ? _self.totalVoters : totalVoters // ignore: cast_nullable_to_non_nullable
as int,votedCount: null == votedCount ? _self.votedCount : votedCount // ignore: cast_nullable_to_non_nullable
as int,turnoutPercentage: null == turnoutPercentage ? _self.turnoutPercentage : turnoutPercentage // ignore: cast_nullable_to_non_nullable
as double,
  ));
}


}


/// @nodoc
mixin _$ElectionTurnout {

 TurnoutSummary get summary;@JsonKey(name: 'class_breakdown') List<TurnoutBreakdown> get classBreakdown;@JsonKey(name: 'gender_breakdown') List<TurnoutBreakdown> get genderBreakdown;
/// Create a copy of ElectionTurnout
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ElectionTurnoutCopyWith<ElectionTurnout> get copyWith => _$ElectionTurnoutCopyWithImpl<ElectionTurnout>(this as ElectionTurnout, _$identity);

  /// Serializes this ElectionTurnout to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ElectionTurnout&&(identical(other.summary, summary) || other.summary == summary)&&const DeepCollectionEquality().equals(other.classBreakdown, classBreakdown)&&const DeepCollectionEquality().equals(other.genderBreakdown, genderBreakdown));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,summary,const DeepCollectionEquality().hash(classBreakdown),const DeepCollectionEquality().hash(genderBreakdown));

@override
String toString() {
  return 'ElectionTurnout(summary: $summary, classBreakdown: $classBreakdown, genderBreakdown: $genderBreakdown)';
}


}

/// @nodoc
abstract mixin class $ElectionTurnoutCopyWith<$Res>  {
  factory $ElectionTurnoutCopyWith(ElectionTurnout value, $Res Function(ElectionTurnout) _then) = _$ElectionTurnoutCopyWithImpl;
@useResult
$Res call({
 TurnoutSummary summary,@JsonKey(name: 'class_breakdown') List<TurnoutBreakdown> classBreakdown,@JsonKey(name: 'gender_breakdown') List<TurnoutBreakdown> genderBreakdown
});


$TurnoutSummaryCopyWith<$Res> get summary;

}
/// @nodoc
class _$ElectionTurnoutCopyWithImpl<$Res>
    implements $ElectionTurnoutCopyWith<$Res> {
  _$ElectionTurnoutCopyWithImpl(this._self, this._then);

  final ElectionTurnout _self;
  final $Res Function(ElectionTurnout) _then;

/// Create a copy of ElectionTurnout
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? summary = null,Object? classBreakdown = null,Object? genderBreakdown = null,}) {
  return _then(_self.copyWith(
summary: null == summary ? _self.summary : summary // ignore: cast_nullable_to_non_nullable
as TurnoutSummary,classBreakdown: null == classBreakdown ? _self.classBreakdown : classBreakdown // ignore: cast_nullable_to_non_nullable
as List<TurnoutBreakdown>,genderBreakdown: null == genderBreakdown ? _self.genderBreakdown : genderBreakdown // ignore: cast_nullable_to_non_nullable
as List<TurnoutBreakdown>,
  ));
}
/// Create a copy of ElectionTurnout
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TurnoutSummaryCopyWith<$Res> get summary {
  
  return $TurnoutSummaryCopyWith<$Res>(_self.summary, (value) {
    return _then(_self.copyWith(summary: value));
  });
}
}


/// Adds pattern-matching-related methods to [ElectionTurnout].
extension ElectionTurnoutPatterns on ElectionTurnout {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ElectionTurnout value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ElectionTurnout() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ElectionTurnout value)  $default,){
final _that = this;
switch (_that) {
case _ElectionTurnout():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ElectionTurnout value)?  $default,){
final _that = this;
switch (_that) {
case _ElectionTurnout() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( TurnoutSummary summary, @JsonKey(name: 'class_breakdown')  List<TurnoutBreakdown> classBreakdown, @JsonKey(name: 'gender_breakdown')  List<TurnoutBreakdown> genderBreakdown)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ElectionTurnout() when $default != null:
return $default(_that.summary,_that.classBreakdown,_that.genderBreakdown);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( TurnoutSummary summary, @JsonKey(name: 'class_breakdown')  List<TurnoutBreakdown> classBreakdown, @JsonKey(name: 'gender_breakdown')  List<TurnoutBreakdown> genderBreakdown)  $default,) {final _that = this;
switch (_that) {
case _ElectionTurnout():
return $default(_that.summary,_that.classBreakdown,_that.genderBreakdown);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( TurnoutSummary summary, @JsonKey(name: 'class_breakdown')  List<TurnoutBreakdown> classBreakdown, @JsonKey(name: 'gender_breakdown')  List<TurnoutBreakdown> genderBreakdown)?  $default,) {final _that = this;
switch (_that) {
case _ElectionTurnout() when $default != null:
return $default(_that.summary,_that.classBreakdown,_that.genderBreakdown);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _ElectionTurnout extends ElectionTurnout {
  const _ElectionTurnout({required this.summary, @JsonKey(name: 'class_breakdown') required final  List<TurnoutBreakdown> classBreakdown, @JsonKey(name: 'gender_breakdown') required final  List<TurnoutBreakdown> genderBreakdown}): _classBreakdown = classBreakdown,_genderBreakdown = genderBreakdown,super._();
  factory _ElectionTurnout.fromJson(Map<String, dynamic> json) => _$ElectionTurnoutFromJson(json);

@override final  TurnoutSummary summary;
 final  List<TurnoutBreakdown> _classBreakdown;
@override@JsonKey(name: 'class_breakdown') List<TurnoutBreakdown> get classBreakdown {
  if (_classBreakdown is EqualUnmodifiableListView) return _classBreakdown;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_classBreakdown);
}

 final  List<TurnoutBreakdown> _genderBreakdown;
@override@JsonKey(name: 'gender_breakdown') List<TurnoutBreakdown> get genderBreakdown {
  if (_genderBreakdown is EqualUnmodifiableListView) return _genderBreakdown;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_genderBreakdown);
}


/// Create a copy of ElectionTurnout
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ElectionTurnoutCopyWith<_ElectionTurnout> get copyWith => __$ElectionTurnoutCopyWithImpl<_ElectionTurnout>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$ElectionTurnoutToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _ElectionTurnout&&(identical(other.summary, summary) || other.summary == summary)&&const DeepCollectionEquality().equals(other._classBreakdown, _classBreakdown)&&const DeepCollectionEquality().equals(other._genderBreakdown, _genderBreakdown));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,summary,const DeepCollectionEquality().hash(_classBreakdown),const DeepCollectionEquality().hash(_genderBreakdown));

@override
String toString() {
  return 'ElectionTurnout(summary: $summary, classBreakdown: $classBreakdown, genderBreakdown: $genderBreakdown)';
}


}

/// @nodoc
abstract mixin class _$ElectionTurnoutCopyWith<$Res> implements $ElectionTurnoutCopyWith<$Res> {
  factory _$ElectionTurnoutCopyWith(_ElectionTurnout value, $Res Function(_ElectionTurnout) _then) = __$ElectionTurnoutCopyWithImpl;
@override @useResult
$Res call({
 TurnoutSummary summary,@JsonKey(name: 'class_breakdown') List<TurnoutBreakdown> classBreakdown,@JsonKey(name: 'gender_breakdown') List<TurnoutBreakdown> genderBreakdown
});


@override $TurnoutSummaryCopyWith<$Res> get summary;

}
/// @nodoc
class __$ElectionTurnoutCopyWithImpl<$Res>
    implements _$ElectionTurnoutCopyWith<$Res> {
  __$ElectionTurnoutCopyWithImpl(this._self, this._then);

  final _ElectionTurnout _self;
  final $Res Function(_ElectionTurnout) _then;

/// Create a copy of ElectionTurnout
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? summary = null,Object? classBreakdown = null,Object? genderBreakdown = null,}) {
  return _then(_ElectionTurnout(
summary: null == summary ? _self.summary : summary // ignore: cast_nullable_to_non_nullable
as TurnoutSummary,classBreakdown: null == classBreakdown ? _self._classBreakdown : classBreakdown // ignore: cast_nullable_to_non_nullable
as List<TurnoutBreakdown>,genderBreakdown: null == genderBreakdown ? _self._genderBreakdown : genderBreakdown // ignore: cast_nullable_to_non_nullable
as List<TurnoutBreakdown>,
  ));
}

/// Create a copy of ElectionTurnout
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TurnoutSummaryCopyWith<$Res> get summary {
  
  return $TurnoutSummaryCopyWith<$Res>(_self.summary, (value) {
    return _then(_self.copyWith(summary: value));
  });
}
}


/// @nodoc
mixin _$Voter {

 int get id;@JsonKey(name: 'admission_no') String get admissionNo; String get name; String get sex; String get className;@JsonKey(name: 'has_voted') bool? get hasVoted;@JsonKey(name: 'election_id') int? get electionId;
/// Create a copy of Voter
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$VoterCopyWith<Voter> get copyWith => _$VoterCopyWithImpl<Voter>(this as Voter, _$identity);

  /// Serializes this Voter to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Voter&&(identical(other.id, id) || other.id == id)&&(identical(other.admissionNo, admissionNo) || other.admissionNo == admissionNo)&&(identical(other.name, name) || other.name == name)&&(identical(other.sex, sex) || other.sex == sex)&&(identical(other.className, className) || other.className == className)&&(identical(other.hasVoted, hasVoted) || other.hasVoted == hasVoted)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,admissionNo,name,sex,className,hasVoted,electionId);

@override
String toString() {
  return 'Voter(id: $id, admissionNo: $admissionNo, name: $name, sex: $sex, className: $className, hasVoted: $hasVoted, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class $VoterCopyWith<$Res>  {
  factory $VoterCopyWith(Voter value, $Res Function(Voter) _then) = _$VoterCopyWithImpl;
@useResult
$Res call({
 int id,@JsonKey(name: 'admission_no') String admissionNo, String name, String sex, String className,@JsonKey(name: 'has_voted') bool? hasVoted,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class _$VoterCopyWithImpl<$Res>
    implements $VoterCopyWith<$Res> {
  _$VoterCopyWithImpl(this._self, this._then);

  final Voter _self;
  final $Res Function(Voter) _then;

/// Create a copy of Voter
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? admissionNo = null,Object? name = null,Object? sex = null,Object? className = null,Object? hasVoted = freezed,Object? electionId = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,admissionNo: null == admissionNo ? _self.admissionNo : admissionNo // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,sex: null == sex ? _self.sex : sex // ignore: cast_nullable_to_non_nullable
as String,className: null == className ? _self.className : className // ignore: cast_nullable_to_non_nullable
as String,hasVoted: freezed == hasVoted ? _self.hasVoted : hasVoted // ignore: cast_nullable_to_non_nullable
as bool?,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [Voter].
extension VoterPatterns on Voter {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Voter value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Voter() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Voter value)  $default,){
final _that = this;
switch (_that) {
case _Voter():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Voter value)?  $default,){
final _that = this;
switch (_that) {
case _Voter() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'admission_no')  String admissionNo,  String name,  String sex,  String className, @JsonKey(name: 'has_voted')  bool? hasVoted, @JsonKey(name: 'election_id')  int? electionId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Voter() when $default != null:
return $default(_that.id,_that.admissionNo,_that.name,_that.sex,_that.className,_that.hasVoted,_that.electionId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'admission_no')  String admissionNo,  String name,  String sex,  String className, @JsonKey(name: 'has_voted')  bool? hasVoted, @JsonKey(name: 'election_id')  int? electionId)  $default,) {final _that = this;
switch (_that) {
case _Voter():
return $default(_that.id,_that.admissionNo,_that.name,_that.sex,_that.className,_that.hasVoted,_that.electionId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id, @JsonKey(name: 'admission_no')  String admissionNo,  String name,  String sex,  String className, @JsonKey(name: 'has_voted')  bool? hasVoted, @JsonKey(name: 'election_id')  int? electionId)?  $default,) {final _that = this;
switch (_that) {
case _Voter() when $default != null:
return $default(_that.id,_that.admissionNo,_that.name,_that.sex,_that.className,_that.hasVoted,_that.electionId);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _Voter extends Voter {
  const _Voter({required this.id, @JsonKey(name: 'admission_no') required this.admissionNo, required this.name, required this.sex, required this.className, @JsonKey(name: 'has_voted') this.hasVoted, @JsonKey(name: 'election_id') this.electionId}): super._();
  factory _Voter.fromJson(Map<String, dynamic> json) => _$VoterFromJson(json);

@override final  int id;
@override@JsonKey(name: 'admission_no') final  String admissionNo;
@override final  String name;
@override final  String sex;
@override final  String className;
@override@JsonKey(name: 'has_voted') final  bool? hasVoted;
@override@JsonKey(name: 'election_id') final  int? electionId;

/// Create a copy of Voter
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$VoterCopyWith<_Voter> get copyWith => __$VoterCopyWithImpl<_Voter>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$VoterToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _Voter&&(identical(other.id, id) || other.id == id)&&(identical(other.admissionNo, admissionNo) || other.admissionNo == admissionNo)&&(identical(other.name, name) || other.name == name)&&(identical(other.sex, sex) || other.sex == sex)&&(identical(other.className, className) || other.className == className)&&(identical(other.hasVoted, hasVoted) || other.hasVoted == hasVoted)&&(identical(other.electionId, electionId) || other.electionId == electionId));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,admissionNo,name,sex,className,hasVoted,electionId);

@override
String toString() {
  return 'Voter(id: $id, admissionNo: $admissionNo, name: $name, sex: $sex, className: $className, hasVoted: $hasVoted, electionId: $electionId)';
}


}

/// @nodoc
abstract mixin class _$VoterCopyWith<$Res> implements $VoterCopyWith<$Res> {
  factory _$VoterCopyWith(_Voter value, $Res Function(_Voter) _then) = __$VoterCopyWithImpl;
@override @useResult
$Res call({
 int id,@JsonKey(name: 'admission_no') String admissionNo, String name, String sex, String className,@JsonKey(name: 'has_voted') bool? hasVoted,@JsonKey(name: 'election_id') int? electionId
});




}
/// @nodoc
class __$VoterCopyWithImpl<$Res>
    implements _$VoterCopyWith<$Res> {
  __$VoterCopyWithImpl(this._self, this._then);

  final _Voter _self;
  final $Res Function(_Voter) _then;

/// Create a copy of Voter
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? admissionNo = null,Object? name = null,Object? sex = null,Object? className = null,Object? hasVoted = freezed,Object? electionId = freezed,}) {
  return _then(_Voter(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,admissionNo: null == admissionNo ? _self.admissionNo : admissionNo // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,sex: null == sex ? _self.sex : sex // ignore: cast_nullable_to_non_nullable
as String,className: null == className ? _self.className : className // ignore: cast_nullable_to_non_nullable
as String,hasVoted: freezed == hasVoted ? _self.hasVoted : hasVoted // ignore: cast_nullable_to_non_nullable
as bool?,electionId: freezed == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}


/// @nodoc
mixin _$PollingBooth {

 int get id;@JsonKey(name: 'school_id') int get schoolId;@JsonKey(name: 'election_id') int get electionId;@JsonKey(name: 'booth_number') String get boothNumber; String get location; int? get capacity; String get status;@JsonKey(name: 'created_at') String? get createdAt;
/// Create a copy of PollingBooth
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PollingBoothCopyWith<PollingBooth> get copyWith => _$PollingBoothCopyWithImpl<PollingBooth>(this as PollingBooth, _$identity);

  /// Serializes this PollingBooth to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PollingBooth&&(identical(other.id, id) || other.id == id)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.electionId, electionId) || other.electionId == electionId)&&(identical(other.boothNumber, boothNumber) || other.boothNumber == boothNumber)&&(identical(other.location, location) || other.location == location)&&(identical(other.capacity, capacity) || other.capacity == capacity)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,schoolId,electionId,boothNumber,location,capacity,status,createdAt);

@override
String toString() {
  return 'PollingBooth(id: $id, schoolId: $schoolId, electionId: $electionId, boothNumber: $boothNumber, location: $location, capacity: $capacity, status: $status, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $PollingBoothCopyWith<$Res>  {
  factory $PollingBoothCopyWith(PollingBooth value, $Res Function(PollingBooth) _then) = _$PollingBoothCopyWithImpl;
@useResult
$Res call({
 int id,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'election_id') int electionId,@JsonKey(name: 'booth_number') String boothNumber, String location, int? capacity, String status,@JsonKey(name: 'created_at') String? createdAt
});




}
/// @nodoc
class _$PollingBoothCopyWithImpl<$Res>
    implements $PollingBoothCopyWith<$Res> {
  _$PollingBoothCopyWithImpl(this._self, this._then);

  final PollingBooth _self;
  final $Res Function(PollingBooth) _then;

/// Create a copy of PollingBooth
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? schoolId = null,Object? electionId = null,Object? boothNumber = null,Object? location = null,Object? capacity = freezed,Object? status = null,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,electionId: null == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int,boothNumber: null == boothNumber ? _self.boothNumber : boothNumber // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,capacity: freezed == capacity ? _self.capacity : capacity // ignore: cast_nullable_to_non_nullable
as int?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [PollingBooth].
extension PollingBoothPatterns on PollingBooth {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PollingBooth value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PollingBooth() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PollingBooth value)  $default,){
final _that = this;
switch (_that) {
case _PollingBooth():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PollingBooth value)?  $default,){
final _that = this;
switch (_that) {
case _PollingBooth() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'election_id')  int electionId, @JsonKey(name: 'booth_number')  String boothNumber,  String location,  int? capacity,  String status, @JsonKey(name: 'created_at')  String? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PollingBooth() when $default != null:
return $default(_that.id,_that.schoolId,_that.electionId,_that.boothNumber,_that.location,_that.capacity,_that.status,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'election_id')  int electionId, @JsonKey(name: 'booth_number')  String boothNumber,  String location,  int? capacity,  String status, @JsonKey(name: 'created_at')  String? createdAt)  $default,) {final _that = this;
switch (_that) {
case _PollingBooth():
return $default(_that.id,_that.schoolId,_that.electionId,_that.boothNumber,_that.location,_that.capacity,_that.status,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'election_id')  int electionId, @JsonKey(name: 'booth_number')  String boothNumber,  String location,  int? capacity,  String status, @JsonKey(name: 'created_at')  String? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _PollingBooth() when $default != null:
return $default(_that.id,_that.schoolId,_that.electionId,_that.boothNumber,_that.location,_that.capacity,_that.status,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _PollingBooth extends PollingBooth {
  const _PollingBooth({required this.id, @JsonKey(name: 'school_id') required this.schoolId, @JsonKey(name: 'election_id') required this.electionId, @JsonKey(name: 'booth_number') required this.boothNumber, required this.location, this.capacity, required this.status, @JsonKey(name: 'created_at') this.createdAt}): super._();
  factory _PollingBooth.fromJson(Map<String, dynamic> json) => _$PollingBoothFromJson(json);

@override final  int id;
@override@JsonKey(name: 'school_id') final  int schoolId;
@override@JsonKey(name: 'election_id') final  int electionId;
@override@JsonKey(name: 'booth_number') final  String boothNumber;
@override final  String location;
@override final  int? capacity;
@override final  String status;
@override@JsonKey(name: 'created_at') final  String? createdAt;

/// Create a copy of PollingBooth
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PollingBoothCopyWith<_PollingBooth> get copyWith => __$PollingBoothCopyWithImpl<_PollingBooth>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$PollingBoothToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _PollingBooth&&(identical(other.id, id) || other.id == id)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.electionId, electionId) || other.electionId == electionId)&&(identical(other.boothNumber, boothNumber) || other.boothNumber == boothNumber)&&(identical(other.location, location) || other.location == location)&&(identical(other.capacity, capacity) || other.capacity == capacity)&&(identical(other.status, status) || other.status == status)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,schoolId,electionId,boothNumber,location,capacity,status,createdAt);

@override
String toString() {
  return 'PollingBooth(id: $id, schoolId: $schoolId, electionId: $electionId, boothNumber: $boothNumber, location: $location, capacity: $capacity, status: $status, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$PollingBoothCopyWith<$Res> implements $PollingBoothCopyWith<$Res> {
  factory _$PollingBoothCopyWith(_PollingBooth value, $Res Function(_PollingBooth) _then) = __$PollingBoothCopyWithImpl;
@override @useResult
$Res call({
 int id,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'election_id') int electionId,@JsonKey(name: 'booth_number') String boothNumber, String location, int? capacity, String status,@JsonKey(name: 'created_at') String? createdAt
});




}
/// @nodoc
class __$PollingBoothCopyWithImpl<$Res>
    implements _$PollingBoothCopyWith<$Res> {
  __$PollingBoothCopyWithImpl(this._self, this._then);

  final _PollingBooth _self;
  final $Res Function(_PollingBooth) _then;

/// Create a copy of PollingBooth
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? schoolId = null,Object? electionId = null,Object? boothNumber = null,Object? location = null,Object? capacity = freezed,Object? status = null,Object? createdAt = freezed,}) {
  return _then(_PollingBooth(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,electionId: null == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int,boothNumber: null == boothNumber ? _self.boothNumber : boothNumber // ignore: cast_nullable_to_non_nullable
as String,location: null == location ? _self.location : location // ignore: cast_nullable_to_non_nullable
as String,capacity: freezed == capacity ? _self.capacity : capacity // ignore: cast_nullable_to_non_nullable
as int?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}


/// @nodoc
mixin _$VotingMachine {

 int get id;@JsonKey(name: 'school_id') int get schoolId;@JsonKey(name: 'election_id') int get electionId;@JsonKey(name: 'booth_id') int get boothId;@JsonKey(name: 'machine_name') String get machineName;@JsonKey(name: 'machine_code') String get machineCode;@JsonKey(name: 'machine_token') String? get machineToken; String get status;@JsonKey(name: 'current_voter_id') int? get currentVoterId;@JsonKey(name: 'created_at') String? get createdAt;
/// Create a copy of VotingMachine
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$VotingMachineCopyWith<VotingMachine> get copyWith => _$VotingMachineCopyWithImpl<VotingMachine>(this as VotingMachine, _$identity);

  /// Serializes this VotingMachine to a JSON map.
  Map<String, dynamic> toJson();


@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is VotingMachine&&(identical(other.id, id) || other.id == id)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.electionId, electionId) || other.electionId == electionId)&&(identical(other.boothId, boothId) || other.boothId == boothId)&&(identical(other.machineName, machineName) || other.machineName == machineName)&&(identical(other.machineCode, machineCode) || other.machineCode == machineCode)&&(identical(other.machineToken, machineToken) || other.machineToken == machineToken)&&(identical(other.status, status) || other.status == status)&&(identical(other.currentVoterId, currentVoterId) || other.currentVoterId == currentVoterId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,schoolId,electionId,boothId,machineName,machineCode,machineToken,status,currentVoterId,createdAt);

@override
String toString() {
  return 'VotingMachine(id: $id, schoolId: $schoolId, electionId: $electionId, boothId: $boothId, machineName: $machineName, machineCode: $machineCode, machineToken: $machineToken, status: $status, currentVoterId: $currentVoterId, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class $VotingMachineCopyWith<$Res>  {
  factory $VotingMachineCopyWith(VotingMachine value, $Res Function(VotingMachine) _then) = _$VotingMachineCopyWithImpl;
@useResult
$Res call({
 int id,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'election_id') int electionId,@JsonKey(name: 'booth_id') int boothId,@JsonKey(name: 'machine_name') String machineName,@JsonKey(name: 'machine_code') String machineCode,@JsonKey(name: 'machine_token') String? machineToken, String status,@JsonKey(name: 'current_voter_id') int? currentVoterId,@JsonKey(name: 'created_at') String? createdAt
});




}
/// @nodoc
class _$VotingMachineCopyWithImpl<$Res>
    implements $VotingMachineCopyWith<$Res> {
  _$VotingMachineCopyWithImpl(this._self, this._then);

  final VotingMachine _self;
  final $Res Function(VotingMachine) _then;

/// Create a copy of VotingMachine
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? schoolId = null,Object? electionId = null,Object? boothId = null,Object? machineName = null,Object? machineCode = null,Object? machineToken = freezed,Object? status = null,Object? currentVoterId = freezed,Object? createdAt = freezed,}) {
  return _then(_self.copyWith(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,electionId: null == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int,boothId: null == boothId ? _self.boothId : boothId // ignore: cast_nullable_to_non_nullable
as int,machineName: null == machineName ? _self.machineName : machineName // ignore: cast_nullable_to_non_nullable
as String,machineCode: null == machineCode ? _self.machineCode : machineCode // ignore: cast_nullable_to_non_nullable
as String,machineToken: freezed == machineToken ? _self.machineToken : machineToken // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,currentVoterId: freezed == currentVoterId ? _self.currentVoterId : currentVoterId // ignore: cast_nullable_to_non_nullable
as int?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [VotingMachine].
extension VotingMachinePatterns on VotingMachine {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _VotingMachine value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _VotingMachine() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _VotingMachine value)  $default,){
final _that = this;
switch (_that) {
case _VotingMachine():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _VotingMachine value)?  $default,){
final _that = this;
switch (_that) {
case _VotingMachine() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'election_id')  int electionId, @JsonKey(name: 'booth_id')  int boothId, @JsonKey(name: 'machine_name')  String machineName, @JsonKey(name: 'machine_code')  String machineCode, @JsonKey(name: 'machine_token')  String? machineToken,  String status, @JsonKey(name: 'current_voter_id')  int? currentVoterId, @JsonKey(name: 'created_at')  String? createdAt)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _VotingMachine() when $default != null:
return $default(_that.id,_that.schoolId,_that.electionId,_that.boothId,_that.machineName,_that.machineCode,_that.machineToken,_that.status,_that.currentVoterId,_that.createdAt);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int id, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'election_id')  int electionId, @JsonKey(name: 'booth_id')  int boothId, @JsonKey(name: 'machine_name')  String machineName, @JsonKey(name: 'machine_code')  String machineCode, @JsonKey(name: 'machine_token')  String? machineToken,  String status, @JsonKey(name: 'current_voter_id')  int? currentVoterId, @JsonKey(name: 'created_at')  String? createdAt)  $default,) {final _that = this;
switch (_that) {
case _VotingMachine():
return $default(_that.id,_that.schoolId,_that.electionId,_that.boothId,_that.machineName,_that.machineCode,_that.machineToken,_that.status,_that.currentVoterId,_that.createdAt);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int id, @JsonKey(name: 'school_id')  int schoolId, @JsonKey(name: 'election_id')  int electionId, @JsonKey(name: 'booth_id')  int boothId, @JsonKey(name: 'machine_name')  String machineName, @JsonKey(name: 'machine_code')  String machineCode, @JsonKey(name: 'machine_token')  String? machineToken,  String status, @JsonKey(name: 'current_voter_id')  int? currentVoterId, @JsonKey(name: 'created_at')  String? createdAt)?  $default,) {final _that = this;
switch (_that) {
case _VotingMachine() when $default != null:
return $default(_that.id,_that.schoolId,_that.electionId,_that.boothId,_that.machineName,_that.machineCode,_that.machineToken,_that.status,_that.currentVoterId,_that.createdAt);case _:
  return null;

}
}

}

/// @nodoc
@JsonSerializable()

class _VotingMachine extends VotingMachine {
  const _VotingMachine({required this.id, @JsonKey(name: 'school_id') required this.schoolId, @JsonKey(name: 'election_id') required this.electionId, @JsonKey(name: 'booth_id') required this.boothId, @JsonKey(name: 'machine_name') required this.machineName, @JsonKey(name: 'machine_code') required this.machineCode, @JsonKey(name: 'machine_token') this.machineToken, required this.status, @JsonKey(name: 'current_voter_id') this.currentVoterId, @JsonKey(name: 'created_at') this.createdAt}): super._();
  factory _VotingMachine.fromJson(Map<String, dynamic> json) => _$VotingMachineFromJson(json);

@override final  int id;
@override@JsonKey(name: 'school_id') final  int schoolId;
@override@JsonKey(name: 'election_id') final  int electionId;
@override@JsonKey(name: 'booth_id') final  int boothId;
@override@JsonKey(name: 'machine_name') final  String machineName;
@override@JsonKey(name: 'machine_code') final  String machineCode;
@override@JsonKey(name: 'machine_token') final  String? machineToken;
@override final  String status;
@override@JsonKey(name: 'current_voter_id') final  int? currentVoterId;
@override@JsonKey(name: 'created_at') final  String? createdAt;

/// Create a copy of VotingMachine
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$VotingMachineCopyWith<_VotingMachine> get copyWith => __$VotingMachineCopyWithImpl<_VotingMachine>(this, _$identity);

@override
Map<String, dynamic> toJson() {
  return _$VotingMachineToJson(this, );
}

@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is _VotingMachine&&(identical(other.id, id) || other.id == id)&&(identical(other.schoolId, schoolId) || other.schoolId == schoolId)&&(identical(other.electionId, electionId) || other.electionId == electionId)&&(identical(other.boothId, boothId) || other.boothId == boothId)&&(identical(other.machineName, machineName) || other.machineName == machineName)&&(identical(other.machineCode, machineCode) || other.machineCode == machineCode)&&(identical(other.machineToken, machineToken) || other.machineToken == machineToken)&&(identical(other.status, status) || other.status == status)&&(identical(other.currentVoterId, currentVoterId) || other.currentVoterId == currentVoterId)&&(identical(other.createdAt, createdAt) || other.createdAt == createdAt));
}

@JsonKey(includeFromJson: false, includeToJson: false)
@override
int get hashCode => Object.hash(runtimeType,id,schoolId,electionId,boothId,machineName,machineCode,machineToken,status,currentVoterId,createdAt);

@override
String toString() {
  return 'VotingMachine(id: $id, schoolId: $schoolId, electionId: $electionId, boothId: $boothId, machineName: $machineName, machineCode: $machineCode, machineToken: $machineToken, status: $status, currentVoterId: $currentVoterId, createdAt: $createdAt)';
}


}

/// @nodoc
abstract mixin class _$VotingMachineCopyWith<$Res> implements $VotingMachineCopyWith<$Res> {
  factory _$VotingMachineCopyWith(_VotingMachine value, $Res Function(_VotingMachine) _then) = __$VotingMachineCopyWithImpl;
@override @useResult
$Res call({
 int id,@JsonKey(name: 'school_id') int schoolId,@JsonKey(name: 'election_id') int electionId,@JsonKey(name: 'booth_id') int boothId,@JsonKey(name: 'machine_name') String machineName,@JsonKey(name: 'machine_code') String machineCode,@JsonKey(name: 'machine_token') String? machineToken, String status,@JsonKey(name: 'current_voter_id') int? currentVoterId,@JsonKey(name: 'created_at') String? createdAt
});




}
/// @nodoc
class __$VotingMachineCopyWithImpl<$Res>
    implements _$VotingMachineCopyWith<$Res> {
  __$VotingMachineCopyWithImpl(this._self, this._then);

  final _VotingMachine _self;
  final $Res Function(_VotingMachine) _then;

/// Create a copy of VotingMachine
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? schoolId = null,Object? electionId = null,Object? boothId = null,Object? machineName = null,Object? machineCode = null,Object? machineToken = freezed,Object? status = null,Object? currentVoterId = freezed,Object? createdAt = freezed,}) {
  return _then(_VotingMachine(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as int,schoolId: null == schoolId ? _self.schoolId : schoolId // ignore: cast_nullable_to_non_nullable
as int,electionId: null == electionId ? _self.electionId : electionId // ignore: cast_nullable_to_non_nullable
as int,boothId: null == boothId ? _self.boothId : boothId // ignore: cast_nullable_to_non_nullable
as int,machineName: null == machineName ? _self.machineName : machineName // ignore: cast_nullable_to_non_nullable
as String,machineCode: null == machineCode ? _self.machineCode : machineCode // ignore: cast_nullable_to_non_nullable
as String,machineToken: freezed == machineToken ? _self.machineToken : machineToken // ignore: cast_nullable_to_non_nullable
as String?,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as String,currentVoterId: freezed == currentVoterId ? _self.currentVoterId : currentVoterId // ignore: cast_nullable_to_non_nullable
as int?,createdAt: freezed == createdAt ? _self.createdAt : createdAt // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
