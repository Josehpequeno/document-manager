#!/bin/bash

# Iniciar o PostgreSQL
service postgresql start

# Navegar para o diretório da aplicação React
cd /app/docbeaver

# Iniciar a aplicação React
npm start &

# Esperar um pouco antes de continuar
sleep 5

# Iniciar a aplicação Go
/app/main
