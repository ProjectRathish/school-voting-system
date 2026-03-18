import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_provider.dart';
import 'package:dio/dio.dart';

// ─────────────────────────────────────────────
// Simple data models
// ─────────────────────────────────────────────
class _Section {
  final int id;
  final String name;
  _Section({required this.id, required this.name});
  factory _Section.fromJson(Map<String, dynamic> j) =>
      _Section(id: j['id'], name: j['name']);
}

class _Class {
  final int id;
  final String name;
  final String sectionName;
  _Class({required this.id, required this.name, required this.sectionName});
  factory _Class.fromJson(Map<String, dynamic> j) =>
      _Class(id: j['id'], name: j['name'], sectionName: j['section_name'] ?? '');
}

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────
class SectionClassScreen extends ConsumerStatefulWidget {
  final int electionId;
  const SectionClassScreen({super.key, required this.electionId});

  @override
  ConsumerState<SectionClassScreen> createState() => _SectionClassScreenState();
}

class _SectionClassScreenState extends ConsumerState<SectionClassScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  late Dio _dio;

  List<_Section> _sections = [];
  List<_Class> _classes = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _dio = ref.read(dioProvider);
    _loadAll();
  }

  Future<void> _loadAll() async {
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        _dio.get('/sections/get-sections', queryParameters: {'election_id': widget.electionId}),
        _dio.get('/classes/get-classes', queryParameters: {'election_id': widget.electionId}),
      ]);
      setState(() {
        _sections = (results[0].data as List).map((e) => _Section.fromJson(e)).toList();
        _classes  = (results[1].data as List).map((e) => _Class.fromJson(e)).toList();
        _loading = false;
      });
    } on DioException catch (e) {
      setState(() { _error = e.response?.data?['message'] ?? e.message; _loading = false; });
    }
  }

  // ─── Section actions ────────────────────────
  Future<void> _addSection() async {
    final name = await _nameDialog(title: 'New Section', hint: 'e.g. Primary, Secondary');
    if (name == null) return;
    try {
      await _dio.post('/sections/create', data: {'election_id': widget.electionId, 'name': name});
      _loadAll();
      if (mounted) _snack('Section "$name" created');
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['message'] ?? 'Error', isError: true);
    }
  }

  Future<void> _editSection(_Section s) async {
    final name = await _nameDialog(title: 'Rename Section', hint: s.name, initial: s.name);
    if (name == null) return;
    try {
      await _dio.put('/sections/${s.id}', data: {'name': name});
      _loadAll();
      if (mounted) _snack('Section renamed to "$name"');
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['message'] ?? 'Error', isError: true);
    }
  }

  Future<void> _deleteSection(_Section s) async {
    final ok = await _confirmDialog(
        title: 'Delete Section?',
        message: 'This will delete section "${s.name}" and all its classes.');
    if (!ok) return;
    try {
      await _dio.delete('/sections/${s.id}');
      _loadAll();
      if (mounted) _snack('Section deleted');
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['message'] ?? 'Error', isError: true);
    }
  }

  // ─── Class actions ────────────────────────
  Future<void> _addClass() async {
    if (_sections.isEmpty) {
      _snack('Please create at least one section first', isError: true);
      return;
    }
    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (_) => _AddClassDialog(sections: _sections),
    );
    if (result == null) return;
    try {
      await _dio.post('/classes/create', data: {
        'election_id': widget.electionId,
        'section_id': result['section_id'],
        'name': result['name'],
      });
      _loadAll();
      if (mounted) _snack('Class "${result['name']}" added');
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['message'] ?? 'Error', isError: true);
    }
  }

  Future<void> _editClass(_Class c) async {
    final name = await _nameDialog(title: 'Rename Class', hint: c.name, initial: c.name);
    if (name == null) return;
    try {
      await _dio.put('/classes/${c.id}', data: {'name': name});
      _loadAll();
      if (mounted) _snack('Class renamed to "$name"');
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['message'] ?? 'Error', isError: true);
    }
  }

  Future<void> _deleteClass(_Class c) async {
    final ok = await _confirmDialog(
        title: 'Delete Class?',
        message: 'This will delete class "${c.name}".');
    if (!ok) return;
    try {
      await _dio.delete('/classes/${c.id}');
      _loadAll();
      if (mounted) _snack('Class deleted');
    } on DioException catch (e) {
      if (mounted) _snack(e.response?.data?['message'] ?? 'Error', isError: true);
    }
  }

  // ─── Helpers ────────────────────────────────
  Future<String?> _nameDialog({required String title, String? hint, String? initial}) {
    final ctrl = TextEditingController(text: initial ?? '');
    return showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: ctrl,
          autofocus: true,
          decoration: InputDecoration(hintText: hint, border: const OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: () {
              final v = ctrl.text.trim();
              if (v.isNotEmpty) Navigator.pop(context, v);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  Future<bool> _confirmDialog({required String title, required String message}) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    return ok ?? false;
  }

  void _snack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: isError ? Colors.red : Colors.green,
    ));
  }

  // ─── Build ────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sections & Classes'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.layers_outlined), text: 'Sections'),
            Tab(icon: Icon(Icons.class_outlined), text: 'Classes'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildSectionsTab(),
                    _buildClassesTab(),
                  ],
                ),
      floatingActionButton: ListenableBuilder(
        listenable: _tabController,
        builder: (_, __) => FloatingActionButton.extended(
          onPressed: _tabController.index == 0 ? _addSection : _addClass,
          icon: const Icon(Icons.add),
          label: Text(_tabController.index == 0 ? 'Add Section' : 'Add Class'),
        ),
      ),
    );
  }

  Widget _buildError() => Center(
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.error_outline, size: 48, color: Colors.red),
      const SizedBox(height: 12),
      Text(_error!),
      const SizedBox(height: 16),
      ElevatedButton.icon(onPressed: _loadAll, icon: const Icon(Icons.refresh), label: const Text('Retry')),
    ]),
  );

  Widget _buildSectionsTab() {
    if (_sections.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.layers_outlined, size: 72, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text('No sections yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
          const SizedBox(height: 8),
          const Text('Tap + to add a section (e.g. Primary, Secondary)', style: TextStyle(color: Colors.grey)),
        ]),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadAll,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _sections.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (_, i) {
          final s = _sections[i];
          final classCount = _classes.where((c) => c.sectionName == s.name).length;
          return Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                child: Text('${i + 1}', style: TextStyle(color: Theme.of(context).colorScheme.onPrimaryContainer, fontWeight: FontWeight.bold)),
              ),
              title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
              subtitle: Text('$classCount class${classCount == 1 ? '' : 'es'}'),
              trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                IconButton(icon: const Icon(Icons.edit_outlined), tooltip: 'Rename', onPressed: () => _editSection(s)),
                IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), tooltip: 'Delete', onPressed: () => _deleteSection(s)),
              ]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildClassesTab() {
    if (_classes.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.class_outlined, size: 72, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text('No classes yet', style: TextStyle(fontSize: 18, color: Colors.grey)),
          const SizedBox(height: 8),
          const Text('Tap + to add a class under a section', style: TextStyle(color: Colors.grey)),
        ]),
      );
    }

    // Group by section
    final grouped = <String, List<_Class>>{};
    for (final c in _classes) {
      grouped.putIfAbsent(c.sectionName, () => []).add(c);
    }

    return RefreshIndicator(
      onRefresh: _loadAll,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: grouped.entries.map((entry) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  entry.key,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ),
              ...entry.value.map((c) => Card(
                margin: const EdgeInsets.only(bottom: 8),
                elevation: 1,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: ListTile(
                  leading: const Icon(Icons.school_outlined),
                  title: Text(c.name),
                  trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                    IconButton(icon: const Icon(Icons.edit_outlined), tooltip: 'Rename', onPressed: () => _editClass(c)),
                    IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), tooltip: 'Delete', onPressed: () => _deleteClass(c)),
                  ]),
                ),
              )),
              const SizedBox(height: 8),
            ],
          );
        }).toList(),
      ),
    );
  }
}

