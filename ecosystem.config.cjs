module.exports = {
  apps: [
    {
      name: 'auth-server',
      script: './auth-server.js',
      interpreter: 'bun',
      instances: 1,
      exec_mode: 'fork',
      env_file: '.env.auth',
      env_production: {
        NODE_ENV: 'production',
        AUTH_PORT: 3001
      },
      max_memory_restart: '500M',
      error_file: './logs/auth-server-error.log',
      out_file: './logs/auth-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
      wait_ready: false,
      shutdown_with_message: true
    }
  ]
}
