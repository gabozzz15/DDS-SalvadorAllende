import { DataSource } from 'typeorm';
import { seedDepartamentos } from './seeds/departamentos.seed';

async function runSeeds() {
    const dataSource = new DataSource({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'basta123',
        database: process.env.DB_DATABASE || 'bienes_salvador_allende',
        entities: ['src/**/*.entity.ts'],
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('🔌 Database connection established');

        await seedDepartamentos(dataSource);

        console.log('✅ All seeds completed successfully!');
    } catch (error) {
        console.error('❌ Error running seeds:', error);
        process.exit(1);
    } finally {
        await dataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}

runSeeds();
