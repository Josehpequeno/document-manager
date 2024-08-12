#!/bin/bash

# Iniciar o PostgreSQL
service postgresql start

# Iniciar a aplicação Go
source .initENV.sh

/app/main &

# Esperar um pouco antes de continuar
sleep 5

# Navegar para o diretório da aplicação React
cd /app/docbeaver

# Iniciar a aplicação React
serve -n -s build
