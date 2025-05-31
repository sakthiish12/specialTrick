import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const execAsync = promisify(exec);

async function runBackup() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const backupDir = './backups';
  const contentDir = './content';
  const maxBackups = 5; // Keep the last 5 backups

  if (!databaseUrl) {
    console.error('Error: DATABASE_URL or POSTGRES_URL environment variable is not set');
    process.exit(1);
  }

  try {
    console.log('Starting backup process...');
    
    // Create backup directory if it doesn't exist
    await mkdir(backupDir, { recursive: true });
    
    // Generate timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbBackupPath = join(backupDir, `db-backup-${timestamp}.sql`);
    
    // Create database backup using pg_dump
    console.log('Backing up database...');
    await execAsync(`pg_dump ${databaseUrl} > ${dbBackupPath}`);
    console.log(`Database backup completed: ${dbBackupPath}`);
    
    // Backup content directory (if it exists)
    let contentBackupPath = null;
    try {
      console.log('Backing up content...');
      contentBackupPath = join(backupDir, `content-${timestamp}.zip`);
      await execAsync(`zip -r ${contentBackupPath} ${contentDir} || true`);
      console.log(`Content backup completed: ${contentBackupPath}`);
    } catch (error) {
      console.warn('Warning: Content backup failed, continuing with database backup only');
      console.error(error);
    }
    
    // Cleanup old backups
    console.log('Cleaning up old backups...');
    const files = await readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('db-backup-') || file.startsWith('content-'))
      .sort()
      .reverse();
    
    // Keep only the most recent maxBackups backups
    const filesToDelete = backupFiles.slice(maxBackups);
    
    for (const file of filesToDelete) {
      const filePath = join(backupDir, file);
      console.log(`Deleting old backup: ${filePath}`);
      await unlink(filePath).catch(console.error);
    }
    
    console.log('Backup process completed successfully');
  } catch (error) {
    console.error('Backup process failed:');
    console.error(error);
    process.exit(1);
  }
}

runBackup();