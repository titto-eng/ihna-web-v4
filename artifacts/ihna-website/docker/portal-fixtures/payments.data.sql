-- Fixture rows for `payments`: synthetic legacy rows only (no real students, emails or invoices). Ids start at 100000 (AUTO_INCREMENT in the schema).
SET NAMES utf8mb4;
INSERT INTO payments (student_name, studentid, invoice_number, payment_type_id, email, payment_for, e2payment, amount, total, paid_amount, payment_gateway, applydate, created, paymentdate, ip_address, status, payment_number, response_code, payment_status) VALUES
  ('Fixture Student One', '0', 'FIX-INV-0001', 2, 'student.one@example.test', 'Tuition', 'no', 1250.00, 1250.00, 1250.00, 'payway', '2026-09-01', '2026-09-01 10:00:00', '2026-09-01 10:04:00', '203.0.113.10', 1, 'FIXPN0001', '08', 'approved'),
  ('Fixture Student Two', '0', 'FIX-INV-0002', 2, 'student.two@example.test', 'Tuition', 'no', 800.00, 800.00, NULL, 'payway', '2026-09-02', '2026-09-02 11:00:00', NULL, '203.0.113.11', 0, NULL, NULL, NULL),
  ('Fixture E2 Buyer', '0', 'FIX-E2-0001', 2, 'e2.buyer@example.test', 'IELTS Academic preparation package', 'yes', 150.00, 150.00, 150.00, 'securepay', '2026-09-03', '2026-09-03 09:00:00', '2026-09-03 09:02:00', '203.0.113.12', 1, NULL, NULL, NULL);
