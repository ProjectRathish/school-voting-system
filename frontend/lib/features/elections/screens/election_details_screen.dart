import 'package:flutter/material.dart';
import '../../../core/utils/responsive.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import '../models/election_models.dart';
import '../providers/election_provider.dart';
import '../providers/post_provider.dart';
import '../providers/class_provider.dart';
import '../providers/candidate_provider.dart';

class ElectionDetailsScreen extends ConsumerWidget {
  final int electionId;

  const ElectionDetailsScreen({super.key, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final electionsAsync = ref.watch(electionsProvider);

    return electionsAsync.when(
      data: (elections) {
        final election = elections.firstWhere((e) => e.id == electionId);
        return _buildContent(context, ref, election);
      },
      loading: () => const Scaffold(body: Center(child: CircularProgressIndicator())),
      error: (error, _) => Scaffold(body: Center(child: Text('Error: $error'))),
    );
  }

    return Scaffold(
      appBar: AppBar(
        title: Text(election.name),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1600),
          child: SingleChildScrollView(
            padding: EdgeInsets.all(isDesktop ? 32 : 16),
            child: isDesktop || isTablet
                ? Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Left Column: Management & Sidebar (Flex 2)
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildStatusCard(context, ref, election),
                            const SizedBox(height: 32),
                            Text(
                              'Election Management',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            _buildManagementMenu(context, election),
                            const SizedBox(height: 32),
                            if (election.status == ElectionStatus.active ||
                                election.status == ElectionStatus.paused ||
                                election.status == ElectionStatus.closed) ...[
                              Text(
                                'Voting Progress',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 16),
                              _VotingProgressCard(electionId: election.id),
                              const SizedBox(height: 16),
                              _buildAnalyticsButtons(context, election),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(width: 48),
                      // Right Column: Main Content - Posts & Candidates (Flex 3)
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Posts & Candidates',
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                                ),
                                FilledButton.icon(
                                  onPressed: () => _showCreatePostDialog(context, ref, election.id),
                                  icon: const Icon(Icons.add),
                                  label: const Text('Add Post'),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            _PostsList(electionId: election.id),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildStatusCard(context, ref, election),
                      const SizedBox(height: 24),
                      Text(
                        'Election Management',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      _buildManagementMenu(context, election),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Posts & Candidates',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          IconButton.filledTonal(
                            onPressed: () => _showCreatePostDialog(context, ref, election.id),
                            icon: const Icon(Icons.add),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _PostsList(electionId: election.id),
                      const SizedBox(height: 24),
                      if (election.status == ElectionStatus.active ||
                          election.status == ElectionStatus.paused ||
                          election.status == ElectionStatus.closed) ...[
                        Text(
                          'Voting Progress',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        _VotingProgressCard(electionId: election.id),
                        const SizedBox(height: 16),
                        _buildAnalyticsButtons(context, election),
                      ],
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context, WidgetRef ref, Election election) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Current Status:', style: TextStyle(fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    election.status.name.toUpperCase(),
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(),
            const SizedBox(height: 12),
            const Text('Update Status', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                if (election.status == ElectionStatus.draft || election.status == ElectionStatus.configuring)
                  ElevatedButton(
                    onPressed: () => _updateStatus(ref, election.id, ElectionStatus.ready),
                    child: const Text('Set Ready'),
                  ),
                if (election.status == ElectionStatus.ready || election.status == ElectionStatus.paused)
                  FilledButton(
                    onPressed: () => _updateStatus(ref, election.id, ElectionStatus.active),
                    style: FilledButton.styleFrom(backgroundColor: Colors.green),
                    child: const Text('Start/Resume'),
                  ),
                if (election.status == ElectionStatus.active)
                  FilledButton(
                    onPressed: () => _updateStatus(ref, election.id, ElectionStatus.paused),
                    style: FilledButton.styleFrom(backgroundColor: Colors.orange),
                    child: const Text('Pause'),
                  ),
                if (election.status == ElectionStatus.active || election.status == ElectionStatus.paused)
                  FilledButton(
                    onPressed: () => _showCloseConfirmation(context, ref, election),
                    style: FilledButton.styleFrom(backgroundColor: Colors.red),
                    child: const Text('Close Election'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _updateStatus(WidgetRef ref, int id, ElectionStatus status) {
    ref.read(electionsProvider.notifier).updateElectionStatus(id, status);
  }

  void _showCloseConfirmation(BuildContext context, WidgetRef ref, Election election) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Close Election?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('This action cannot be undone. To confirm, please type the exact election name:'),
            const SizedBox(height: 16),
            Text(election.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
            const SizedBox(height: 8),
            TextField(
              controller: controller,
              decoration: const InputDecoration(border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              if (controller.text == election.name) {
                _updateStatus(ref, election.id, ElectionStatus.closed);
                Navigator.pop(context);
              }
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Confirm Close'),
          ),
        ],
      ),
    );
  }
}

class _PostsList extends ConsumerWidget {
  final int electionId;

  const _PostsList({required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(postsProvider(electionId));

    return postsAsync.when(
      data: (posts) {
        return Column(
          children: [
            if (posts.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(32.0),
                  child: Center(child: Text('No posts created yet.')),
                ),
              )
            else
              ...posts.map((post) => _PostExpansionTile(post: post, electionId: electionId)),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Text('Error loading posts: $error')),
    );
  }

  void _showCreatePostDialog(BuildContext context, WidgetRef ref, int electionId) {
    showDialog(
      context: context,
      builder: (context) => _CreatePostDialog(electionId: electionId),
    );
  }
}

class _PostExpansionTile extends ConsumerWidget {
  final Post post;
  final int electionId;

  const _PostExpansionTile({required this.post, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final candidatesAsync = ref.watch(candidatesProvider(electionId));

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ExpansionTile(
        title: Text(post.name, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Gender: ${post.genderRule} | Candidates: ${post.candidateClasses.length} classes'),
        children: [
          candidatesAsync.when(
            data: (candidates) {
              final postCandidates = candidates.where((c) => c.post == post.name).toList();
              return Column(
                children: [
                  ...postCandidates.map((c) {
                    final baseUrl = ref.watch(dioProvider).options.baseUrl;
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundImage: c.photo != null
                            ? NetworkImage('$baseUrl${c.photo}')
                            : null,
                        child: c.photo == null ? Text(c.name[0]) : null,
                      ),
                      title: Text(c.name),
                      subtitle: Text('${c.className} | ${c.admissionNo}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (c.symbol != null)
                            Padding(
                              padding: const EdgeInsets.only(right: 8.0),
                              child: Image.network(
                                '$baseUrl${c.symbol}',
                                width: 32,
                                height: 32,
                                errorBuilder: (_, __, ___) => const Icon(Icons.help_outline, size: 24),
                              ),
                            ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                            onPressed: () => ref.read(candidatesProvider(electionId).notifier).deleteCandidate(c.id),
                          ),
                        ],
                      ),
                    );
                  }),
                  if (postCandidates.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('No candidates for this post'),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: TextButton.icon(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (context) => _AddCandidateDialog(post: post, electionId: electionId),
                        );
                      },
                      icon: const Icon(Icons.person_add),
                      label: const Text('Add Candidate'),
                    ),
                  ),
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Text('Error: $e'),
          ),
        ],
      ),
    );
  }
}

class _CreatePostDialog extends ConsumerStatefulWidget {
  final int electionId;

  const _CreatePostDialog({required this.electionId});

  @override
  ConsumerState<_CreatePostDialog> createState() => _CreatePostDialogState();
}

class _CreatePostDialogState extends ConsumerState<_CreatePostDialog> {
  final _nameController = TextEditingController();
  String _genderRule = 'ANY';
  final List<int> _selectedCandidateClasses = [];
  final List<int> _selectedVotingClasses = [];
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final classesAsync = ref.watch(classesProvider(widget.electionId));

    return AlertDialog(
      title: const Text('Create New Post'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Post Name', hintText: 'e.g. Head Boy'),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _genderRule,
              decoration: const InputDecoration(labelText: 'Gender Rule'),
              items: ['ANY', 'MALE', 'FEMALE']
                  .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                  .toList(),
              onChanged: (v) => setState(() => _genderRule = v!),
            ),
            const SizedBox(height: 16),
            const Text('Eligible Classes (Candidates)', style: TextStyle(fontWeight: FontWeight.bold)),
            classesAsync.when(
              data: (classes) => Wrap(
                children: classes.map((c) => FilterChip(
                  label: Text(c.name),
                  selected: _selectedCandidateClasses.contains(c.id),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) _selectedCandidateClasses.add(c.id);
                      else _selectedCandidateClasses.remove(c.id);
                    });
                  },
                )).toList(),
              ),
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('Error: $e'),
            ),
            const SizedBox(height: 16),
            const Text('Eligible Classes (Voters)', style: TextStyle(fontWeight: FontWeight.bold)),
            classesAsync.when(
              data: (classes) => Wrap(
                children: classes.map((c) => FilterChip(
                  label: Text(c.name),
                  selected: _selectedVotingClasses.contains(c.id),
                  onSelected: (selected) {
                    setState(() {
                      if (selected) _selectedVotingClasses.add(c.id);
                      else _selectedVotingClasses.remove(c.id);
                    });
                  },
                )).toList(),
              ),
              loading: () => const CircularProgressIndicator(),
              error: (e, _) => Text('Error: $e'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(
          onPressed: _isLoading ? null : _handleCreate,
          child: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Create'),
        ),
      ],
    );
  }

  Future<void> _handleCreate() async {
    if (_nameController.text.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(postsProvider(widget.electionId).notifier).createPost(
        name: _nameController.text.trim(),
        genderRule: _genderRule,
        candidateClasses: _selectedCandidateClasses,
        votingClasses: _selectedVotingClasses,
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

class _VotingProgressCard extends ConsumerWidget {
  final int electionId;

  const _VotingProgressCard({required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final turnoutAsync = ref.watch(electionTurnoutProvider(electionId));

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: turnoutAsync.when(
          data: (turnout) {
            return Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Total Turnout',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '${turnout.summary.turnoutPercentage}%',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: turnout.summary.turnoutPercentage / 100,
                  minHeight: 12,
                  borderRadius: BorderRadius.circular(6),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _StatItem(label: 'Total Voters', value: '${turnout.summary.totalVoters}'),
                    _StatItem(label: 'Votes Cast', value: '${turnout.summary.votedCount}'),
                    _StatItem(
                      label: 'Remaining',
                      value: '${turnout.summary.totalVoters - turnout.summary.votedCount}',
                    ),
                  ],
                ),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => Center(child: Text('Error: $e')),
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
        Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey)),
      ],
    );
  }
}

class _AddCandidateDialog extends ConsumerStatefulWidget {
  final Post post;
  final int electionId;

  const _AddCandidateDialog({required this.post, required this.electionId});

  @override
  ConsumerState<_AddCandidateDialog> createState() => _AddCandidateDialogState();
}

class _AddCandidateDialogState extends ConsumerState<_AddCandidateDialog> {
  final _admissionController = TextEditingController();
  PlatformFile? _photo;
  PlatformFile? _symbol;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Add Candidate: ${widget.post.name}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _admissionController,
              decoration: const InputDecoration(
                labelText: 'Admission Number',
                hintText: 'Enter student admission no.',
                helperText: 'System will verify eligibility automatically.',
              ),
            ),
            const SizedBox(height: 16),
            const Text('Candidate Photo', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _FilePickerTile(
              label: 'Pick Photo',
              file: _photo,
              onPicked: (file) => setState(() => _photo = file),
            ),
            const SizedBox(height: 16),
            const Text('Candidate Symbol', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _FilePickerTile(
              label: 'Pick Symbol',
              file: _symbol,
              onPicked: (file) => setState(() => _symbol = file),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(
          onPressed: _isLoading ? null : _handleCreate,
          child: _isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : const Text('Assign Candidate'),
        ),
      ],
    );
  }

  Future<void> _handleCreate() async {
    if (_admissionController.text.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      await ref.read(candidatesProvider(widget.electionId).notifier).createCandidate(
            admissionNo: _admissionController.text.trim(),
            postId: widget.post.id,
            photoBytes: _photo?.bytes?.toList(),
            photoName: _photo?.name,
            symbolBytes: _symbol?.bytes?.toList(),
            symbolName: _symbol?.name,
          );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to assign candidate: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _FilePickerTile extends StatelessWidget {
  final String label;
  final PlatformFile? file;
  final Function(PlatformFile?) onPicked;

  const _FilePickerTile({
    required this.label,
    required this.file,
    required this.onPicked,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: file != null
          ? const Icon(Icons.check_circle, color: Colors.green)
          : const Icon(Icons.image_outlined),
      title: Text(file?.name ?? label),
      trailing: IconButton(
        icon: Icon(file == null ? Icons.add_a_photo : Icons.close),
        onPressed: () async {
          if (file == null) {
            final result = await FilePicker.platform.pickFiles(
              type: FileType.image,
              withData: true,
            );
            if (result != null) onPicked(result.files.single);
          } else {
            onPicked(null);
          }
        },
      ),
      shape: RoundedRectangleBorder(
        side: const BorderSide(color: Colors.grey, width: 0.5),
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }
}
