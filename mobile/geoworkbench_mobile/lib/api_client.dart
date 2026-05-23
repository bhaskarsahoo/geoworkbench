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
    required double fromDepth,
    required double toDepth,
    required String lithologyCode,
    required String remarks,
  }) async {
    final thickness = toDepth - fromDepth;
    final response = await http.post(
      _uri('/api/mobile/field-submissions'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'borehole_id': boreholeId,
        'submitted_by': 'android-demo-user',
        'current_depth': toDepth,
        'remarks': remarks,
        'apply_to_log': true,
        'lithology_intervals': [
          {
            'from_depth': fromDepth,
            'to_depth': toDepth,
            'lithology_code': lithologyCode,
            'lithology_label': lithologyCode,
            'recovery': thickness,
            'recovery_percent': 100,
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
