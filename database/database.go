package database

import (
	"document-manager/api/models"
	"os"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
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

	//inicializar com usuário master padrão
	var count int64
	var users []models.User
	if err := db.Find(&users).Count(&count).Error; err != nil {
		return nil, err
	}

	if count == 0 {
		masterUser := models.User{
			ID:       uuid.New(),
			Name:     "master",
			Email:    "master@email.com",
			Password: "copa2026",
			Master:   true,
		}
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(masterUser.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		masterUser.Password = string(hashedPassword)

		if err := db.Create(&masterUser).Error; err != nil {
			return nil, err
		}
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
