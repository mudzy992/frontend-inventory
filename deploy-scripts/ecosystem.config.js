module.exports = {
    apps : [{
      name: 'inventory-frontend', // Zamijenite s odgovarajućim imenom za vašu aplikaciju
      script: 'npm',
      args: 'start',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT:4001, 
      },
      error_file: 'logs/error.log', // Putanja do datoteke za greške u podfolderu logs
      out_file: 'logs/out.log',     // Putanja do datoteke za standardni izlaz u podfolderu logs
      log_file: 'logs/all.log',     // Putanja do datoteke za sve zapise u podfolderu logs
      time: true,  
    }],
  
    deploy : {
      production : {
        user : 'administrator', // Zamijenite s vašim SSH korisničkim imenom
        host : '77.221.31.121',
        ref  : 'origin/AI-optimizacija', // Zamijenite s imenom vaše produkcione grane
        repo : 'https://github.com/mudzy992/frontend-inventory.git', // Zamijenite sa URL-om vašeg repozitorija
        path : '/home/administrator/Documents/GitHub/frontend-inventory/', // Zamijenite sa stvarnom putanjom na vašem server
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      }
    }
  };
  
  
  
  
  