import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/elections/screens/elections_dashboard_screen.dart';
import '../../features/elections/screens/election_details_screen.dart';
import '../../features/elections/screens/create_election_screen.dart';
import '../../features/elections/screens/voters_screen.dart';
import '../../features/elections/screens/polling_booths_screen.dart';
import '../../features/elections/screens/voting_machines_screen.dart';
import '../../features/operations/screens/booth_operations_screen.dart';
import '../../features/terminal/screens/terminal_dashboard_screen.dart';
import '../../features/operations/screens/participation_dashboard_screen.dart';
import '../../features/elections/screens/election_results_screen.dart';
import '../../features/elections/screens/branding_settings_screen.dart';
import '../../features/elections/screens/candidate_management_screen.dart';
import '../../features/elections/screens/add_candidate_screen.dart';
import '../../features/elections/screens/section_class_screen.dart';

part 'router.g.dart';

@riverpod
GoRouter router(Ref ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isLoggingIn = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoggingIn) return '/login';
      if (isLoggedIn && isLoggingIn) return '/';

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const ElectionsDashboardScreen(),
      ),
      GoRoute(
        path: '/elections/create',
        builder: (context, state) => const CreateElectionScreen(),
      ),
      GoRoute(
        path: '/elections/:id',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return ElectionDetailsScreen(electionId: id);
        },
      ),
      GoRoute(
        path: '/elections/:id/voters',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return VotersScreen(electionId: id);
        },
      ),
      GoRoute(
        path: '/elections/:id/booths',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return PollingBoothsScreen(electionId: id);
        },
      ),
      GoRoute(
        path: '/elections/:id/booths/:boothId/machines',
        builder: (context, state) {
          final electionId = int.parse(state.pathParameters['id']!);
          final boothId = int.parse(state.pathParameters['boothId']!);
          return VotingMachinesScreen(electionId: electionId, boothId: boothId);
        },
      ),
      GoRoute(
        path: '/elections/:id/booths/:boothId/operations',
        builder: (context, state) {
          final electionId = int.parse(state.pathParameters['id']!);
          final boothId = int.parse(state.pathParameters['boothId']!);
          return BoothOperationsScreen(electionId: electionId, boothId: boothId);
        },
      ),
      GoRoute(
        path: '/terminal',
        builder: (context, state) => const TerminalDashboardScreen(),
      ),
      GoRoute(
        path: '/elections/:id/participation',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return ParticipationDashboardScreen(electionId: id);
        },
      ),
      GoRoute(
        path: '/elections/:id/results',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return ElectionResultsScreen(electionId: id);
        },
      ),
      GoRoute(
        path: '/elections/:id/candidates',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return CandidateManagementScreen(electionId: id);
        },
        routes: [
          GoRoute(
            path: 'add',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return AddCandidateScreen(electionId: id);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/branding',
        builder: (context, state) => const BrandingSettingsScreen(),
      ),
      GoRoute(
        path: '/elections/:id/sections',
        builder: (context, state) {
          final id = int.parse(state.pathParameters['id']!);
          return SectionClassScreen(electionId: id);
        },
      ),
    ],
  );
}

