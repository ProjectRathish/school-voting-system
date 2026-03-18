import 'package:flutter/material.dart';
import '../../../core/utils/responsive.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/election_models.dart';
import '../providers/election_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/network/dio_provider.dart';

class ElectionsDashboardScreen extends ConsumerWidget {
  const ElectionsDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final electionsAsync = ref.watch(electionsProvider);
    final user = ref.watch(authProvider).value;

    return Scaffold(
      appBar: AppBar(
        leading: user?.schoolLogo != null
            ? Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundImage: NetworkImage('${ref.watch(dioProvider).options.baseUrl}${user!.schoolLogo}'),
                ),
              )
            : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Elections Dashboard'),
            if (user?.schoolName != null)
              Text(
                user!.schoolName!,
                style: const TextStyle(fontSize: 12, color: Colors.white70),
              ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => context.push('/terminal'),
            icon: const Icon(Icons.dvr),
            tooltip: 'Launch EVM Terminal',
          ),
          if (user?.role == 'SCHOOL_ADMIN')
            PopupMenuButton(
              icon: const Icon(Icons.settings),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'branding',
                  child: Row(
                    children: [
                      Icon(Icons.palette_outlined),
                      SizedBox(width: 12),
                      Text('School Branding'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'logout',
                  child: Row(
                    children: [
                      Icon(Icons.logout),
                      SizedBox(width: 12),
                      Text('Logout'),
                    ],
                  ),
                ),
              ],
              onSelected: (value) {
                if (value == 'branding') {
                  context.push('/branding');
                } else if (value == 'logout') {
                  ref.read(authProvider.notifier).logout();
                }
              },
            )
          else
            IconButton(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              icon: const Icon(Icons.logout),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(electionsProvider.notifier).refresh(),
        child: electionsAsync.when(
          data: (elections) {
            if (elections.isEmpty) {
              return _buildEmptyState(context);
            }
            
            final isMobile = Responsive.isMobile(context);
            final crossAxisCount = Responsive.isDesktop(context) ? 3 : (Responsive.isTablet(context) ? 2 : 1);

            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1200),
                child: isMobile 
                  ? ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: elections.length,
                      itemBuilder: (context, index) {
                        final election = elections[index];
                        return _ElectionCard(election: election);
                      },
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(24),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 24,
                        mainAxisSpacing: 24,
                        childAspectRatio: 1.4,
                      ),
                      itemCount: elections.length,
                      itemBuilder: (context, index) {
                        final election = elections[index];
                        return _ElectionCard(election: election);
                      },
                    ),
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text('Failed to load elections: $error'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => ref.read(electionsProvider.notifier).refresh(),
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: user?.role == 'SCHOOL_ADMIN'
          ? FloatingActionButton.extended(
              onPressed: () => context.push('/elections/create'),
              label: const Text('Create Election'),
              icon: const Icon(Icons.add),
            )
          : null,
      bottomNavigationBar: user?.schoolName != null
          ? Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                border: Border(top: BorderSide(color: Colors.grey.shade300, width: 0.5)),
              ),
              child: Text(
                'Licensed to: ${user!.schoolName!} (Inst. ID: ${user.schoolId})',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 10,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.how_to_vote_outlined,
            size: 80,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 24),
          Text(
            'No elections found',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          const Text('Tap the + button to create your first election.'),
        ],
      ),
    );
  }
}

class _ElectionCard extends ConsumerWidget {
  final Election election;

  const _ElectionCard({required this.election});

  Color _getStatusColor(ElectionStatus status) {
    switch (status) {
      case ElectionStatus.draft:
        return Colors.grey;
      case ElectionStatus.configuring:
        return Colors.blue;
      case ElectionStatus.ready:
        return Colors.teal;
      case ElectionStatus.active:
        return Colors.green;
      case ElectionStatus.paused:
        return Colors.orange;
      case ElectionStatus.closed:
        return Colors.red;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = _getStatusColor(election.status);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to election details
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      election.name,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: statusColor),
                    ),
                    child: Text(
                      election.status.name.toUpperCase(),
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    'Created: ${election.createdAt.split('T')[0]}',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
              if (election.startTime != null) ...[
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 16, color: Colors.grey),
                    const SizedBox(width: 8),
                    Text(
                      'Starts: ${election.startTime}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (election.status == ElectionStatus.active)
                    TextButton.icon(
                      onPressed: () => ref
                          .read(electionsProvider.notifier)
                          .updateElectionStatus(election.id, ElectionStatus.paused),
                      icon: const Icon(Icons.pause),
                      label: const Text('Pause'),
                      style: TextButton.styleFrom(foregroundColor: Colors.orange),
                    ),
                  if (election.status == ElectionStatus.paused)
                    TextButton.icon(
                      onPressed: () => ref
                          .read(electionsProvider.notifier)
                          .updateElectionStatus(election.id, ElectionStatus.active),
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('Resume'),
                      style: TextButton.styleFrom(foregroundColor: Colors.green),
                    ),
                  TextButton(
                    onPressed: () {
                      context.push('/elections/${election.id}');
                    },
                    child: const Text('Manage'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
