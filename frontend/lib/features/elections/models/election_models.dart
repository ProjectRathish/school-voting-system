import 'package:freezed_annotation/freezed_annotation.dart';

part 'election_models.freezed.dart';
part 'election_models.g.dart';

enum ElectionStatus {
  @JsonValue('DRAFT')
  draft,
  @JsonValue('CONFIGURING')
  configuring,
  @JsonValue('READY')
  ready,
  @JsonValue('ACTIVE')
  active,
  @JsonValue('PAUSED')
  paused,
  @JsonValue('CLOSED')
  closed,
}

@freezed
abstract class Election with _$Election {
  const factory Election({
    required int id,
    @JsonKey(name: 'school_id') required int schoolId,
    required String name,
    @JsonKey(name: 'start_time') String? startTime,
    @JsonKey(name: 'end_time') String? endTime,
    required ElectionStatus status,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'created_by') required int createdBy,
  }) = _Election;

  const Election._();

  factory Election.fromJson(Map<String, dynamic> json) => _$ElectionFromJson(json);
}

@freezed
abstract class Post with _$Post {
  const factory Post({
    required int id,
    required String name,
    @JsonKey(name: 'gender_rule') required String genderRule,
    @JsonKey(name: 'candidate_classes') required List<int> candidateClasses,
    @JsonKey(name: 'voting_classes') required List<int> votingClasses,
    @JsonKey(name: 'election_id') int? electionId,
  }) = _Post;

  const Post._();

  factory Post.fromJson(Map<String, dynamic> json) => _$PostFromJson(json);
}

@freezed
abstract class Candidate with _$Candidate {
  const factory Candidate({
    @JsonKey(name: 'candidate_id') required int id,
    @JsonKey(name: 'admission_no') required String admissionNo,
    required String name,
    required String gender,
    @JsonKey(name: 'class') required String className,
    required String post,
    String? photo,
    String? symbol,
    @JsonKey(name: 'election_id') int? electionId,
  }) = _Candidate;

  const Candidate._();

  factory Candidate.fromJson(Map<String, dynamic> json) => _$CandidateFromJson(json);
}

@freezed
abstract class SchoolClass with _$SchoolClass {
  const factory SchoolClass({
    required int id,
    required String name,
    @JsonKey(name: 'section_name') required String sectionName,
    @JsonKey(name: 'election_id') int? electionId,
  }) = _SchoolClass;

  const SchoolClass._();

  factory SchoolClass.fromJson(Map<String, dynamic> json) => _$SchoolClassFromJson(json);
}

@freezed
abstract class TurnoutBreakdown with _$TurnoutBreakdown {
  const factory TurnoutBreakdown({
    @JsonKey(name: 'class_name') String? className,
    String? sex,
    required int total,
    required int voted,
  }) = _TurnoutBreakdown;

  const TurnoutBreakdown._();

  factory TurnoutBreakdown.fromJson(Map<String, dynamic> json) => _$TurnoutBreakdownFromJson(json);
}

@freezed
abstract class TurnoutSummary with _$TurnoutSummary {
  const factory TurnoutSummary({
    @JsonKey(name: 'total_voters') required int totalVoters,
    @JsonKey(name: 'voted_count') required int votedCount,
    @JsonKey(name: 'turnout_percentage') required double turnoutPercentage,
  }) = _TurnoutSummary;

  const TurnoutSummary._();

  factory TurnoutSummary.fromJson(Map<String, dynamic> json) => _$TurnoutSummaryFromJson(json);
}

@freezed
abstract class ElectionTurnout with _$ElectionTurnout {
  const factory ElectionTurnout({
    required TurnoutSummary summary,
    @JsonKey(name: 'class_breakdown') required List<TurnoutBreakdown> classBreakdown,
    @JsonKey(name: 'gender_breakdown') required List<TurnoutBreakdown> genderBreakdown,
  }) = _ElectionTurnout;

  const ElectionTurnout._();

  factory ElectionTurnout.fromJson(Map<String, dynamic> json) => _$ElectionTurnoutFromJson(json);
}

@freezed
abstract class Voter with _$Voter {
  const factory Voter({
    required int id,
    @JsonKey(name: 'admission_no') required String admissionNo,
    required String name,
    required String sex,
    required String className,
    @JsonKey(name: 'has_voted') bool? hasVoted,
    @JsonKey(name: 'election_id') int? electionId,
  }) = _Voter;

  const Voter._();

  factory Voter.fromJson(Map<String, dynamic> json) => _$VoterFromJson(json);
}

@freezed
abstract class PollingBooth with _$PollingBooth {
  const factory PollingBooth({
    required int id,
    @JsonKey(name: 'school_id') required int schoolId,
    @JsonKey(name: 'election_id') required int electionId,
    @JsonKey(name: 'booth_number') required String boothNumber,
    required String location,
    int? capacity,
    required String status,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _PollingBooth;

  const PollingBooth._();

  factory PollingBooth.fromJson(Map<String, dynamic> json) => _$PollingBoothFromJson(json);
}

@freezed
abstract class VotingMachine with _$VotingMachine {
  const factory VotingMachine({
    required int id,
    @JsonKey(name: 'school_id') required int schoolId,
    @JsonKey(name: 'election_id') required int electionId,
    @JsonKey(name: 'booth_id') required int boothId,
    @JsonKey(name: 'machine_name') required String machineName,
    @JsonKey(name: 'machine_code') required String machineCode,
    @JsonKey(name: 'machine_token') String? machineToken,
    required String status,
    @JsonKey(name: 'current_voter_id') int? currentVoterId,
    @JsonKey(name: 'created_at') String? createdAt,
  }) = _VotingMachine;

  const VotingMachine._();

  factory VotingMachine.fromJson(Map<String, dynamic> json) => _$VotingMachineFromJson(json);
}
