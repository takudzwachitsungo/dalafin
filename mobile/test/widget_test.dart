import 'package:flutter_test/flutter_test.dart';
import 'package:dalafin/main.dart';

void main() {
  testWidgets('Dalafin App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const DalafinApp());
    expect(find.text('Dalafin'), findsWidgets);
  });
}
