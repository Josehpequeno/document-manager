# document-manager

go api para gerenciar documentos

## Clone o Repositório

```powershell-interactive
git clone https://github.com/Josehpequeno/document-manager.git
cd seu-repositorio
```

## Iniciando Banco de dados postgres

Entrando na pasta de banco de dados

```shell
  cd docker
```

Cria a instância do postgres e pgadmin. Só precisa rodar o comando uma vez.

```shell
 docker-compose up -d
```

Se os containers estiverem parados rode o comando abaixo:

```shell
  docker-compose start
```

Postgres vai está rodando na porta 5432 e o pgadmin na 8080 de acordo com as credenciais no arquivo de docker-compose.yml

## Iniciar variáveis de ambiente

```shell
chmod +x .initENV.sh &&
source .initENV.sh
```

## Gerar doc swagger

### Instalar swag

```shell
go install github.com/swaggo/swag/cmd/swag@latest
```

### Executar swag

```shell
swag init --parseDependency --parseInternal
```

### Rota swag

/swagger/index.html

## Testes

Testar handlers

```
cd api/handlers/ &&
GIN_MODE=release go test
```

## Executar ultima versão com docker-compose

```shell
cd docker && docker-compose up -d
```
