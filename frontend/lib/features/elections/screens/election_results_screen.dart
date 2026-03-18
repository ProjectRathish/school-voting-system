import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/election_provider.dart';
import '../../../core/network/dio_provider.dart';
import '../../auth/providers/auth_provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/network/token_provider.dart';
import '../../../core/network/api_constants.dart';

class ElectionResultsScreen extends ConsumerWidget {
  final int electionId;

  const ElectionResultsScreen({super.key, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultsAsync = ref.watch(electionResultsProvider(electionId));

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Official Election Results'),
            if (ref.watch(authProvider).value?.schoolName != null)
              Text(
                ref.watch(authProvider).value!.schoolName!,
                style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.normal),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            tooltip: 'Download Official PDF Report',
            onPressed: () async {
               final token = ref.read(tokenManagerProvider).value;
               if (token != null) {
                 final baseUrl = ApiConstants.baseUrl;
                 final url = Uri.parse('$baseUrl/reports/election/$electionId?token=$token');
                 if (await canLaunchUrl(url)) {
                   await launchUrl(url, mode: LaunchMode.externalApplication);
                 } else {
                   if (context.mounted) {
                     ScaffoldMessenger.of(context).showSnackBar(
                       const SnackBar(content: Text('Could not launch report URL')),
                     );
                   }
                 }
               }
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: resultsAsync.when(
        data: (data) => _buildResults(context, ref, data),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      bottomNavigationBar: ref.watch(authProvider).value?.schoolName != null
          ? Container(
              padding: const EdgeInsets.all(12),
              color: Colors.white,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                   const Divider(),
                   Text(
                    '© ${DateTime.now().year} School Voting System • Generated for ${ref.watch(authProvider).value!.schoolName!}',
                    style: TextStyle(fontSize: 10, color: Colors.grey.shade500),
                  ),
                  Text(
                    'Serial No: SV-${ref.watch(authProvider).value!.schoolId}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
                    style: TextStyle(fontSize: 8, color: Colors.grey.shade400, fontFamily: 'monospace'),
                  ),
                ],
              ),
            )
          : null,
    );
  }

  Widget _buildResults(BuildContext context, WidgetRef ref, Map<String, dynamic> data) {
    final stats = data['statistics'];
    final results = data['results'] as List;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 900),
          child: Column(
            children: [
              _buildStatsHeader(context, stats),
              const SizedBox(height: 32),
              ...results.map((post) => _buildPostResult(context, ref, post)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsHeader(BuildContext context, dynamic stats) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem('Total Voters', '${stats['total_voters']}'),
            _buildStatItem('Votes Cast', '${stats['voted_count']}'),
            _buildStatItem('Turnout', '${stats['turnout_percentage']}%'),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
      ],
    );
  }

  Widget _buildPostResult(BuildContext context, WidgetRef ref, dynamic post) {
    final candidates = post['candidates'] as List;
    final totalVotes = post['total_votes'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Text(
            post['post_name'],
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
        ...candidates.asMap().entries.map((entry) {
          final index = entry.key;
          final c = entry.value;
          final isWinner = index == 0 && c['votes'] > 0;
          final percentage = totalVotes > 0 ? (c['votes'] / totalVotes) : 0.0;
          final baseUrl = ref.watch(dioProvider).options.baseUrl;

          return Card(
            elevation: isWinner ? 6 : 1,
            margin: const EdgeInsets.only(bottom: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: isWinner ? BorderSide(color: Colors.amber.shade400, width: 2) : BorderSide.none,
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: IntrinsicHeight(
                child: Row(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 35,
                          backgroundColor: Colors.grey.shade100,
                          backgroundImage: c['photo'] != null ? NetworkImage('$baseUrl${c['photo']}') : null,
                          child: c['photo'] == null ? Text(c['candidate_name'][0], style: const TextStyle(fontSize: 24)) : null,
                        ),
                        if (isWinner)
                          Positioned(
                            right: 0,
                            bottom: 0,
                            child: Container(
                              padding: const EdgeInsets.all(6),
                              decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
                              child: const Icon(Icons.emoji_events, size: 16, color: Colors.white),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Row(
                            children: [
                              Text(
                                c['candidate_name'],
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: isWinner ? Colors.amber.shade900 : null,
                                ),
                              ),
                              if (isWinner) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(8)),
                                  child: Text('ELECTED', style: TextStyle(color: Colors.amber.shade900, fontSize: 10, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: percentage,
                              minHeight: 8,
                              color: isWinner ? Colors.amber : Colors.blue.shade400,
                              backgroundColor: Colors.grey.shade100,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            '${c['votes']} votes • ${(percentage * 100).toStringAsFixed(1)}%',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    if (c['symbol'] != null)
                      Image.network(
                        '$baseUrl${c['symbol']}',
                        width: 50,
                        height: 50,
                        errorBuilder: (_, __, ___) => const Icon(Icons.help_outline),
                      ),
                  ],
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: 24),
      ],
    );
  }
}
