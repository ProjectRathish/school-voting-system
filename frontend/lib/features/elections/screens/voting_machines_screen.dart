import 'package:flutter/material.dart';
import '../../../core/utils/responsive.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/election_models.dart';
import '../providers/polling_booth_provider.dart';

class VotingMachinesScreen extends ConsumerWidget {
  final int electionId;
  final int boothId;

  const VotingMachinesScreen({
    super.key,
    required this.electionId,
    required this.boothId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final machinesAsync = ref.watch(votingMachinesProvider(boothId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Voting Machines'),
      ),
      body: machinesAsync.when(
        data: (machines) {
          if (machines.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.computer_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No voting machines in this booth.'),
                ],
              ),
            );
          }
          final isMobile = Responsive.isMobile(context);
          final crossAxisCount = Responsive.isDesktop(context) ? 3 : (Responsive.isTablet(context) ? 2 : 1);

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1200),
              child: isMobile
                  ? ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: machines.length,
                      itemBuilder: (context, index) => _buildMachineCard(context, ref, machines[index]),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(24),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 24,
                        mainAxisSpacing: 24,
                        childAspectRatio: 2.2,
                      ),
                      itemCount: machines.length,
                      itemBuilder: (context, index) => _buildMachineCard(context, ref, machines[index]),
                    ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddMachineDialog(context, ref),
        label: const Text('Add Machine'),
        icon: const Icon(Icons.add_to_queue),
      ),
    );
  }

  Widget _buildMachineCard(BuildContext context, WidgetRef ref, VotingMachine machine) {
    return Card(
      margin: Responsive.isMobile(context) ? const EdgeInsets.symmetric(horizontal: 16, vertical: 8) : EdgeInsets.zero,
      child: ListTile(
        leading: Icon(
          Icons.terminal,
          color: machine.status == 'FREE' ? Colors.green : Colors.orange,
        ),
        title: Text(machine.machineName),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Code: ${machine.machineCode}'),
            Text('Status: ${machine.status}'),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.key),
              tooltip: 'View Token',
              onPressed: () => _showTokenDialog(context, machine),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: () => _confirmDelete(context, ref, machine),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddMachineDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => _AddMachineDialog(electionId: electionId, boothId: boothId),
    );
  }

  void _showTokenDialog(BuildContext context, VotingMachine machine) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Machine: ${machine.machineName}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Machine Code:', style: TextStyle(fontWeight: FontWeight.bold)),
            SelectableText(machine.machineCode),
            const SizedBox(height: 16),
            const Text('Note:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.orange)),
            const Text('Tokens are sensitive and only shown during registration or via secure admin access.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: machine.machineCode));
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Code copied to clipboard')));
              Navigator.pop(context);
            },
            child: const Text('Copy Code'),
          ),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, VotingMachine machine) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Machine?'),
        content: Text('Are you sure you want to remove ${machine.machineName}? Any active sessions will be terminated.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              await ref.read(votingMachinesProvider(boothId).notifier).removeMachine(machine.id);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Remove', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _AddMachineDialog extends StatefulWidget {
  final int electionId;
  final int boothId;

  const _AddMachineDialog({required this.electionId, required this.boothId});

  @override
  State<_AddMachineDialog> createState() => _AddMachineDialogState();
}

class _AddMachineDialogState extends State<_AddMachineDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Register Voting Machine'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Machine Name (e.g. PC-01)',
                helperText: 'A unique name for this terminal.',
              ),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        Consumer(
          builder: (context, ref, child) => FilledButton(
            onPressed: _isLoading ? null : () => _handleCreate(ref),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Register'),
          ),
        ),
      ],
    );
  }

  Future<void> _handleCreate(WidgetRef ref) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      final result = await ref.read(votingMachinesProvider(widget.boothId).notifier).addMachine(
            electionId: widget.electionId,
            machineName: _nameController.text.trim(),
          );
      
      if (mounted) {
        Navigator.pop(context);
        _showSuccessDialog(result);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSuccessDialog(Map<String, dynamic> result) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Machine Registered!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('IMPORTANT: Save this token. It is required to authorize the terminal as a voting machine:'),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: SelectableText(
                result['machine_token'],
                style: const TextStyle(fontFamily: 'Courier', fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            Text('Machine Code: ${result['machine_code']}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Clipboard.setData(ClipboardData(text: result['machine_token']));
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Token copied')));
            },
            child: const Text('Copy Token'),
          ),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Done')),
        ],
      ),
    );
  }
}
