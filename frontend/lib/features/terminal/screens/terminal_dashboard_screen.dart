import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/terminal_provider.dart';
import 'terminal_setup_screen.dart';
import 'terminal_idle_screen.dart';
import 'terminal_ballot_screen.dart';

class TerminalDashboardScreen extends ConsumerWidget {
  const TerminalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final terminalAsync = ref.watch(terminalStateProvider);

    return terminalAsync.when(
      data: (machine) {
        if (machine == null) {
          return const TerminalSetupScreen();
        }
        
        switch (machine.status) {
          case 'FREE':
            return const TerminalIdleScreen();
          case 'BUSY':
            return TerminalBallotScreen(machine: machine);
          default:
            return const TerminalSetupScreen();
        }
      },
      loading: () => const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Verifying Terminal Authorization...'),
            ],
          ),
        ),
      ),
      error: (e, _) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Connection Error: $e'),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => ref.read(terminalStateProvider.notifier).refresh(),
                child: const Text('Try Again'),
              ),
              TextButton(
                onPressed: () => ref.read(terminalTokenProvider.notifier).clearToken(),
                child: const Text('Reset Terminal'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
