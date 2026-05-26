import 'dart:convert';

import 'package:http/http.dart' as http;

class GeoWorkbenchApi {
  GeoWorkbenchApi(this.baseUrl);

  final String baseUrl;

  Uri _uri(String path) => Uri.parse('$baseUrl$path');

  Future<Map<String, dynamic>> createDemoCopy({
    required int sourceBoreholeId,
    required String newCode,
  }) async {
    final response = await http.post(
      _uri('/api/mobile/demo-copy'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'source_borehole_id': sourceBoreholeId,
        'new_code': newCode,
        'title_suffix': '(Android field sync demo)',
        'submitted_by': 'android-demo-user',
      }),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> submitFieldInterval({
    required int boreholeId,
    required double runFromDepth,
    required double runToDepth,
    required double lithologyFromDepth,
    required double lithologyThickness,
    required double recovery,
    required double? recoveryPercent,
    required String lithologyCode,
    required String lithologyLabel,
    required String loggedColor,
    required String seamName,
    required double? rqd,
    required String structuralFeatures,
    required String grainSize,
    required String coreDip,
    required String remarks,
  }) async {
    final toDepth = lithologyFromDepth + lithologyThickness;
    final response = await http.post(
      _uri('/api/mobile/field-submissions'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'borehole_id': boreholeId,
        'submitted_by': 'android-demo-user',
        'current_depth': toDepth,
        'remarks': remarks,
        'payload': {
          'form_template': 'ctsj_descriptive_mobile_v1',
          'run_from_depth': runFromDepth,
          'run_to_depth': runToDepth,
          'lithology_from_depth': lithologyFromDepth,
          'lithology_thickness': lithologyThickness,
          'grain_size': grainSize,
          'core_dip': coreDip,
        },
        'apply_to_log': true,
        'lithology_intervals': [
          {
            'from_depth': lithologyFromDepth,
            'to_depth': toDepth,
            'lithology_code': lithologyCode,
            'lithology_label': lithologyLabel.isEmpty ? lithologyCode : lithologyLabel,
            'logged_color': loggedColor,
            'seam_name': seamName,
            'recovery': recovery,
            'recovery_percent': recoveryPercent,
            'rqd': rqd == null ? null : rqd / 100,
            'structural_features': [
              if (grainSize.isNotEmpty) 'Grain: $grainSize',
              if (structuralFeatures.isNotEmpty) structuralFeatures,
              if (coreDip.isNotEmpty) 'Core dip: $coreDip',
            ].join(' | '),
            'remark': remarks,
          }
        ],
      }),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> uploadSourceFile({
    required int boreholeId,
    required String fileType,
    required String filePath,
  }) async {
    final request = http.MultipartRequest('POST', _uri('/api/mobile/uploads'));
    request.fields['borehole_id'] = boreholeId.toString();
    request.fields['file_type'] = fileType;
    request.files.add(await http.MultipartFile.fromPath('file', filePath));
    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final body = response.body.isEmpty ? <String, dynamic>{} : jsonDecode(response.body);
    if (response.statusCode >= 400) {
      throw Exception('HTTP ${response.statusCode}: $body');
    }
    return body as Map<String, dynamic>;
  }
}
