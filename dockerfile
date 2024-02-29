# Use uma imagem oficial do Go como base
FROM golang:1.18 AS builder

# Configure o diretório de trabalho
WORKDIR /app

# Copie o código-fonte para o contêiner
COPY . .

# Executa o comando de build
RUN go build -o main .

# Imagem base do Ubuntu
FROM ubuntu:latest

# Atualize os pacotes e instale o PostgreSQL
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update -q \
    && apt-get install -y -q postgresql postgresql-contrib

# Exponha o diretório de dados do PostgreSQL para persistência
VOLUME /var/lib/postgresql/data

# Copie o binário do primeiro estágio
COPY --from=builder /app/main /app/main

# Copie os arquivos da aplicação React
COPY docbeaver /app/docbeaver

# Instale o Node.js e npm
RUN apt-get update && apt-get install -y nodejs npm

# Instale as dependências e construa a aplicação React
WORKDIR /app/docbeaver
RUN npm install && npm run build

# Exponha a porta necessária pelo seu aplicativo React
EXPOSE 3000

# Defina as variáveis de ambiente
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_NAME=documentmanager
ENV API_SECRET=tESTEsecret

# Inicie o PostgreSQL e crie o banco de dados
    #su postgres -c 'createuser -s postgres' && \
RUN service postgresql start && \
    su postgres -c 'createdb documentmanager' && \
    su - postgres -c "psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres';\""

# Copiar o script de inicialização
COPY start.sh /app/start.sh

# Dar permissão de execução para o script de inicialização
RUN chmod +x /app/start.sh

# Configurar o diretório de trabalho
WORKDIR /app

# Definir o comando de inicialização como o script
CMD ["/app/start.sh"]
