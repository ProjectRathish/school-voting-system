import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import '../repository/school_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/network/dio_provider.dart';

class BrandingSettingsScreen extends ConsumerStatefulWidget {
  const BrandingSettingsScreen({super.key});

  @override
  ConsumerState<BrandingSettingsScreen> createState() => _BrandingSettingsScreenState();
}

class _BrandingSettingsScreenState extends ConsumerState<BrandingSettingsScreen> {
  bool _isUploading = false;
  String? _error;

  Future<void> _pickAndUploadLogo() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      allowMultiple: false,
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _isUploading = true;
        _error = null;
      });

      try {
        final logoUrl = await ref.read(schoolRepositoryProvider).uploadLogo(
          File(result.files.single.path!),
        );
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Logo updated successfully: $logoUrl')),
          );
        }
      } catch (e) {
        setState(() => _error = e.toString());
      } finally {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).value;
    final baseUrl = ref.watch(dioProvider).options.baseUrl;

    return Scaffold(
      appBar: AppBar(
        title: const Text('School Branding'),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 40),
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 80,
                      backgroundColor: Colors.grey.shade100,
                      backgroundImage: user?.schoolLogo != null
                          ? NetworkImage('$baseUrl${user!.schoolLogo}')
                          : null,
                      child: user?.schoolLogo == null
                          ? Icon(Icons.school, size: 80, color: Colors.grey.shade300)
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: FloatingActionButton.small(
                        onPressed: _isUploading ? null : _pickAndUploadLogo,
                        child: _isUploading 
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.edit),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Text(
                  user?.schoolName ?? 'School Name',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
                ),
                Text(
                  'ID: ${user?.schoolId ?? "N/A"}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
                ),
                const SizedBox(height: 48),
                const Divider(),
                const SizedBox(height: 24),
                ListTile(
                  leading: const Icon(Icons.image_outlined),
                  title: const Text('Update Official Logo'),
                  subtitle: const Text('This logo will appear on dashboard and reports.'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _pickAndUploadLogo,
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!, style: const TextStyle(color: Colors.red)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
