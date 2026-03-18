import 'package:flutter/material.dart';
import '../../../core/utils/responsive.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/election_models.dart';
import '../providers/polling_booth_provider.dart';

class PollingBoothsScreen extends ConsumerWidget {
  final int electionId;

  const PollingBoothsScreen({super.key, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final boothsAsync = ref.watch(pollingBoothsProvider(electionId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Polling Booths'),
      ),
      body: boothsAsync.when(
        data: (booths) {
          if (booths.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.room_outlined, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No polling booths configured.'),
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
                      itemCount: booths.length,
                      itemBuilder: (context, index) => _buildBoothCard(context, ref, booths[index]),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(24),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 24,
                        mainAxisSpacing: 24,
                        childAspectRatio: 2.5,
                      ),
                      itemCount: booths.length,
                      itemBuilder: (context, index) => _buildBoothCard(context, ref, booths[index]),
                    ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddBoothDialog(context, ref),
        label: const Text('Add Booth'),
        icon: const Icon(Icons.add_location_alt),
      ),
    );
  }

  Widget _buildBoothCard(BuildContext context, WidgetRef ref, PollingBooth booth) {
    return Card(
      margin: Responsive.isMobile(context) ? const EdgeInsets.symmetric(horizontal: 16, vertical: 8) : EdgeInsets.zero,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue.shade100,
          child: Text(booth.boothNumber),
        ),
        title: Text('Location: ${booth.location}'),
        subtitle: Text('Capacity: ${booth.capacity ?? "Unlimited"} | Status: ${booth.status}'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: const Icon(Icons.play_circle_outline, color: Colors.green),
              tooltip: 'Launch Operator Mode',
              onPressed: () => context.push('/elections/$electionId/booths/${booth.id}/operations'),
            ),
            IconButton(
              icon: const Icon(Icons.computer),
              tooltip: 'Manage Machines',
              onPressed: () => context.push('/elections/$electionId/booths/${booth.id}/machines'),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.red),
              onPressed: () => _confirmDelete(context, ref, booth),
            ),
          ],
        ),
        onTap: () => context.push('/elections/$electionId/booths/${booth.id}/machines'),
      ),
    );
  }

  void _showAddBoothDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => _AddBoothDialog(electionId: electionId),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, PollingBooth booth) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Booth?'),
        content: Text('Are you sure you want to delete Booth ${booth.boothNumber}? This will also delete all associated voting machines.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              await ref.read(pollingBoothsProvider(electionId).notifier).deleteBooth(booth.id);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}

class _AddBoothDialog extends StatefulWidget {
  final int electionId;

  const _AddBoothDialog({required this.electionId});

  @override
  State<_AddBoothDialog> createState() => _AddBoothDialogState();
}

class _AddBoothDialogState extends State<_AddBoothDialog> {
  final _formKey = GlobalKey<FormState>();
  final _numberController = TextEditingController();
  final _locationController = TextEditingController();
  final _capacityController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Create Polling Booth'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _numberController,
              decoration: const InputDecoration(labelText: 'Booth Number (e.g. 1 or A)'),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            TextFormField(
              controller: _locationController,
              decoration: const InputDecoration(labelText: 'Location (e.g. Computer Lab)'),
              validator: (v) => v!.isEmpty ? 'Required' : null,
            ),
            TextFormField(
              controller: _capacityController,
              decoration: const InputDecoration(labelText: 'Capacity (Optional)'),
              keyboardType: TextInputType.number,
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
                : const Text('Create'),
          ),
        ),
      ],
    );
  }

  Future<void> _handleCreate(WidgetRef ref) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(pollingBoothsProvider(widget.electionId).notifier).createBooth(
            boothNumber: _numberController.text.trim(),
            location: _locationController.text.trim(),
            capacity: int.tryParse(_capacityController.text),
          );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}
