package main

import (
	"document-manager/api"
	"document-manager/api/models"
	"document-manager/database"
	_ "document-manager/docs"
	"fmt"
	"log"
)

// @title Document manager API
// @version 1.0
// @description This is a sample api of documents manager

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:3450
// @BasePath /api/
// @query.collection.format multi
// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {

	//Inicializar a conexão com o banco de dados
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Erro ao configurar a conexão com o banco de dados: ", err)
	}
	//será executado no final do bloco
	// defer db.Close()

	//executar a migração automática
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("Erro ao criar a tabela 'users': ", err)
	}

	//Inicializar a conexão com o banco de dados
	err = database.InitMasterUser()
	if err != nil {
		log.Fatal("Erro ao criar primeiro usuário master: ", err)
	}

	err = db.AutoMigrate(&models.Document{})
	if err != nil {
		log.Fatal("Erro ao criar a tabela 'Documents': ", err)
	}

	router := api.SetupRouter()

	fmt.Println("Server running on http://localhost:3450")
	fmt.Println("Swagger on http://localhost:3450/api/swagger/index.html")

	router.Run(":3450")
}
