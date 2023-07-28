package main

import (
	"document-manager/api"
	"document-manager/api/models"
	"document-manager/database"
	"log"
)

func main() {

	//Inicializar a conexão com o banco de dados
	// _ is db
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Erro ao configurar a conexão com o banco de dados", err)
	}
	//será executado no final do bloco
	// defer db.Close()

	//executar a migração automática
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatal("Erro ao criar a tabela 'users':", err)
	}

	router := api.SetupRouter()

	router.Run(":3450")
}
