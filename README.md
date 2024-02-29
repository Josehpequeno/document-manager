# document-manager

Go API para gerenciar documentos com frontend em React.

## Clone o Repositório

```shell
git clone https://github.com/Josehpequeno/document-manager.git
cd document-manager
```

## Executar última versão com docker-compose

```shell
cd docker && docker-compose up -d
```

Se os containers estiverem parados, execute o seguinte comando:

```shell
docker-compose start
```

O Postgres estará rodando na porta 5432, o pgAdmin na porta 8080 e a aplicação na porta 3450 de acordo com as credenciais no arquivo docker-compose.yml.

## Iniciar variáveis de ambiente

```shell
chmod +x .initENV.sh && source .initENV.sh
```

## Gerar Documentação Swagger

### Instalar Swag

```shell
go install github.com/swaggo/swag/cmd/swag@latest
```

### Executar Swag

```shell
swag init --parseDependency --parseInternal
```

### Rota Swagger

A documentação Swagger pode ser acessada em [http://localhost:3450/swagger/index.html](http://localhost:3450/swagger/index.html).

## Testes

Testar handlers:

```shell
cd api/handlers/ && GIN_MODE=release go test
```

## Requisitos do Sistema

Certifique-se de ter o Docker e o Docker Compose instalados.

## Link para o Repositório no DockerHub

A imagem Docker do projeto está disponível no [repositório do DockerHub](https://hub.docker.com/r/josehpequeno/document-manager).

* Executar com Docker
  Para executar a aplicação com Docker, use o seguinte comando:

  ```shell
  docker run -it --name test-document-manager -p 8080:3450 -p 3000:3000 josehpequeno/document-manager:latest
  ```
  Isso irá iniciar a aplicação no contêiner Docker e expor as portas 8080 e 3000 para os respectivos serviços.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE).