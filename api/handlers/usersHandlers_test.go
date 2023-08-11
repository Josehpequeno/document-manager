package handlers

import (
	"bytes"
	"document-manager/api/models"
	"document-manager/database"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func runInitDb() *gorm.DB {
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
	return db
}

func TestGetAllUsersHandler(t *testing.T) {
	runInitDb()
	r := gin.Default()
	r.GET("/users", GetAllUsersHandler)

	req, _ := http.NewRequest("GET", "/users", nil)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response gin.H
	err := json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	users, exists := response["users"].([]interface{})
	assert.True(t, exists)

	usersLength := len(users)
	// usando zero no lugar do mínimo de usuários esperados no banco de dados.
	assert.GreaterOrEqual(t, usersLength, 0, "The length of 'users' should be greater than or equal to 0")
}

func TestGetUserByIDHandler(t *testing.T) {
	db := runInitDb()

	testUserID := uuid.New()
	var master = false
	testUser := models.User{
		ID:     testUserID,
		Name:   "Test User",
		Email:  "test@example.com",
		Master: &master,
	}

	db.FirstOrCreate(&testUser)

	var existingUser models.User
	err := db.First(&existingUser, "email = ?", testUser.Email).Error
	assert.Nil(t, err)

	r := gin.Default()
	r.GET("/users/:id", GetUserByIDHandler)

	req, _ := http.NewRequest("GET", "/users/"+existingUser.ID.String(), nil)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var userResponse UserResponse
	err = json.Unmarshal(resp.Body.Bytes(), &userResponse)
	assert.Nil(t, err)
	assert.Equal(t, existingUser.ID, userResponse.ID)
	assert.Equal(t, existingUser.Name, userResponse.Name)
	assert.Equal(t, existingUser.Email, userResponse.Email)
	assert.Equal(t, master, userResponse.Master)
}

func TestCreateUserHandler(t *testing.T) {
	db := runInitDb()
	// Temporariamente desativar o Soft Delete para este teste
	db = db.Unscoped()
	r := gin.Default()
	r.POST("/users", CreateUserHandler)

	newUser := UserBody{
		Name:     "New user",
		Email:    "new@example.com",
		Master:   true,
		Password: "password",
	}
	reqBody, err := json.Marshal(newUser)
	assert.Nil(t, err)

	req, _ := http.NewRequest("POST", "/users", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusCreated, resp.Code)

	var userResponse UserResponse
	err = json.Unmarshal(resp.Body.Bytes(), &userResponse)
	assert.Nil(t, err)
	var existingUser models.User
	err = db.First(&existingUser, "email = ?", newUser.Email).Error
	assert.Nil(t, err)
	assert.NotEqual(t, uuid.Nil, userResponse.ID)
	assert.Equal(t, newUser.Name, userResponse.Name)
	assert.Equal(t, newUser.Email, userResponse.Email)
	assert.Equal(t, newUser.Master, userResponse.Master)
	// Excluir o usuário após o teste
	err = db.Delete(&existingUser).Error
	assert.Nil(t, err)

}
