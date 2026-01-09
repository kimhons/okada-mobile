module.exports = {
  apps: [{
    name: 'payment-service',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3005
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3005
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    restart_delay: 4000,
    max_restarts: 5,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 10000,
    watch: false,
    ignore_watch: [
      'node_modules',
      'logs',
      'dist'
    ],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    autorestart: true
  }]
};