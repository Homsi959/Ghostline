#!/bin/bash
set -e

TIMESTAMP=$(date +%F-%H-%M)
BACKUP_DIR="/backups"
FILENAME="db-backup-$TIMESTAMP.sql"

echo "[INFO] Starting backup: $FILENAME"

pg_dump -U postgres ghostline_prod > "$BACKUP_DIR/$FILENAME"

# Очистка бэкапов старше 30 дней
find "$BACKUP_DIR" -type f -name "*.sql" -mtime +30 -exec rm -f {} \;

echo "[INFO] Backup complete. Old backups cleaned."
