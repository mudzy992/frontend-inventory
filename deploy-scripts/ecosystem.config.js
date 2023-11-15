module.exports = {
    apps : [{
      name: 'inventory-frontend',
      script: 'npm',
      args: 'start',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT:4001,
      },
      error_file: 'logs/error.log', 
      out_file: 'logs/out.log',     
      log_file: 'logs/all.log', 
      time: true,  
    }],
  
    deploy : {
      production : {
        user : 'administrator',
        host : '77.221.31.121',
        ref  : 'origin/Novi-dizaj-userprofila', 
        repo : 'https://github.com/mudzy992/frontend-inventory.git',
        path : '/home/administrator/Documents/GitHub/frontend-inventory/', #update
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      } 
    }
  };
