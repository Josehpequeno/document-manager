# Use uma imagem oficial do Go como base
FROM golang:1.18-alpine AS builder

# Configure o diretório de trabalho
WORKDIR /app

# Copie o código-fonte para o contêiner
COPY . .

# Executa o comando de build
RUN go build -o main .

# Imagem leve para executar o aplicativo
FROM alpine:latest

# Configurar o diretório de trabalho no segundo estágio
WORKDIR /app

# Copiar binário do primeiro estágio
COPY --from=builder /app/main .

# Expor a porta necessária pelo seu aplicativo
EXPOSE 3450

# Define as variáveis de ambiente
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_NAME=documentmanager
ENV API_SECRET=tESTEsecret

# --------------------
# Agora, inicie a aplicação usando o script de inicialização
CMD ["./main"]
