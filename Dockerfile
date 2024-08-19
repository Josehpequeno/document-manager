# Etapa de build do frontend
FROM node:20 AS build-frontend

WORKDIR /app/frontend

ARG REACT_APP_LOCAL_IP
ENV REACT_APP_LOCAL_IP=${REACT_APP_LOCAL_IP}

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
    && apt-get install -y -q postgresql postgresql-contrib nginx bash curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar a versão 20 do nodejs
RUN curl -sL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh

RUN bash nodesource_setup.sh && apt-get install -y nodejs

# Instalar o serve para servir a aplicação React
RUN npm install -g serve

# Exponha o diretório de dados do PostgreSQL para persistência
VOLUME /var/lib/postgresql/data

# Configurar o diretório de trabalho
WORKDIR /root/

# Inicie o PostgreSQL e crie o banco de dados
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

# Copiar o script de variáveis de ambiente do backend
COPY backend/.initENV.sh /root/.initENV.sh
RUN chmod +x /root/.initENV.sh

# Copie o script de inicialização para o container
COPY start.sh /usr/local/bin/start.sh
# Dê permissão de execução ao script
RUN chmod +x /usr/local/bin/start.sh

# Configurar PostgreSQL
RUN mkdir -p /var/lib/postgresql/data
RUN chown -R postgres:postgres /var/lib/postgresql

# Expor as portas necessárias
EXPOSE 80 3450 5432 3000

# Defina o comando para iniciar o script de inicialização
CMD ["sh", "/usr/local/bin/start.sh"]
