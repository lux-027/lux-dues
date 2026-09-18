#!/bin/bash

# Database Backup Script for LuxDues
# This script backs up the PostgreSQL database and uploads to S3 (optional)
# Run via cron: 0 2 * * * /path/to/backup-db.sh

# Load environment variables
set -a
source /path/to/.env
set +a

# Configuration
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/luxdues_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Run pg_dump
echo "Starting database backup at ${TIMESTAMP}"
pg_dump ${DATABASE_URL} > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
  echo "Backup completed successfully: ${BACKUP_FILE}"
  
  # Compress the backup
  gzip ${BACKUP_FILE}
  BACKUP_FILE="${BACKUP_FILE}.gz"
  echo "Backup compressed: ${BACKUP_FILE}"
  
  # Optional: Upload to S3 (uncomment if using AWS S3)
  # aws s3 cp ${BACKUP_FILE} s3://your-bucket/luxdues-backups/
  
  # Clean up old backups
  echo "Cleaning up backups older than ${RETENTION_DAYS} days"
  find ${BACKUP_DIR} -name "luxdues_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
  
  echo "Backup process completed"
else
  echo "Backup failed!"
  exit 1
fi
