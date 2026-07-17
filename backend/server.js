const app = require('./app');
const config = require('./config/config');
const pool = require('./database/db');
const seed = require('./database/seeds/seed');
const fs = require('fs');
const path = require('path');

function waitForDB(retries = 30, delay = 2000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      pool.query('SELECT 1')
        .then(() => { console.log('Database is ready'); resolve(); })
        .catch((err) => {
          attempts++;
          console.log(`Waiting for database... attempt ${attempts}/${retries}`);
          if (attempts >= retries) {
            reject(new Error('Database connection failed after retries'));
          } else {
            setTimeout(check, delay);
          }
        });
    };
    check();
  });
}

async function initDB() {
  try {
    await waitForDB();
    const migrationsDir = path.join(__dirname, 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      console.log(`Migration ${file} completed`);
    }
    console.log('All database migrations completed');
    await seed();
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

initDB().then(() => {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`ClinicCare API running on port ${config.port}`);
  });
});
