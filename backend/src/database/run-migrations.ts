import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigrations() {
    console.log('🔌 Connecting to database...');

    // Create connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        multipleStatements: true
    });

    try {
        console.log('✅ Connected!');

        const migrations = [
            'src/database/migrations/add-asignaciones-module.sql',
            'src/database/migrations/update-condicion-fisica-enum.sql'
        ];

        for (const migrationPath of migrations) {
            console.log(`\n📄 Processing: ${migrationPath}`);

            const absolutePath = path.resolve(process.cwd(), migrationPath);
            if (!fs.existsSync(absolutePath)) {
                console.error(`❌ File not found: ${absolutePath}`);
                continue;
            }

            const sql = fs.readFileSync(absolutePath, 'utf8');

            try {
                await connection.query(sql);
                console.log(`✅ Applied successfully`);
            } catch (error: any) {
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`⚠️ Table already exists (skipped)`);
                } else if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️ Column already exists (skipped)`);
                } else {
                    console.error(`❌ Error executing migration: ${error.message}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await connection.end();
        console.log('\n🔌 Connection closed');
    }
}

runMigrations();
