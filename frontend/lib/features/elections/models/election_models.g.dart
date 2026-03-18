// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'election_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Election _$ElectionFromJson(Map<String, dynamic> json) => _Election(
  id: (json['id'] as num).toInt(),
  schoolId: (json['school_id'] as num).toInt(),
  name: json['name'] as String,
  startTime: json['start_time'] as String?,
  endTime: json['end_time'] as String?,
  status: $enumDecode(_$ElectionStatusEnumMap, json['status']),
  createdAt: json['created_at'] as String,
  createdBy: (json['created_by'] as num).toInt(),
);

Map<String, dynamic> _$ElectionToJson(_Election instance) => <String, dynamic>{
  'id': instance.id,
  'school_id': instance.schoolId,
  'name': instance.name,
  'start_time': instance.startTime,
  'end_time': instance.endTime,
  'status': _$ElectionStatusEnumMap[instance.status]!,
  'created_at': instance.createdAt,
  'created_by': instance.createdBy,
};

const _$ElectionStatusEnumMap = {
  ElectionStatus.draft: 'DRAFT',
  ElectionStatus.configuring: 'CONFIGURING',
  ElectionStatus.ready: 'READY',
  ElectionStatus.active: 'ACTIVE',
  ElectionStatus.paused: 'PAUSED',
  ElectionStatus.closed: 'CLOSED',
};

_Post _$PostFromJson(Map<String, dynamic> json) => _Post(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  genderRule: json['gender_rule'] as String,
  candidateClasses: (json['candidate_classes'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
  votingClasses: (json['voting_classes'] as List<dynamic>)
      .map((e) => (e as num).toInt())
      .toList(),
  electionId: (json['election_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$PostToJson(_Post instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'gender_rule': instance.genderRule,
  'candidate_classes': instance.candidateClasses,
  'voting_classes': instance.votingClasses,
  'election_id': instance.electionId,
};

_Candidate _$CandidateFromJson(Map<String, dynamic> json) => _Candidate(
  id: (json['candidate_id'] as num).toInt(),
  admissionNo: json['admission_no'] as String,
  name: json['name'] as String,
  gender: json['gender'] as String,
  className: json['class'] as String,
  post: json['post'] as String,
  photo: json['photo'] as String?,
  symbol: json['symbol'] as String?,
  electionId: (json['election_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$CandidateToJson(_Candidate instance) =>
    <String, dynamic>{
      'candidate_id': instance.id,
      'admission_no': instance.admissionNo,
      'name': instance.name,
      'gender': instance.gender,
      'class': instance.className,
      'post': instance.post,
      'photo': instance.photo,
      'symbol': instance.symbol,
      'election_id': instance.electionId,
    };

_SchoolClass _$SchoolClassFromJson(Map<String, dynamic> json) => _SchoolClass(
  id: (json['id'] as num).toInt(),
  name: json['name'] as String,
  sectionName: json['section_name'] as String,
  electionId: (json['election_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$SchoolClassToJson(_SchoolClass instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'section_name': instance.sectionName,
      'election_id': instance.electionId,
    };

_TurnoutBreakdown _$TurnoutBreakdownFromJson(Map<String, dynamic> json) =>
    _TurnoutBreakdown(
      className: json['class_name'] as String?,
      sex: json['sex'] as String?,
      total: (json['total'] as num).toInt(),
      voted: (json['voted'] as num).toInt(),
    );

Map<String, dynamic> _$TurnoutBreakdownToJson(_TurnoutBreakdown instance) =>
    <String, dynamic>{
      'class_name': instance.className,
      'sex': instance.sex,
      'total': instance.total,
      'voted': instance.voted,
    };

_TurnoutSummary _$TurnoutSummaryFromJson(Map<String, dynamic> json) =>
    _TurnoutSummary(
      totalVoters: (json['total_voters'] as num).toInt(),
      votedCount: (json['voted_count'] as num).toInt(),
      turnoutPercentage: (json['turnout_percentage'] as num).toDouble(),
    );

Map<String, dynamic> _$TurnoutSummaryToJson(_TurnoutSummary instance) =>
    <String, dynamic>{
      'total_voters': instance.totalVoters,
      'voted_count': instance.votedCount,
      'turnout_percentage': instance.turnoutPercentage,
    };

_ElectionTurnout _$ElectionTurnoutFromJson(Map<String, dynamic> json) =>
    _ElectionTurnout(
      summary: TurnoutSummary.fromJson(json['summary'] as Map<String, dynamic>),
      classBreakdown: (json['class_breakdown'] as List<dynamic>)
          .map((e) => TurnoutBreakdown.fromJson(e as Map<String, dynamic>))
          .toList(),
      genderBreakdown: (json['gender_breakdown'] as List<dynamic>)
          .map((e) => TurnoutBreakdown.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$ElectionTurnoutToJson(_ElectionTurnout instance) =>
    <String, dynamic>{
      'summary': instance.summary,
      'class_breakdown': instance.classBreakdown,
      'gender_breakdown': instance.genderBreakdown,
    };

_Voter _$VoterFromJson(Map<String, dynamic> json) => _Voter(
  id: (json['id'] as num).toInt(),
  admissionNo: json['admission_no'] as String,
  name: json['name'] as String,
  sex: json['sex'] as String,
  className: json['className'] as String,
  hasVoted: json['has_voted'] as bool?,
  electionId: (json['election_id'] as num?)?.toInt(),
);

Map<String, dynamic> _$VoterToJson(_Voter instance) => <String, dynamic>{
  'id': instance.id,
  'admission_no': instance.admissionNo,
  'name': instance.name,
  'sex': instance.sex,
  'className': instance.className,
  'has_voted': instance.hasVoted,
  'election_id': instance.electionId,
};

_PollingBooth _$PollingBoothFromJson(Map<String, dynamic> json) =>
    _PollingBooth(
      id: (json['id'] as num).toInt(),
      schoolId: (json['school_id'] as num).toInt(),
      electionId: (json['election_id'] as num).toInt(),
      boothNumber: json['booth_number'] as String,
      location: json['location'] as String,
      capacity: (json['capacity'] as num?)?.toInt(),
      status: json['status'] as String,
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$PollingBoothToJson(_PollingBooth instance) =>
    <String, dynamic>{
      'id': instance.id,
      'school_id': instance.schoolId,
      'election_id': instance.electionId,
      'booth_number': instance.boothNumber,
      'location': instance.location,
      'capacity': instance.capacity,
      'status': instance.status,
      'created_at': instance.createdAt,
    };

_VotingMachine _$VotingMachineFromJson(Map<String, dynamic> json) =>
    _VotingMachine(
      id: (json['id'] as num).toInt(),
      schoolId: (json['school_id'] as num).toInt(),
      electionId: (json['election_id'] as num).toInt(),
      boothId: (json['booth_id'] as num).toInt(),
      machineName: json['machine_name'] as String,
      machineCode: json['machine_code'] as String,
      machineToken: json['machine_token'] as String?,
      status: json['status'] as String,
      currentVoterId: (json['current_voter_id'] as num?)?.toInt(),
      createdAt: json['created_at'] as String?,
    );

Map<String, dynamic> _$VotingMachineToJson(_VotingMachine instance) =>
    <String, dynamic>{
      'id': instance.id,
      'school_id': instance.schoolId,
      'election_id': instance.electionId,
      'booth_id': instance.boothId,
      'machine_name': instance.machineName,
      'machine_code': instance.machineCode,
      'machine_token': instance.machineToken,
      'status': instance.status,
      'current_voter_id': instance.currentVoterId,
      'created_at': instance.createdAt,
    };
