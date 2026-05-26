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
  final _runFromDepth = TextEditingController(text: '525.0');
  final _runToDepth = TextEditingController(text: '528.0');
  final _lithologyFromDepth = TextEditingController(text: '525.0');
  final _lithologyThickness = TextEditingController(text: '1.2');
  final _recovery = TextEditingController(text: '1.1');
  final _recoveryPercent = TextEditingController(text: '91.7');
  final _lithology = TextEditingController(text: 'COAL');
  final _lithologyLabel = TextEditingController(text: 'Coal');
  final _grainSize = TextEditingController();
  final _loggedColor = TextEditingController(text: 'BLACK');
  final _rqd = TextEditingController(text: '70');
  final _structuralFeatures = TextEditingController(text: 'Banded, dull to bright');
  final _coreDip = TextEditingController();
  final _seamName = TextEditingController(text: 'LOCAL');
  final _remarks = TextEditingController(text: 'Android demo interval from field app');
  String _fileType = 'excel';
  int _sourceBoreholeId = 6;
  int? _createdBoreholeId;
  String _status = 'Ready';
  bool _busy = false;

  GeoWorkbenchApi get _api => GeoWorkbenchApi(_baseUrl.text.trim());

  bool get _canSyncInterval =>
      !_busy &&
      _createdBoreholeId != null &&
      _runFromDepth.text.trim().isNotEmpty &&
      _runToDepth.text.trim().isNotEmpty &&
      _lithologyFromDepth.text.trim().isNotEmpty &&
      _lithologyThickness.text.trim().isNotEmpty &&
      _recovery.text.trim().isNotEmpty &&
      _lithology.text.trim().isNotEmpty;

  @override
  void dispose() {
    _baseUrl.dispose();
    _newCode.dispose();
    _runFromDepth.dispose();
    _runToDepth.dispose();
    _lithologyFromDepth.dispose();
    _lithologyThickness.dispose();
    _recovery.dispose();
    _recoveryPercent.dispose();
    _lithology.dispose();
    _lithologyLabel.dispose();
    _grainSize.dispose();
    _loggedColor.dispose();
    _rqd.dispose();
    _structuralFeatures.dispose();
    _coreDip.dispose();
    _seamName.dispose();
    _remarks.dispose();
    super.dispose();
  }

  double _number(TextEditingController controller) => double.parse(controller.text.trim());

  double? _optionalNumber(TextEditingController controller) {
    final text = controller.text.trim();
    if (text.isEmpty) return null;
    return double.parse(text);
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

  Future<void> _syncStructuredInterval() async {
    await _run(
      'Submitting field interval',
      () => _api.submitFieldInterval(
        boreholeId: _createdBoreholeId!,
        runFromDepth: _number(_runFromDepth),
        runToDepth: _number(_runToDepth),
        lithologyFromDepth: _number(_lithologyFromDepth),
        lithologyThickness: _number(_lithologyThickness),
        recovery: _number(_recovery),
        recoveryPercent: _optionalNumber(_recoveryPercent),
        lithologyCode: _lithology.text.trim(),
        lithologyLabel: _lithologyLabel.text.trim(),
        loggedColor: _loggedColor.text.trim(),
        seamName: _seamName.text.trim(),
        rqd: _optionalNumber(_rqd),
        structuralFeatures: _structuralFeatures.text.trim(),
        grainSize: _grainSize.text.trim(),
        coreDip: _coreDip.text.trim(),
        remarks: _remarks.text.trim(),
      ),
    );
    if (!_status.startsWith('Exception')) {
      _prepareNextInterval();
    }
  }

  void _prepareNextInterval() {
    final nextFrom = _number(_lithologyFromDepth) + _number(_lithologyThickness);
    final nextRunTo = nextFrom + 3;
    setState(() {
      _runFromDepth.text = nextFrom.toStringAsFixed(2);
      _runToDepth.text = nextRunTo.toStringAsFixed(2);
      _lithologyFromDepth.text = nextFrom.toStringAsFixed(2);
      _lithologyThickness.clear();
      _recovery.clear();
      _recoveryPercent.clear();
      _lithology.clear();
      _lithologyLabel.clear();
      _grainSize.clear();
      _loggedColor.clear();
      _rqd.clear();
      _structuralFeatures.clear();
      _coreDip.clear();
      _seamName.clear();
      _remarks.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 12,
        title: Row(
          children: [
            SizedBox(
              height: 38,
              width: 132,
              child: Image.asset(
                'assets/branding/simpro-logo.png',
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 10),
            const Expanded(child: Text('GeoWorkbench Field Sync')),
          ],
        ),
      ),
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
            title: 'Structured Field Log Entry',
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _runFromDepth,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Run from'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _runToDepth,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Run to'),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _lithologyFromDepth,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Lithology from'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _lithologyThickness,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Thickness'),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _recovery,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Recovery m'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _recoveryPercent,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Recovery %'),
                    ),
                  ),
                ],
              ),
              TextField(
                controller: _lithology,
                decoration: const InputDecoration(labelText: 'Lithology code'),
              ),
              TextField(
                controller: _lithologyLabel,
                decoration: const InputDecoration(labelText: 'Lithology label'),
              ),
              TextField(
                controller: _grainSize,
                decoration: const InputDecoration(labelText: 'Grain size'),
              ),
              TextField(
                controller: _loggedColor,
                decoration: const InputDecoration(labelText: 'Colour'),
              ),
              TextField(
                controller: _rqd,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'RQD %'),
              ),
              TextField(
                controller: _structuralFeatures,
                decoration: const InputDecoration(labelText: 'Structural / sedimentary features'),
                minLines: 2,
                maxLines: 3,
              ),
              TextField(
                controller: _coreDip,
                decoration: const InputDecoration(labelText: 'Core dip'),
              ),
              TextField(
                controller: _seamName,
                decoration: const InputDecoration(labelText: 'Seam'),
              ),
              TextField(
                controller: _remarks,
                decoration: const InputDecoration(labelText: 'Remarks'),
                minLines: 2,
                maxLines: 3,
              ),
              FilledButton.icon(
                onPressed: _canSyncInterval ? _syncStructuredInterval : null,
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
