import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';

import 'api_client.dart';

void main() {
  runApp(const GeoWorkbenchMobileApp());
}

class GeoWorkbenchMobileApp extends StatelessWidget {
  const GeoWorkbenchMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GeoWorkbench Field',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff2f7d6f)),
        useMaterial3: true,
      ),
      home: const FieldSyncScreen(),
    );
  }
}

class FieldSyncScreen extends StatefulWidget {
  const FieldSyncScreen({super.key});

  @override
  State<FieldSyncScreen> createState() => _FieldSyncScreenState();
}

class _FieldSyncScreenState extends State<FieldSyncScreen> {
  final _baseUrl = TextEditingController(text: 'http://192.168.1.3:8081');
  final _newCode = TextEditingController(text: 'CTSJ-30-P-02-ANDROID-DEMO');
  final _fromDepth = TextEditingController(text: '525.0');
  final _toDepth = TextEditingController(text: '526.2');
  final _lithology = TextEditingController(text: 'COAL');
  final _remarks = TextEditingController(text: 'Android demo interval from field app');
  String _fileType = 'excel';
  int _sourceBoreholeId = 6;
  int? _createdBoreholeId;
  String _status = 'Ready';
  bool _busy = false;

  GeoWorkbenchApi get _api => GeoWorkbenchApi(_baseUrl.text.trim());

  @override
  void dispose() {
    _baseUrl.dispose();
    _newCode.dispose();
    _fromDepth.dispose();
    _toDepth.dispose();
    _lithology.dispose();
    _remarks.dispose();
    super.dispose();
  }

  Future<void> _run(String label, Future<Map<String, dynamic>> Function() action) async {
    setState(() {
      _busy = true;
      _status = '$label...';
    });
    try {
      final result = await action();
      final borehole = result['borehole'] as Map<String, dynamic>?;
      setState(() {
        _createdBoreholeId = borehole?['id'] as int? ?? _createdBoreholeId;
        _status = result['message']?.toString() ?? 'Done';
      });
    } catch (error) {
      setState(() => _status = error.toString());
    } finally {
      setState(() => _busy = false);
    }
  }

  Future<void> _pickAndUpload() async {
    if (_createdBoreholeId == null) {
      setState(() => _status = 'Create a mobile demo borehole first.');
      return;
    }
    final result = await FilePicker.platform.pickFiles();
    final path = result?.files.single.path;
    if (path == null) return;
    await _run(
      'Uploading $_fileType file',
      () => _api.uploadSourceFile(
        boreholeId: _createdBoreholeId!,
        fileType: _fileType,
        filePath: path,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('GeoWorkbench Field Sync')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _Section(
            title: 'Backend',
            children: [
              TextField(
                controller: _baseUrl,
                decoration: const InputDecoration(labelText: 'API base URL'),
              ),
            ],
          ),
          _Section(
            title: 'Demo Borehole Copy',
            children: [
              DropdownButtonFormField<int>(
                initialValue: _sourceBoreholeId,
                decoration: const InputDecoration(labelText: 'Source borehole'),
                items: const [
                  DropdownMenuItem(value: 6, child: Text('CTSJ-30-P-02')),
                  DropdownMenuItem(value: 7, child: Text('CTSJ-30-P-02-AI-TEST')),
                ],
                onChanged: (value) => setState(() => _sourceBoreholeId = value ?? 6),
              ),
              TextField(
                controller: _newCode,
                decoration: const InputDecoration(labelText: 'New borehole code'),
              ),
              FilledButton.icon(
                onPressed: _busy
                    ? null
                    : () => _run(
                          'Creating mobile demo copy',
                          () => _api.createDemoCopy(
                            sourceBoreholeId: _sourceBoreholeId,
                            newCode: _newCode.text.trim(),
                          ),
                        ),
                icon: const Icon(Icons.sync),
                label: const Text('Create Mobile Demo Borehole'),
              ),
            ],
          ),
          _Section(
            title: 'Append Field Interval',
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _fromDepth,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'From depth'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _toDepth,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'To depth'),
                    ),
                  ),
                ],
              ),
              TextField(
                controller: _lithology,
                decoration: const InputDecoration(labelText: 'Lithology'),
              ),
              TextField(
                controller: _remarks,
                decoration: const InputDecoration(labelText: 'Remarks'),
                minLines: 2,
                maxLines: 3,
              ),
              FilledButton.icon(
                onPressed: _busy || _createdBoreholeId == null
                    ? null
                    : () => _run(
                          'Submitting field interval',
                          () => _api.submitFieldInterval(
                            boreholeId: _createdBoreholeId!,
                            fromDepth: double.parse(_fromDepth.text),
                            toDepth: double.parse(_toDepth.text),
                            lithologyCode: _lithology.text.trim(),
                            remarks: _remarks.text.trim(),
                          ),
                        ),
                icon: const Icon(Icons.upload),
                label: const Text('Sync Field Interval'),
              ),
            ],
          ),
          _Section(
            title: 'Upload Field File',
            children: [
              DropdownButtonFormField<String>(
                initialValue: _fileType,
                decoration: const InputDecoration(labelText: 'File type'),
                items: const [
                  DropdownMenuItem(value: 'excel', child: Text('Excel workbook')),
                  DropdownMenuItem(value: 'las', child: Text('Geophysical LAS')),
                  DropdownMenuItem(value: 'corebox_image', child: Text('Corebox image')),
                  DropdownMenuItem(value: 'site_photo', child: Text('Site photo')),
                ],
                onChanged: (value) => setState(() => _fileType = value ?? 'excel'),
              ),
              FilledButton.icon(
                onPressed: _busy || _createdBoreholeId == null ? null : _pickAndUpload,
                icon: const Icon(Icons.attach_file),
                label: const Text('Upload File'),
              ),
            ],
          ),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Status', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text(_status),
                  if (_createdBoreholeId != null) ...[
                    const SizedBox(height: 8),
                    Text('Central borehole id: $_createdBoreholeId'),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 10),
            ...children.map(
              (child) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: child,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
