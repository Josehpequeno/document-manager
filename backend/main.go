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

	// Initialize the database connection
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Error configuring database connection: %v", err)
	}
	// Ensure the connection is closed when main exits
	// defer db.Close()

	// Run automatic migration for the 'users' table
	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Error creating 'users' table: %v", err)
	}

	// Initialize the master user
	err = database.InitMasterUser()
	if err != nil {
		log.Fatalf("Error creating initial master user: %v", err)
	}

	// Run automatic migration for the 'documents' table
	err = db.AutoMigrate(&models.Document{})
	if err != nil {
		log.Fatalf("Error creating 'documents' table: %v", err)
	}

	// Set up and start the router
	router := api.SetupRouter()

	fmt.Println("Server running on http://localhost:3450")
	fmt.Println("Swagger UI available at http://localhost:3450/api/swagger/index.html")

	if err := router.Run("0.0.0.0:3450"); err != nil {
		log.Fatalf("Error starting the server: %v", err)
	}
}
