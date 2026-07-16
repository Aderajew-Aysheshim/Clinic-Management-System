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
    const migrationPath = path.join(__dirname, 'database', 'migrations', '001_init.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    await pool.query(migration);
    console.log('Database migrations completed');
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
