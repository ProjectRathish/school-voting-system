import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../elections/models/election_models.dart';
import '../../elections/providers/polling_booth_provider.dart';
import '../../elections/repository/polling_booth_repository.dart';
import '../../../core/utils/responsive.dart';
import '../../auth/providers/auth_provider.dart';

class BoothOperationsScreen extends ConsumerStatefulWidget {
  final int electionId;
  final int boothId;

  const BoothOperationsScreen({
    super.key,
    required this.electionId,
    required this.boothId,
  });

  @override
  ConsumerState<BoothOperationsScreen> createState() => _BoothOperationsScreenState();
}

class _BoothOperationsScreenState extends ConsumerState<BoothOperationsScreen> {
  final Map<int, TextEditingController> _controllers = {};
  final Map<int, bool> _loadingStates = {};

  @override
  void dispose() {
    for (var controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  TextEditingController _getController(int machineId) {
    return _controllers.putIfAbsent(machineId, () => TextEditingController());
  }

  Future<void> _handleAssign(int machineId) async {
    final admissionNo = _getController(machineId).text.trim();
    if (admissionNo.isEmpty) return;

    setState(() => _loadingStates[machineId] = true);
    try {
      await ref.read(pollingBoothRepositoryProvider).assignVoter(
            electionId: widget.electionId,
            boothId: widget.boothId,
            admissionNo: admissionNo,
            machineId: machineId,
          );
      
      if (mounted) {
        _getController(machineId).clear();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Voter assigned successfully!')),
        );
        ref.invalidate(votingMachinesProvider(widget.boothId));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _loadingStates[machineId] = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final machinesAsync = ref.watch(votingMachinesProvider(widget.boothId));

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Column(
          children: [
            const Text('Booth Control Center'),
            if (ref.watch(authProvider).value?.schoolName != null)
              Text(
                ref.watch(authProvider).value!.schoolName!,
                style: const TextStyle(fontSize: 10, color: Colors.white70),
              ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(votingMachinesProvider(widget.boothId)),
          ),
        ],
      ),
      body: machinesAsync.when(
        data: (machines) {
          if (machines.isEmpty) {
            return const Center(child: Text('Please register voting machines in this booth first.'));
          }

          final crossAxisCount = Responsive.isDesktop(context) ? 4 : (Responsive.isTablet(context) ? 2 : 1);

          return Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryHeader(machines),
                const SizedBox(height: 32),
                Expanded(
                  child: GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: crossAxisCount,
                      crossAxisSpacing: 24,
                      mainAxisSpacing: 24,
                      childAspectRatio: 0.75,
                    ),
                    itemCount: machines.length,
                    itemBuilder: (context, index) => _buildEVMUnit(machines[index]),
                  ),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      bottomNavigationBar: ref.watch(authProvider).value?.schoolName != null
          ? Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              color: Colors.white,
              child: Text(
                'School-Specific Instance: ${ref.watch(authProvider).value!.schoolName!}',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 9, color: Colors.grey.shade400, fontWeight: FontWeight.bold),
              ),
            )
          : null,
    );
  }

  Widget _buildSummaryHeader(List<VotingMachine> machines) {
    final freeCount = machines.where((m) => m.status == 'FREE').length;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildSummaryItem('Total Terminals', '${machines.length}', Icons.terminal),
          const VerticalDivider(width: 40),
          _buildSummaryItem('Available', '$freeCount', Icons.check_circle, color: Colors.green),
          const VerticalDivider(width: 40),
          _buildSummaryItem('Occupied', '${machines.length - freeCount}', Icons.person, color: Colors.orange),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon, {Color? color}) {
    return Row(
      children: [
        Icon(icon, color: color ?? Colors.blue, size: 28),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
      ],
    );
  }

  Widget _buildEVMUnit(VotingMachine machine) {
    final isFree = machine.status == 'FREE';
    final isLoading = _loadingStates[machine.id] ?? false;

    return Card(
      elevation: isFree ? 6 : 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      color: isFree ? Colors.white : Colors.grey.shade100,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isFree ? Colors.blue.withOpacity(0.3) : Colors.transparent,
            width: 2,
          ),
        ),
        child: Column(
          children: [
            // Top part: EVM Graphic representation
            Expanded(
              flex: 4,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Stylized EVM Body
                  Container(
                    margin: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [BoxShadow(color: Colors.black26, offset: Offset(0, 4), blurRadius: 4)],
                    ),
                  ),
                  // "Screen" Area
                  Container(
                    margin: const EdgeInsets.all(35),
                    decoration: BoxDecoration(
                      color: isFree ? Colors.blue.shade900 : Colors.orange.shade900,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isFree ? Icons.how_to_reg : Icons.person,
                            color: Colors.white,
                            size: 40,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            isFree ? 'FREE' : 'BUSY',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Bottom part: Controls
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    machine.machineName,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  if (isFree) ...[
                    TextField(
                      controller: _getController(machine.id),
                      textAlign: TextAlign.center,
                      decoration: InputDecoration(
                        hintText: 'Admission No',
                        contentPadding: const EdgeInsets.symmetric(vertical: 0),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                        filled: true,
                        fillColor: Colors.white,
                      ),
                      onSubmitted: (_) => _handleAssign(machine.id),
                    ),
                    const SizedBox(height: 12),
                    FilledButton(
                      onPressed: isLoading ? null : () => _handleAssign(machine.id),
                      style: FilledButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: isLoading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('ACTIVATE MACHINE'),
                    ),
                  ] else ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.orange.withOpacity(0.3)),
                      ),
                      child: const Column(
                        children: [
                          Text('Voter at Station', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                          Text('Awaiting casting...', style: TextStyle(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
