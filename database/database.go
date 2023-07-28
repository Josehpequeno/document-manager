package database

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

// InitDB inicializa a conexão com o banco de dados PostgreSQL
func InitDB() (*gorm.DB, error) {
	dsn := getDSNFromEnv()

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	return db, nil
}

// GetDB retorna a instância do banco de dados para ser usada nos modelos e nas rotas
func GetDB() *gorm.DB {
	return db
}

// DSN  "Data Source Name" ou "Nome da Fonte de Dados".
func getDSNFromEnv() string {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	return "host=" + dbHost + " user=" + dbUser + " password=" + dbPassword + " dbname=" + dbName + " port=" + dbPort + " sslmode=disable TimeZone=America/Fortaleza"
}
