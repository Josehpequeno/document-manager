# resume-manager
go api test for resume manager

### Iniciando Banco de dados postgres
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
