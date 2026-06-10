// ecosystem.config.js — PM2
module.exports = {
  apps: [
    {
      name: 'inp-backend',
      script: './backend/dist/server.js',
      instances: 'max',         // usa todos os núcleos da CPU
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '500M',
      restart_delay: 3000,
      watch: false,
    },
    {
      name: 'inp-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: './frontend',
      instances: 2,
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      max_memory_restart: '400M',
      restart_delay: 3000,
      watch: false,
    },
  ],
}