// ─────────────────────────────────────────────
// Add-class dialog
// ─────────────────────────────────────────────
class _AddClassDialog extends StatefulWidget {
  final List<_Section> sections;
  const _AddClassDialog({required this.sections});

  @override
  State<_AddClassDialog> createState() => _AddClassDialogState();
}

class _AddClassDialogState extends State<_AddClassDialog> {
  final _nameCtrl = TextEditingController();
  _Section? _selectedSection;

  @override
  void initState() {
    super.initState();
    if (widget.sections.isNotEmpty) _selectedSection = widget.sections.first;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Class'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          DropdownButtonFormField<_Section>(
            value: _selectedSection,
            decoration: const InputDecoration(labelText: 'Section', border: OutlineInputBorder()),
            items: widget.sections.map((s) => DropdownMenuItem(value: s, child: Text(s.name))).toList(),
            onChanged: (v) => setState(() => _selectedSection = v),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _nameCtrl,
            autofocus: true,
            decoration: const InputDecoration(labelText: 'Class Name', hintText: 'e.g. Grade 10-A', border: OutlineInputBorder()),
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(
          onPressed: () {
            final name = _nameCtrl.text.trim();
            if (name.isNotEmpty && _selectedSection != null) {
              Navigator.pop(context, {'name': name, 'section_id': _selectedSection!.id});
            }
          },
          child: const Text('Add'),
        ),
      ],
    );
  }
}
