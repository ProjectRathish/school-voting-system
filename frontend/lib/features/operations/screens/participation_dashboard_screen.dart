import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../elections/models/election_models.dart';
import '../../elections/providers/election_provider.dart';
import '../../../core/utils/responsive.dart';
import '../../auth/providers/auth_provider.dart';

class ParticipationDashboardScreen extends ConsumerWidget {
  final int electionId;

  const ParticipationDashboardScreen({super.key, required this.electionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final turnoutAsync = ref.watch(electionTurnoutProvider(electionId));

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Participation Analytics'),
            if (ref.watch(authProvider).value?.schoolName != null)
              Text(
                ref.watch(authProvider).value!.schoolName!,
                style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.normal),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(electionTurnoutProvider(electionId)),
          ),
        ],
      ),
      body: turnoutAsync.when(
        data: (turnout) => _buildDashboard(context, turnout),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
      bottomNavigationBar: ref.watch(authProvider).value?.schoolName != null
          ? Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              color: Colors.white,
              child: Text(
                'Proprietary Analysis for: ${ref.watch(authProvider).value!.schoolName!}',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 9, color: Colors.grey.shade400, fontStyle: FontStyle.italic),
              ),
            )
          : null,
    );
  }

  Widget _buildDashboard(BuildContext context, ElectionTurnout turnout) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSummaryHeader(context, turnout.summary),
              const SizedBox(height: 32),
              if (Responsive.isDesktop(context))
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 3, child: _buildClassWiseTurnout(context, turnout.classBreakdown)),
                    const SizedBox(width: 24),
                    Expanded(flex: 2, child: _buildGenderBreakdown(context, turnout.genderBreakdown)),
                  ],
                )
              else
                Column(
                  children: [
                    _buildClassWiseTurnout(context, turnout.classBreakdown),
                    const SizedBox(height: 24),
                    _buildGenderBreakdown(context, turnout.genderBreakdown),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryHeader(BuildContext context, TurnoutSummary summary) {
    return Row(
      children: [
        _buildStatCard(
          context,
          'Total Turnout',
          '${summary.turnoutPercentage.toStringAsFixed(1)}%',
          Icons.pie_chart,
          Colors.blue,
        ),
        const SizedBox(width: 16),
        _buildStatCard(
          context,
          'Votes Cast',
          '${summary.votedCount}',
          Icons.how_to_vote,
          Colors.green,
        ),
        const SizedBox(width: 16),
        _buildStatCard(
          context,
          'Remaining',
          '${summary.totalVoters - summary.votedCount}',
          Icons.people_outline,
          Colors.orange,
        ),
      ],
    );
  }

  Widget _buildStatCard(BuildContext context, String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: color.withOpacity(0.2)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                child: Icon(icon, color: color),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                  Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 24)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildClassWiseTurnout(BuildContext context, List<TurnoutBreakdown> classBreakdown) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Turnout by Class', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            SizedBox(
              height: 300,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: 100,
                  barTouchData: BarTouchData(enabled: true),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() < classBreakdown.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Text(classBreakdown[value.toInt()].className ?? '', style: const TextStyle(fontSize: 10)),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 40,
                        getTitlesWidget: (value, meta) => Text('${value.toInt()}%', style: const TextStyle(fontSize: 10)),
                      ),
                    ),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  gridData: const FlGridData(show: false),
                  borderData: FlBorderData(show: false),
                  barGroups: List.generate(classBreakdown.length, (i) {
                    final item = classBreakdown[i];
                    final pct = item.total > 0 ? (item.voted / item.total * 100) : 0.0;
                    return BarChartGroupData(
                      x: i,
                      barRods: [
                        BarChartRodData(
                          toY: pct,
                          color: Colors.blue.shade400,
                          width: 20,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                          backDrawRodData: BackgroundBarChartRodData(
                            show: true,
                            toY: 100,
                            color: Colors.grey.shade100,
                          ),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGenderBreakdown(BuildContext context, List<TurnoutBreakdown> genderBreakdown) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Gender Participation', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 32),
            SizedBox(
              height: 300,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 4,
                  centerSpaceRadius: 50,
                  sections: genderBreakdown.map((item) {
                    final isMale = item.sex == 'M';
                    return PieChartSectionData(
                      value: item.voted.toDouble(),
                      title: '${item.voted}',
                      radius: 60,
                      color: isMale ? Colors.blue.shade300 : Colors.pink.shade300,
                      titleStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                      badgeWidget: _buildBadge(isMale ? Icons.male : Icons.female, isMale ? Colors.blue : Colors.pink),
                      badgePositionPercentageOffset: 1.3,
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: color, width: 2)),
      child: Icon(icon, color: color, size: 16),
    );
  }
}
