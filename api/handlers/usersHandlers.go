package handlers

import (
	"document-manager/api/models"
	"document-manager/database"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type ErrorResponse struct {
	ErrorMessage string `json:"error"`
}

type ErrorResponseWithDetails struct {
	ErrorMessage string `json:"error"`
	Details      string `json:"details"`
}

type MessageResponse struct {
	Message string `json:"message"`
}

type MessageWithUserResponse struct {
	Message string       `json:"message"`
	User    UserResponse `json:"user"`
}

type UsersResponse struct {
	Users []UserResponse `json:"users"`
}
type UserResponse struct {
	ID     uuid.UUID `json:"id"`
	Name   string    `json:"name"`
	Email  string    `json:"email"`
	Master bool      `json:"master"`
}

type UserBody struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Email    string    `json:"email"`
	Password string    `json:"password"`
}

type UserBodyUpdate struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// GetAllUsersHandler gets all users.
// @Summary Get all users
// @Description Get all users
// @ID get-all-users
// @Tags Users
// @Accept json
// @Produce json
// @Param start query integer false "Start index for pagination" default(0)
// @Param limit query integer false "Maximum number of users to retrieve per page" default(10)
// @Param sort query string false "Field to sort by (id, name, email)" default(id)
// @Param sortDirection query string false "Sort direction (asc or desc)" default(asc)
//
//	@Success 200 {object} UsersResponse
//
// @Failure 401 {object} ErrorResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Security Bearer
// @Router /users [get]
func GetAllUsersHandler(c *gin.Context) {
	//extract query params
	start := c.DefaultQuery("start", "0")
	limit := c.DefaultQuery("limit", "10")
	sort := c.DefaultQuery("sort", "id")
	sortDir := c.DefaultQuery("dir", "asc")

	//validate and convert params
	startInt, err := strconv.Atoi(start)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'start' parameter"})
		return
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
		return
	}

	//validate and sanitize sorting field
	var sortField string
	switch sort {
	case "id", "name", "email":
		sortField = sort
	default:
		sortField = "id"
	}

	var sortOrder string
	switch sortDir {
	case "asc", "desc":
		sortOrder = sortDir
	default:
		sortOrder = "asc"
	}

	db := database.GetDB()

	var users []models.User

	//query the database with pagination and sorting
	query := db.Offset(startInt).Limit(limitInt).Order(sortField + " " + sortOrder).Find(&users)
	if query.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving users", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

// GetUserByIDHandler gets a user by ID.
// @Summary Get a user by ID
// @Description Get a user by ID
// @ID get-user-by-id
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /users/{id} [get]
func GetUserByIDHandler(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, existingUser)

}

// CreateUserHandler creates a new user.
// @Summary Create a new user
// @Description Create a new user
// @ID create-user
// @Tags Users
// @Accept json
// @Produce json
// @Param user body UserBody true "User object"
// @Success 201 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Router /users [post]
func CreateUserHandler(c *gin.Context) {
	var newUser models.User
	// request body json
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	//gerar um novo uuid
	newUser.ID = uuid.New()

	//transformar senha do usuário em hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}
	newUser.Password = string(hashedPassword)

	db := database.GetDB()

	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newUser)
}

// CreateUserMasterHandler creates a new user master.
// @Summary Create a new user master
// @Description Create a new user master
// @ID create-user-master
// @Tags Users
// @Accept json
// @Produce json
// @Param user body UserBody true "User object"
// @Success 201 {object} UserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Router /usersMaster [post]
func CreateUserMasterHandler(c *gin.Context) {
	var newUser models.User
	// request body json
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	//gerar um novo uuid
	newUser.ID = uuid.New()

	//transformar senha do usuário em hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}
	newUser.Password = string(hashedPassword)
	newUser.Master = true

	db := database.GetDB()

	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newUser)
}

// UpdateUserHandler updates a user by ID.
// @Summary Update a user by ID
// @Description Update a user by ID
// @ID update-user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param user body UserBodyUpdate true "User object"
// @Success 200 {object} MessageWithUserResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Security Bearer
// @Router /users/{id} [put]
func UpdateUserHandler(c *gin.Context) {
	userID := c.Param("id")

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var updatedUser models.User
	if err := c.BindJSON(&updatedUser); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid data"})
		return
	}

	if updatedUser.Name == "" && updatedUser.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name and Email cannot be empty"})
		return
	}

	if updatedUser.Name != "" {
		existingUser.Name = updatedUser.Name
	}

	if updatedUser.Email != "" {
		existingUser.Email = updatedUser.Email
	}

	// if updatedUser.Master != existingUser.Master && updatedUser.Master != nil {
	// 	existingUser.Master = updatedUser.Master
	// }

	if updatedUser.Password != existingUser.Password && updatedUser.Password != "" {
		existingUser.Password = updatedUser.Password
	}

	if err := db.Save(&existingUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating user", "details": err.Error()})
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": existingUser})
}

// DeleteUserHandler deletes a user by ID.
// @Summary Delete a user by ID
// @Description Delete a user by ID
// @ID delete-user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} MessageResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Security Bearer
// @Router /users/{id} [delete]
func DeleteUserHandler(c *gin.Context) {
	userID := c.Param("id")

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if existingUser.Master {
		c.JSON(http.StatusNotFound, gin.H{"error": "You cannot delete a user master"})
		return
	}

	if err := db.Delete(&existingUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// DeleteUserMasterHandler deletes a user master by ID.
// @Summary Delete a user master by ID
// @Description Delete a user master by ID
// @ID delete-user-master
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} MessageResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Security Bearer
// @Router /usersMaster/{id} [delete]
func DeleteUserMasterHandler(c *gin.Context) {
	userID := c.Param("id")

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var count int64
	var users []models.User
	if err := db.Find(&users).Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user", "details": err.Error()})
		return
	}

	if count == 1 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user", "details": "You cannot delete the last user master"})
		return
	}

	if err := db.Delete(&existingUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting user", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}
