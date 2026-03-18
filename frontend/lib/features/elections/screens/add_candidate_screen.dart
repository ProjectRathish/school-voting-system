import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:go_router/go_router.dart';
import '../providers/candidate_provider.dart';
import '../providers/post_provider.dart';

class AddCandidateScreen extends ConsumerStatefulWidget {
  final int electionId;

  const AddCandidateScreen({super.key, required this.electionId});

  @override
  ConsumerState<AddCandidateScreen> createState() => _AddCandidateScreenState();
}

class _AddCandidateScreenState extends ConsumerState<AddCandidateScreen> {
  final _formKey = GlobalKey<FormState>();
  final _admissionController = TextEditingController();
  int? _selectedPostId;
  PlatformFile? _photo;
  PlatformFile? _symbol;
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final postsAsync = ref.watch(postsProvider(widget.electionId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Candidate'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enroll Student as Candidate',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'The system will verify the student\'s eligibility based on the selected post rules.',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              
              TextFormField(
                controller: _admissionController,
                decoration: const InputDecoration(
                  labelText: 'Admission Number',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.badge_outlined),
                ),
                validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 24),
              
              postsAsync.when(
                data: (posts) => DropdownButtonFormField<int>(
                  value: _selectedPostId,
                  decoration: const InputDecoration(
                    labelText: 'Select Election Post',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.how_to_reg_outlined),
                  ),
                  items: posts.map((p) => DropdownMenuItem(
                    value: p.id,
                    child: Text(p.name),
                  )).toList(),
                  onChanged: (v) => setState(() => _selectedPostId = v),
                  validator: (v) => v == null ? 'Please select a post' : null,
                ),
                loading: () => const LinearProgressIndicator(),
                error: (e, _) => Text('Error loading posts: $e'),
              ),
              
              const SizedBox(height: 32),
              const Text('Visual Identity', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _UploadBox(
                      label: 'Candidate Photo',
                      file: _photo,
                      icon: Icons.person_outline,
                      onTap: () => _pickFile('photo'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _UploadBox(
                      label: 'Election Symbol',
                      file: _symbol,
                      icon: Icons.emoji_emotions_outlined,
                      onTap: () => _pickFile('symbol'),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Review and Assign Candidate'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickFile(String type) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );

    if (result != null) {
      setState(() {
        if (type == 'photo') {
          _photo = result.files.single;
        } else {
          _symbol = result.files.single;
        }
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_photo == null || _symbol == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload both a photo and a symbol.')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await ref.read(candidatesProvider(widget.electionId).notifier).createCandidate(
        admissionNo: _admissionController.text.trim(),
        postId: _selectedPostId!,
        photoBytes: _photo!.bytes?.toList(),
        photoName: _photo!.name,
        symbolBytes: _symbol!.bytes?.toList(),
        symbolName: _symbol!.name,
      );
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification Failed: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _UploadBox extends StatelessWidget {
  final String label;
  final PlatformFile? file;
  final IconData icon;
  final VoidCallback onTap;

  const _UploadBox({
    required this.label,
    required this.file,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300, width: 2),
          borderRadius: BorderRadius.circular(12),
          color: file != null ? Colors.green.shade50 : Colors.grey.shade50,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              file != null ? Icons.check_circle : icon,
              size: 32,
              color: file != null ? Colors.green : Colors.grey,
            ),
            const SizedBox(height: 8),
            Text(
              file != null ? 'Picked!' : label,
              style: TextStyle(
                fontSize: 12,
                color: file != null ? Colors.green : Colors.grey.shade600,
                fontWeight: file != null ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            if (file != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  file!.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 10, color: Colors.green),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
