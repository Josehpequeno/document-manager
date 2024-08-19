#!/bin/sh

# Obter o IP local do host
LOCAL_IP=$(hostname -I | awk '{print $1}')

# Criar um arquivo de configuração JavaScript com a variável de ambiente
cat <<EOF > /usr/share/nginx/html/env-config.js
window.REACT_APP_LOCAL_IP = '$LOCAL_IP';
EOF

# Executar o script de inicialização do ambiente
. /root/.initENV.sh

# Iniciar o PostgreSQL
service postgresql start

# Iniciar a aplicação principal em segundo plano
./main &

# Iniciar o servidor estático para servir a aplicação React
serve -n -s /usr/share/nginx/html -l 3000 &

# Iniciar o Nginx
nginx -g 'daemon off;'
