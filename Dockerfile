# Etapa de build do frontend
FROM node:14 AS build-frontend

WORKDIR /app/frontend

COPY frontend/package.json ./
COPY frontend/package-lock.json ./

RUN npm install

COPY frontend ./

RUN npm run build

# Use uma imagem oficial do Go como base
FROM golang:1.22.5 AS build-backend

# Configure o diretório de trabalho
WORKDIR /app/backend

# Copie o código-fonte para o contêiner
COPY backend/go.mod ./
COPY backend/go.sum ./
RUN go mod download
COPY backend ./

# Executa o comando de build
RUN go build -o main .

# Imagem base do Ubuntu
FROM ubuntu:latest

# Atualize os pacotes e instale o PostgreSQL, nginx, npm e nodejs
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update -q \
    && apt-get install -y -q postgresql postgresql-contrib nodejs npm nginx

# Configurar o diretório de trabalho
WORKDIR /root/

# Exponha o diretório de dados do PostgreSQL para persistência
VOLUME /var/lib/postgresql/data

# # Copie o binário do primeiro estágio
# COPY --from=builder /app/main /app/main

# Inicie o PostgreSQL e crie o banco de dados
#su postgres -c 'createuser -s postgres' && \
RUN service postgresql start && \
    su postgres -c 'createdb documentmanager' && \
    su - postgres -c "psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres';\""


# Combinando front, back e database

# Copiar e configurar o backend
COPY --from=build-backend /app/backend/main ./

# Copiar e configurar o frontend
COPY --from=build-frontend /app/frontend/build /usr/share/nginx/html

# Configurar Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar o script de variáveis de ambiente
COPY backend/.initENV.sh /root/.initENV.sh
RUN chmod +x /root/.initENV.sh

# Configurar PostgreSQL
RUN mkdir -p /var/lib/postgresql/data
RUN chown -R postgres:postgres /var/lib/postgresql

# Instalar o serve para servir a aplicação React
RUN npm install -g serve

# Expor as portas necessárias
EXPOSE 80 3450 5432 3000

# Comando para iniciar todos os serviços
CMD ["sh", "-c", ". /root/.initENV.sh && service postgresql start && ./main & serve -n -s /usr/share/nginx/html -l 3000 & nginx -g 'daemon off;'"]
