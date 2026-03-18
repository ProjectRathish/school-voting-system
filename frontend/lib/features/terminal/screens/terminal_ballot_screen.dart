import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/terminal_provider.dart';
import '../repository/terminal_repository.dart';
import '../../elections/models/election_models.dart';

class TerminalBallotScreen extends ConsumerStatefulWidget {
  final VotingMachine machine;

  const TerminalBallotScreen({super.key, required this.machine});

  @override
  ConsumerState<TerminalBallotScreen> createState() => _TerminalBallotScreenState();
}

class _TerminalBallotScreenState extends ConsumerState<TerminalBallotScreen> {
  final Map<int, int> _selections = {}; // postId -> candidateId
  bool _isCasting = false;
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    final token = ref.watch(terminalTokenProvider).value;
    if (token == null) return const Center(child: Text('No Token'));

    // We fetch ballot data using a FutureProvider in the build or just a simple Future
    // For simplicity, let's use a local FutureBuilder or a separate provider.
    // Let's create a ballotProvider for this.
    
    return Scaffold(
      body: FutureBuilder<Map<String, dynamic>>(
        future: ref.read(terminalRepositoryProvider).fetchBallot(token),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error fetching ballot: ${snapshot.error}'));
          }
          
          final ballotData = snapshot.data!['ballot'] as List;
          if (ballotData.isEmpty) {
             return const Center(child: Text('No posts available for you to vote on.'));
          }

          return _buildBallotStepper(ballotData);
        },
      ),
    );
  }

  Widget _buildBallotStepper(List ballotData) {
    final postsCount = ballotData.length;
    final isLastStep = _currentStep == postsCount;

    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(24),
          color: Theme.of(context).colorScheme.primaryContainer,
          child: Row(
            children: [
              const Icon(Icons.how_to_vote, size: 40),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Electronic Voting Machine',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                    ),
                    Text('Machine ID: ${widget.machine.machineName} | Booth: ${widget.machine.boothId}'),
                  ],
                ),
              ),
              if (!isLastStep)
                Chip(
                  label: Text('Post ${_currentStep + 1} of $postsCount'),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  labelStyle: const TextStyle(color: Colors.white),
                ),
            ],
          ),
        ),
        
        Expanded(
          child: isLastStep ? _buildReviewScreen(ballotData) : _buildPostVoting(ballotData[_currentStep]),
        ),

        // Footer Navigation
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -5))],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (_currentStep > 0 && !isLastStep)
                OutlinedButton.icon(
                  onPressed: () => setState(() => _currentStep--),
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('PREVIOUS POST', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20)),
                )
              else if (isLastStep)
                OutlinedButton.icon(
                  onPressed: _isCasting ? null : () => setState(() => _currentStep = postsCount - 1),
                  icon: const Icon(Icons.edit),
                  label: const Text('BACK TO VOTING', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20)),
                )
              else
                const SizedBox.shrink(),
              
              if (!isLastStep)
                FilledButton.icon(
                  onPressed: () {
                     // Check if selection made? (Optional: allow skip?)
                     setState(() => _currentStep++);
                  },
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text('NEXT STEP', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 20)),
                )
              else
                FilledButton.icon(
                  onPressed: _isCasting ? null : () => _handleCastVote(ballotData),
                  icon: _isCasting ? const CircularProgressIndicator(color: Colors.white) : const Icon(Icons.check_circle),
                  label: const Text('CONFIRM & CAST VOTE', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 24),
                    backgroundColor: Colors.green,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPostVoting(dynamic post) {
    final postId = post['post_id'] as int;
    final candidates = post['candidates'] as List;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(32.0),
          child: Text(
            'PLEASE SELECT A CANDIDATE FOR:\n${post['post_name']}',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold, color: Colors.blue.shade900),
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 24,
              mainAxisSpacing: 24,
              childAspectRatio: 0.85,
            ),
            itemCount: candidates.length,
            itemBuilder: (context, index) {
              final candidate = candidates[index];
              final candidateId = candidate['candidate_id'] as int;
              final isSelected = _selections[postId] == candidateId;

              return InkWell(
                onTap: () => setState(() => _selections[postId] = candidateId),
                child: Card(
                  elevation: isSelected ? 12 : 2,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: isSelected ? BorderSide(color: Theme.of(context).primaryColor, width: 4) : BorderSide.none,
                  ),
                  color: isSelected ? Theme.of(context).primaryColor.withOpacity(0.05) : Colors.white,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Candidate Photo
                      CircleAvatar(
                        radius: 60,
                        backgroundColor: Colors.grey.shade200,
                        // backgroundImage: candidate['photo'] != null ? NetworkImage(candidate['photo']) : null,
                        child: candidate['photo'] == null ? const Icon(Icons.person, size: 60) : null,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        candidate['candidate_name'],
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      // Symbol
                      if (candidate['symbol'] != null)
                        const Icon(Icons.star, color: Colors.amber) // Placeholder for symbol
                      else
                        const Text('Symbol: N/A'),
                      const SizedBox(height: 16),
                      isSelected 
                        ? const Icon(Icons.check_circle, color: Colors.green, size: 40)
                        : const Icon(Icons.radio_button_unchecked, size: 40, color: Colors.grey),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildReviewScreen(List ballotData) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Text(
            'REVIEW YOUR SELECTIONS',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          const Text('Please verify your choices before final submission. This action cannot be undone.'),
          const SizedBox(height: 40),
          ...ballotData.map((post) {
            final postId = post['post_id'] as int;
            final selectedCandidateId = _selections[postId];
            final candidate = (post['candidates'] as List).firstWhere(
              (c) => c['candidate_id'] == selectedCandidateId,
              orElse: () => null,
            );

            return Card(
              margin: const EdgeInsets.only(bottom: 16),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                title: Text(post['post_name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(candidate != null ? candidate['candidate_name'] : 'NOT SELECTED', 
                  style: TextStyle(
                    fontSize: 18, 
                    color: candidate != null ? Colors.blue : Colors.red,
                    fontWeight: FontWeight.w500
                  )
                ),
                trailing: candidate != null 
                  ? const Icon(Icons.check_circle, color: Colors.green)
                  : const Icon(Icons.warning, color: Colors.red),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Future<void> _handleCastVote(List ballotData) async {
    final token = ref.read(terminalTokenProvider).value;
    if (token == null) return;

    setState(() => _isCasting = true);
    try {
      final List<Map<String, dynamic>> votes = [];
      for (var post in ballotData) {
        final postId = post['post_id'] as int;
        votes.add({
          'post_id': postId,
          'candidate_id': _selections[postId],
        });
      }

      await ref.read(terminalRepositoryProvider).castVote(token: token, votes: votes);
      
      if (mounted) {
        // Show success screen and reset
        _showSuccessDialog();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to cast vote: $e')));
      }
    } finally {
      if (mounted) setState(() => _isCasting = false);
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Vote Cast Successfully!'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 80),
            SizedBox(height: 24),
            Text('Thank you for voting. Your response has been recorded securely.'),
            SizedBox(height: 8),
            Text('The terminal will reset in a few seconds.', style: TextStyle(color: Colors.grey)),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              ref.invalidate(terminalStateProvider); // Check status again
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
    
    // Auto reset after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (Navigator.canPop(context)) {
        Navigator.pop(context);
        ref.invalidate(terminalStateProvider);
      }
    });
  }
}
