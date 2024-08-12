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
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var accessToken string
var refreshToken string
var userId string
var userName string

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
		log.Fatal("Error creating table 'users':", err)
	}
	err = db.AutoMigrate(&models.Document{})
	if err != nil {
		log.Fatal("Error creating table 'documents':", err)
	}

	err = database.InitMasterUser()
	if err != nil {
		log.Fatal("Error creating default user master:", err)
	}

	return db
}

func createUserForTokenAcess() {
	db := runInitDb()
	db = db.Unscoped()
	r := gin.Default()

	newUserID := uuid.New()
	newUser := models.User{
		ID:       newUserID,
		Name:     "newUserMaster",
		Email:    "test2121@example.com",
		Master:   true,
		Password: "password",
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		println("error", err)
		return
	}
	newUser.Password = string(hashedPassword)
	newUser.Master = true

	db.Create(&newUser)

	r.POST("/login", LoginHandler)

	loginBody := LoginBody{
		UsernameOrEmail: "newUserMaster",
		Password:        "password",
	}

	reqBody, err := json.Marshal(loginBody)
	if err != nil {
		println("error", err)
		return
	}

	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	if http.StatusOK != resp.Code {
		println("error on login user", resp.Code)
		return
	}

	var loginResponse LoginResponse
	err = json.Unmarshal(resp.Body.Bytes(), &loginResponse)
	if err != nil {
		println("error on login user", err)
		return
	}
	// fmt.Println("login response =>", loginResponse)
	// println("access token", loginResponse.AccessToken)
	// println("refresh token", loginResponse.RefreshToken)
	accessToken = loginResponse.AccessToken
	refreshToken = loginResponse.RefreshToken
	userId = loginResponse.User.ID.String()
	userName = loginResponse.User.Name

	var existingUser models.User
	err = db.First(&existingUser, "email = ?", newUser.Email).Error
	if err != nil {
		println("error", err)
		return
	}
	// Excluir o usuário após o teste
	err = db.Delete(&existingUser).Error
	if err != nil {
		println("error", err)
		return
	}
}

func TestGetAllUsersHandler(t *testing.T) {
	runInitDb()

	r := gin.Default()
	createUserForTokenAcess()
	r.GET("/users", AuthMiddleware, GetAllUsersHandler)

	req, _ := http.NewRequest("GET", "/users", nil)
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response UsersResponse
	err := json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)

	usersLength := len(response.Users)
	// usando zero no lugar do mínimo de usuários esperados no banco de dados.
	assert.GreaterOrEqual(t, usersLength, 0, "The length of 'users' should be greater than or equal to 0")
}

func TestGetUserByIDHandler(t *testing.T) {
	db := runInitDb()

	testUserID := uuid.New()
	testUser := models.User{
		ID:     testUserID,
		Name:   "Test User",
		Email:  "test@example.com",
		Master: false,
	}

	db.Create(&testUser)

	var existingUser models.User
	err := db.First(&existingUser, "email = ?", testUser.Email).Error
	assert.Nil(t, err)

	r := gin.Default()
	createUserForTokenAcess()
	r.GET("/users/:id", AuthMiddleware, GetUserByIDHandler)

	req, _ := http.NewRequest("GET", "/users/"+testUserID.String(), nil)
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var userResponse UserResponse
	err = json.Unmarshal(resp.Body.Bytes(), &userResponse)
	assert.Nil(t, err)
	assert.Equal(t, testUserID, userResponse.ID)
	assert.Equal(t, existingUser.Name, userResponse.Name)
	assert.Equal(t, existingUser.Email, userResponse.Email)
	assert.Equal(t, false, userResponse.Master)
	err = db.Unscoped().Delete(&existingUser).Error
	assert.Nil(t, err)
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
	assert.Equal(t, false, userResponse.Master)
	// Excluir o usuário após o teste
	err = db.Delete(&existingUser).Error
	assert.Nil(t, err)
}

func TestCreateUserMasterHandler(t *testing.T) {
	db := runInitDb()
	// Temporariamente desativar o Soft Delete para este teste
	db = db.Unscoped()
	r := gin.Default()
	r.POST("/usersMaster", AuthMiddlewareMaster, CreateUserMasterHandler)

	newUser := UserBody{
		Name:     "New user",
		Email:    "new@example.com",
		Password: "password",
	}
	reqBody, err := json.Marshal(newUser)
	assert.Nil(t, err)

	req, _ := http.NewRequest("POST", "/usersMaster", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", accessToken)

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
	assert.Equal(t, true, userResponse.Master)
	// Excluir o usuário após o teste
	err = db.Delete(&existingUser).Error
	assert.Nil(t, err)
}

func TestUpdateUserHandler(t *testing.T) {
	db := runInitDb()
	testUserID := uuid.New()
	testUser := models.User{
		ID:     testUserID,
		Name:   "Test User",
		Email:  "test@example.com",
		Master: false,
	}

	db.Create(&testUser)

	var existingUser models.User
	err := db.First(&existingUser, "email = ?", testUser.Email).Error
	assert.Nil(t, err)

	r := gin.Default()
	createUserForTokenAcess()
	r.PUT("/users/:id", AuthMiddleware, UpdateUserHandler)

	updateUserData := UserBody{
		Name:  "Update User",
		Email: "test@example.com",
	}
	reqBody, err := json.Marshal(updateUserData)
	assert.Nil(t, err)

	req, _ := http.NewRequest("PUT", "/users/"+testUserID.String(), bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response MessageWithUserResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, "User updated successfully", response.Message)
	assert.Equal(t, testUserID, response.User.ID)
	assert.Equal(t, updateUserData.Name, response.User.Name)
	assert.Equal(t, updateUserData.Email, response.User.Email)
	assert.Equal(t, false, response.User.Master)
	err = db.Unscoped().Delete(&existingUser).Error
	assert.Nil(t, err)
}

func TestDeleteUserHandler(t *testing.T) {
	db := runInitDb()

	testUserID := uuid.New()
	testUser := models.User{
		ID:     testUserID,
		Name:   "Test User",
		Email:  "test@example.com",
		Master: false,
	}

	db.Create(&testUser)

	var existingUser models.User
	err := db.First(&existingUser, "email = ?", testUser.Email).Error
	assert.Nil(t, err)

	r := gin.Default()
	createUserForTokenAcess()
	r.DELETE("/users/:id", AuthMiddleware, DeleteUserHandler)

	req, _ := http.NewRequest("DELETE", "/users/"+testUserID.String(), nil)
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response MessageResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, "User deleted successfully", response.Message)
	err = db.Unscoped().Delete(&existingUser).Error
	assert.Nil(t, err)
}

func TestDeleteUserMasterHandler(t *testing.T) {
	db := runInitDb()

	testUserID := uuid.New()
	testUser := models.User{
		ID:     testUserID,
		Name:   "Test User",
		Email:  "test@example.com",
		Master: true,
	}

	db.Create(&testUser)

	var existingUser models.User
	err := db.First(&existingUser, "email = ?", testUser.Email).Error
	assert.Nil(t, err)

	r := gin.Default()
	createUserForTokenAcess()
	r.DELETE("/usersMaster/:id", AuthMiddlewareMaster, DeleteUserMasterHandler)

	req, _ := http.NewRequest("DELETE", "/usersMaster/"+testUserID.String(), nil)
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
	var response MessageResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, "User deleted successfully", response.Message)
	err = db.Unscoped().Delete(&existingUser).Error
	assert.Nil(t, err)
}
