import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../models/election_models.dart';
import '../repository/polling_booth_repository.dart';

part 'polling_booth_provider.g.dart';

@riverpod
class PollingBooths extends _$PollingBooths {
  @override
  FutureOr<List<PollingBooth>> build(int electionId) async {
    return await ref.watch(pollingBoothRepositoryProvider).getPollingBooths(electionId);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(pollingBoothRepositoryProvider).getPollingBooths(electionId),
    );
  }

  Future<void> createBooth({
    required String boothNumber,
    required String location,
    int? capacity,
  }) async {
    await ref.read(pollingBoothRepositoryProvider).createPollingBooth(
      electionId: electionId,
      boothNumber: boothNumber,
      location: location,
      capacity: capacity,
    );
    await refresh();
  }

  Future<void> deleteBooth(int boothId) async {
    await ref.read(pollingBoothRepositoryProvider).deletePollingBooth(boothId);
    await refresh();
  }
}

@riverpod
class VotingMachines extends _$VotingMachines {
  @override
  FutureOr<List<VotingMachine>> build(int boothId) async {
    return await ref.watch(pollingBoothRepositoryProvider).getMachinesInBooth(boothId);
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(
      () => ref.read(pollingBoothRepositoryProvider).getMachinesInBooth(boothId),
    );
  }

  Future<Map<String, dynamic>> addMachine({
    required int electionId,
    required String machineName,
  }) async {
    final result = await ref.read(pollingBoothRepositoryProvider).registerMachine(
      electionId: electionId,
      boothId: boothId,
      machineName: machineName,
    );
    await refresh();
    return result;
  }

  Future<void> removeMachine(int machineId) async {
    await ref.read(pollingBoothRepositoryProvider).deleteMachine(machineId);
    await refresh();
  }
}
