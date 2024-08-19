# document-manager

![Project Logo](frontend/public/android-chrome-192x192.png)

Go API for managing documents with a React frontend.

## Screens
### Landing Page
<img align="center" src="/screens/landingPage.png">

### Login Page
<img align="center" src="/screens/login.png">

### Signup Page
<img align="center" src="/screens/signup.png">

### Home Page
<img align="center" src="/screens/home.png">


<img align="center" src="/screens/homeDelete.png">

### Upload Page
<img align="center" src="/screens/upload.png">

### Settings Page
<img align="center" src="/screens/settings.png">

### PDFviewer Page
<img align="center" src="/screens/pdfviewer.png">

## Clone the Repository

```shell
git clone https://github.com/Josehpequeno/document-manager.git
cd document-manager
```

## Run the latest version with docker-compose

```shell
cd docker && docker-compose up -d
```

If the containers are stopped, run the following command:

```shell
docker-compose start
```

Postgres will run on port 5432, pgAdmin on port 8080, and the application on port 3450, according to the credentials in the docker-compose.yml file.

## Initialize environment variables

```shell
cd backend
```

```shell
chmod +x .initENV.sh && source .initENV.sh
```

## Generate Swagger Documentation

### Install Swag

```shell
go install github.com/swaggo/swag/cmd/swag@latest
```

### Run Swag

```shell
swag init --parseDependency --parseInternal
```

### Swagger Route

A documentação Swagger pode ser acessada em [http://localhost:3450/swagger/index.html](http://localhost:3450/swagger/index.html).

## Tests

Test handlers:

```shell
cd api/handlers/ && GIN_MODE=release go test
```

## System Requirements

Make sure you have Docker and Docker Compose installed.

## Link to repository on DockerHub

The project's Docker image is available in the [DockerHub repository](https://hub.docker.com/r/josehpequeno/document-manager).

* Run with Docker
  To run the application with Docker, use the following command:

  ```shell
  docker run -it --name test-document-manager --network host josehpequeno/document-manager:latest
  ```
  This will start the application in the Docker container and expose ports 3450, 3000 and 80 to the respective services.

## License

This project is licensed under the [MIT License](LICENSE).
