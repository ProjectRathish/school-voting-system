import 'package:flutter/material.dart';
import '../../../core/utils/responsive.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/election_models.dart';
import '../providers/voter_provider.dart';
import '../repository/voter_repository.dart';

class VotersScreen extends ConsumerWidget {
  final int electionId;

  const VotersScreen({super.key, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final votersAsync = ref.watch(votersProvider(electionId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Voters'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            tooltip: 'Download Template',
            onPressed: () => _downloadTemplate(ref),
          ),
          IconButton(
            icon: const Icon(Icons.upload_file),
            tooltip: 'Bulk Upload',
            onPressed: () => _handleBulkUpload(context, ref),
          ),
        ],
      ),
      body: votersAsync.when(
        data: (voters) {
          if (voters.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.people_outline, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No voters added yet.'),
                ],
              ),
            );
          }
          final isMobile = Responsive.isMobile(context);
          final crossAxisCount = Responsive.isDesktop(context) ? 4 : (Responsive.isTablet(context) ? 2 : 1);

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1400),
              child: isMobile
                  ? ListView.separated(
                      itemCount: voters.length,
                      separatorBuilder: (context, index) => const Divider(height: 1),
                      itemBuilder: (context, index) => _buildVoterTile(voters[index]),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(24),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 3,
                      ),
                      itemCount: voters.length,
                      itemBuilder: (context, index) => Card(
                        child: _buildVoterTile(voters[index]),
                      ),
                    ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddVoterDialog(context, ref),
        child: const Icon(Icons.person_add),
      ),
    );
  }

  Widget _buildVoterTile(Voter voter) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: voter.sex == 'M' ? Colors.blue.shade100 : Colors.pink.shade100,
        child: Text(voter.name[0], style: TextStyle(color: voter.sex == 'M' ? Colors.blue : Colors.pink)),
      ),
      title: Text(voter.name),
      subtitle: Text('${voter.className} | Admn: ${voter.admissionNo}'),
      trailing: voter.hasVoted == true
          ? const Icon(Icons.check_circle, color: Colors.green)
          : const Icon(Icons.pending_outlined, color: Colors.orange),
    );
  }

  Future<void> _downloadTemplate(WidgetRef ref) async {
    final url = ref.read(voterRepositoryProvider).getTemplateUrl();
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  Future<void> _handleBulkUpload(BuildContext context, WidgetRef ref) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['xlsx', 'xls'],
    );

    if (result != null && result.files.single.bytes != null) {
      try {
        await ref.read(votersProvider(electionId).notifier).uploadVoters(
              result.files.single.bytes!.toList(),
              result.files.single.name,
            );
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Voters uploaded successfully')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Upload failed: $e')),
          );
        }
      }
    }
  }

  void _showAddVoterDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => _AddVoterDialog(electionId: electionId),
    );
  }
}

class _AddVoterDialog extends StatefulWidget {
  final int electionId;

  const _AddVoterDialog({required this.electionId});

  @override
  State<_AddVoterDialog> createState() => _AddVoterDialogState();
}

class _AddVoterDialogState extends State<_AddVoterDialog> {
  final _formKey = GlobalKey<FormState>();
  final _admissionController = TextEditingController();
  final _nameController = TextEditingController();
  final _classController = TextEditingController();
  String _sex = 'M';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Single Voter'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _admissionController,
                decoration: const InputDecoration(labelText: 'Admission No'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              TextFormField(
                controller: _classController,
                decoration: const InputDecoration(labelText: 'Class (e.g. 10-A)'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _sex,
                decoration: const InputDecoration(labelText: 'Sex'),
                items: const [
                  DropdownMenuItem(value: 'M', child: Text('Male')),
                  DropdownMenuItem(value: 'F', child: Text('Female')),
                  DropdownMenuItem(value: 'O', child: Text('Other')),
                ],
                onChanged: (v) => setState(() => _sex = v!),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        Consumer(
          builder: (context, ref, child) => FilledButton(
            onPressed: _isLoading ? null : () => _handleCreate(ref),
            child: _isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Add'),
          ),
        ),
      ],
    );
  }

  Future<void> _handleCreate(WidgetRef ref) async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(votersProvider(widget.electionId).notifier).createVoter(
            admissionNo: _admissionController.text.trim(),
            name: _nameController.text.trim(),
            className: _classController.text.trim(),
            sex: _sex,
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
