import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:image_picker/image_picker.dart';

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
  final _baseUrl = TextEditingController(text: 'http://10.0.2.2:8081');
  final _newCode = TextEditingController(text: 'CTSJ-30-P-02-ANDROID-DEMO');
  final _projectCode = TextEditingController(text: 'DEMO-COAL');
  final _projectName = TextEditingController(text: 'Demo Coal Block');
  final _siteCode = TextEditingController(text: 'MOBILE-SITE');
  final _emptyBoreholeCode = TextEditingController(text: 'MOBILE-BH-001');
  final _emptyBoreholeTitle = TextEditingController(text: 'Mobile field borehole');
  final _emptyTotalDepth = TextEditingController(text: '0');
  final _state = TextEditingController(text: 'Jharkhand');
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
  String _cameraType = 'corebox_image';
  int _sourceBoreholeId = 6;
  int? _createdBoreholeId;
  String _status = 'Ready';
  String _busyLabel = '';
  String _openSection = 'create-empty';
  bool _busy = false;

  GeoWorkbenchApi get _api => GeoWorkbenchApi(_baseUrl.text.trim());
  final _imagePicker = ImagePicker();

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
    _projectCode.dispose();
    _projectName.dispose();
    _siteCode.dispose();
    _emptyBoreholeCode.dispose();
    _emptyBoreholeTitle.dispose();
    _emptyTotalDepth.dispose();
    _state.dispose();
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
      _busyLabel = label;
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
      setState(() {
        _busy = false;
        _busyLabel = '';
      });
    }
  }

  Future<void> _pickAndUpload() async {
    if (_createdBoreholeId == null) {
      setState(() => _status = 'Create a mobile demo borehole first.');
      return;
    }
    setState(() => _status = 'Opening Android file picker...');
    final result = await FilePicker.platform.pickFiles(withData: false);
    final file = result?.files.single;
    final path = file?.path;
    if (path == null) {
      setState(
        () => _status =
            'Could not open selected file. Try placing it in Downloads, then pick it from Files > Downloads.',
      );
      return;
    }
    await _run(
      'Uploading ${file?.name ?? _fileType}',
      () => _api.uploadSourceFile(
        boreholeId: _createdBoreholeId!,
        fileType: _fileType,
        filePath: path,
      ),
    );
  }

  Future<void> _captureAndUpload() async {
    if (_createdBoreholeId == null) {
      setState(() => _status = 'Create a mobile demo borehole first.');
      return;
    }
    setState(() => _status = 'Opening camera...');
    final image = await _imagePicker.pickImage(
      source: ImageSource.camera,
      imageQuality: 82,
      maxWidth: 1800,
    );
    if (image == null) {
      setState(() => _status = 'Camera cancelled.');
      return;
    }
    await _run(
      'Uploading captured ${_cameraType.replaceAll('_', ' ')}',
      () => _api.uploadSourceFile(
        boreholeId: _createdBoreholeId!,
        fileType: _cameraType,
        filePath: image.path,
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
          StatusBanner(status: _status, busy: _busy, busyLabel: _busyLabel),
          _Section(
            id: 'backend',
            openId: _openSection,
            onToggle: _toggleSection,
            title: 'Backend',
            children: [
              TextField(
                controller: _baseUrl,
                decoration: const InputDecoration(labelText: 'API base URL'),
              ),
            ],
          ),
          _Section(
            id: 'create-empty',
            openId: _openSection,
            onToggle: _toggleSection,
            title: 'Create Empty Borehole',
            children: [
              TextField(
                controller: _projectCode,
                decoration: const InputDecoration(labelText: 'Project code'),
              ),
              TextField(
                controller: _projectName,
                decoration: const InputDecoration(labelText: 'Project name'),
              ),
              TextField(
                controller: _siteCode,
                decoration: const InputDecoration(labelText: 'Site / block code'),
              ),
              TextField(
                controller: _emptyBoreholeCode,
                decoration: const InputDecoration(labelText: 'Borehole code'),
              ),
              TextField(
                controller: _emptyBoreholeTitle,
                decoration: const InputDecoration(labelText: 'Title'),
              ),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _emptyTotalDepth,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Current depth'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _state,
                      decoration: const InputDecoration(labelText: 'State'),
                    ),
                  ),
                ],
              ),
              FilledButton.icon(
                onPressed: _busy
                    ? null
                    : () => _run(
                          'Creating empty borehole',
                          () => _api.createEmptyBorehole(
                            projectCode: _projectCode.text.trim(),
                            projectName: _projectName.text.trim(),
                            siteCode: _siteCode.text.trim(),
                            boreholeCode: _emptyBoreholeCode.text.trim(),
                            title: _emptyBoreholeTitle.text.trim(),
                            totalDepth: _optionalNumber(_emptyTotalDepth) ?? 0,
                            state: _state.text.trim(),
                          ),
                        ),
                icon: const Icon(Icons.add_location_alt),
                label: Text(_busy && _busyLabel == 'Creating empty borehole'
                    ? 'Creating...'
                    : 'Create Empty Borehole'),
              ),
            ],
          ),
          _Section(
            id: 'clone',
            openId: _openSection,
            onToggle: _toggleSection,
            title: 'Create Demo Borehole Copy',
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
                label: Text(_busy && _busyLabel == 'Creating mobile demo copy'
                    ? 'Cloning...'
                    : 'Clone Existing Borehole'),
              ),
            ],
          ),
          _Section(
            id: 'field-entry',
            openId: _openSection,
            onToggle: _toggleSection,
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
                label: Text(_busy && _busyLabel == 'Submitting field interval'
                    ? 'Syncing...'
                    : 'Sync Field Interval'),
              ),
            ],
          ),
          _Section(
            id: 'upload',
            openId: _openSection,
            onToggle: _toggleSection,
            title: 'Upload Field File',
            children: [
              DropdownButtonFormField<String>(
                initialValue: _fileType,
                decoration: const InputDecoration(labelText: 'File type'),
                items: const [
                  DropdownMenuItem(value: 'excel', child: Text('Excel workbook')),
                  DropdownMenuItem(value: 'las', child: Text('Geophysical LAS')),
                  DropdownMenuItem(value: 'geophysical_pdf', child: Text('Geophysical PDF')),
                  DropdownMenuItem(value: 'corebox_image', child: Text('Corebox image')),
                  DropdownMenuItem(value: 'site_photo', child: Text('Site photo')),
                ],
                onChanged: (value) => setState(() => _fileType = value ?? 'excel'),
              ),
              FilledButton.icon(
                onPressed: _busy || _createdBoreholeId == null ? null : _pickAndUpload,
                icon: const Icon(Icons.attach_file),
                label: Text(_busy && _busyLabel.startsWith('Uploading')
                    ? 'Uploading...'
                    : 'Upload File'),
              ),
              DropdownButtonFormField<String>(
                initialValue: _cameraType,
                decoration: const InputDecoration(labelText: 'Camera capture type'),
                items: const [
                  DropdownMenuItem(value: 'corebox_image', child: Text('Corebox image')),
                  DropdownMenuItem(value: 'site_photo', child: Text('Site photo')),
                ],
                onChanged: (value) => setState(() => _cameraType = value ?? 'corebox_image'),
              ),
              FilledButton.icon(
                onPressed: _busy || _createdBoreholeId == null ? null : _captureAndUpload,
                icon: const Icon(Icons.photo_camera),
                label: Text(_busy && _busyLabel.startsWith('Uploading captured')
                    ? 'Uploading photo...'
                    : 'Capture & Upload Photo'),
              ),
            ],
          ),
          _Section(
            id: 'status',
            openId: _openSection,
            onToggle: _toggleSection,
            title: 'Status',
            children: [
              Text(_status),
              if (_createdBoreholeId != null) Text('Central borehole id: $_createdBoreholeId'),
            ],
          ),
        ],
      ),
    );
  }

  void _toggleSection(String id) {
    setState(() => _openSection = _openSection == id ? '' : id);
  }
}

class StatusBanner extends StatelessWidget {
  const StatusBanner({
    super.key,
    required this.status,
    required this.busy,
    required this.busyLabel,
  });

  final String status;
  final bool busy;
  final String busyLabel;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      color: busy ? Theme.of(context).colorScheme.secondaryContainer : null,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            if (busy) ...[
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(
                busy && busyLabel.isNotEmpty ? '$busyLabel...' : status,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({
    required this.id,
    required this.openId,
    required this.onToggle,
    required this.title,
    required this.children,
  });

  final String id;
  final String openId;
  final ValueChanged<String> onToggle;
  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          ListTile(
            title: Text(title, style: Theme.of(context).textTheme.titleMedium),
            trailing: Icon(isOpen ? Icons.expand_less : Icons.expand_more),
            onTap: () => onToggle(id),
          ),
          if (isOpen)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: children.map(
                  (child) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: child,
                  ),
                ).toList(),
              ),
            ),
        ],
      ),
    );
  }

  bool get isOpen => id == openId;
}
