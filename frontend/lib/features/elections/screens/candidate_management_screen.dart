import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/network/dio_provider.dart';
import '../providers/candidate_provider.dart';

class CandidateManagementScreen extends ConsumerWidget {
  final int electionId;

  const CandidateManagementScreen({super.key, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final candidateListAsync = ref.watch(candidatesProvider(electionId));
    final baseUrl = ref.watch(dioProvider).options.baseUrl;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Candidate Management'),
        actions: [
          IconButton(
            onPressed: () => ref.read(candidatesProvider(electionId).notifier).refresh(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: candidateListAsync.when(
        data: (candidates) {
          if (candidates.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.person_outline, size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  const Text('No candidates added yet'),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => context.push('/elections/$electionId/candidates/add'),
                    icon: const Icon(Icons.add),
                    label: const Text('Add First Candidate'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: candidates.length,
            itemBuilder: (context, index) {
              final candidate = candidates[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundImage: candidate.photo != null
                        ? NetworkImage('$baseUrl${candidate.photo}')
                        : null,
                    child: candidate.photo == null ? const Icon(Icons.person) : null,
                  ),
                  title: Text(candidate.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Post: ${candidate.post}'),
                      Text('Class: ${candidate.className} | Adm: ${candidate.admissionNo}'),
                    ],
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (candidate.symbol != null)
                        Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: Image.network(
                            '$baseUrl${candidate.symbol}',
                            width: 32,
                            height: 32,
                            errorBuilder: (_, __, ___) => const Icon(Icons.image_not_supported, size: 24),
                          ),
                        ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: () => _confirmDelete(context, ref, candidate.id, candidate.name),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/elections/$electionId/candidates/add'),
        icon: const Icon(Icons.add),
        label: const Text('Add Candidate'),
      ),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, int candidateId, String name) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Candidate?'),
        content: Text('Are you sure you want to remove $name from the election?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await ref.read(candidatesProvider(electionId).notifier).deleteCandidate(candidateId);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Remove'),
          ),
        ],
      ),
    );
  }
}
