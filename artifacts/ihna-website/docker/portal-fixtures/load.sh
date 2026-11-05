#!/usr/bin/env bash
# Load the portal fixtures into the portal-mysql container (docker compose up -d portal-mysql first).
# Dev fixture container only: its credentials are the ones in docker-compose.yml. Never point this at a real portal.
# After loading, the read user is restricted to SELECT (docker's MYSQL_USER gets ALL on the database by default).
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
container="${PORTAL_FIXTURE_CONTAINER:-ihna-web-portal-mysql-1}"
db="${PORTAL_FIXTURE_DB:-ihna_portal}"
root_pw="${PORTAL_FIXTURE_ROOT_PASSWORD:-root}"

mysql_root() { docker exec -i -e MYSQL_PWD="$root_pw" "$container" mysql -uroot --default-character-set=utf8mb4 "$@"; }

for i in $(seq 1 60); do
  if mysql_root -e 'SELECT 1' >/dev/null 2>&1; then break; fi
  [ "$i" = 60 ] && { echo "portal-mysql did not become ready" >&2; exit 1; }
  sleep 1
done

mysql_root "$db" < "$here/schema.sql"
mysql_root "$db" < "$here/data.sql"
# IHNA-only tables and rows (additive: new tables, new ids). Skipped when the files are absent (ihm-web).
[ -f "$here/ihna.schema.sql" ] && mysql_root "$db" < "$here/ihna.schema.sql"
[ -f "$here/ihna.data.sql" ] && mysql_root "$db" < "$here/ihna.data.sql"
mysql_root "$db" < "$here/payments.schema.sql"
mysql_root "$db" < "$here/payments.data.sql"
mysql_root -e "REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'portal_ro'@'%'; GRANT SELECT ON \`$db\`.* TO 'portal_ro'@'%'; FLUSH PRIVILEGES;"
# The write-limited payments user (45-payments §2): SELECT, INSERT and column-level UPDATE on `payments` only. No DELETE, no other table.
pay_user="${PORTAL_FIXTURE_PAY_USER:-portal_pay}"
pay_pw="${PORTAL_FIXTURE_PAY_PASSWORD:-portal_pay}"
mysql_root -e "CREATE USER IF NOT EXISTS '$pay_user'@'%' IDENTIFIED BY '$pay_pw'; REVOKE ALL PRIVILEGES, GRANT OPTION FROM '$pay_user'@'%'; \
GRANT SELECT, INSERT ON \`$db\`.payments TO '$pay_user'@'%'; \
GRANT UPDATE (status, paid_amount, paymentdate, payment_gateway, payment_number, response_code, payment_status, payment_response, type, sp_status, sp_bankTransactionId, sp_gatewayResponseCode, sp_gatewayResponseMessage, sp_orderId, sp_dcc_orderId, aw_intent_id) ON \`$db\`.payments TO '$pay_user'@'%'; FLUSH PRIVILEGES;"
echo "portal fixtures loaded into $db (read user portal_ro: SELECT only; payments user $pay_user: payments only, no DELETE)"
