package handlers

import (
	"document-manager/api/models"
	"document-manager/database"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type ErrorResponse struct {
	ErrorMessage string `json:"error"`
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
	Master   bool      `json:"master"`
	Password string    `json:"password"`
}

type UserBodyUpdate struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Master   bool   `json:"master"`
	Password string `json:"password"`
}

// GetAllUsersHandler gets all users.
// @Summary Get all users
// @Description Get all users
// @ID get-all-users
// @Tags Users
// @Accept json
// @Produce json
//
//	@Success 200 {object} UsersResponse
//
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /users [get]
func GetAllUsersHandler(c *gin.Context) {
	db := database.GetDB()

	var users []models.User

	if err := db.Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error retrieving users", "details": err.Error()})
		return
	}

	c.JSON(200, gin.H{"users": users})
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
		c.JSON(400, gin.H{"error": "Invalid user ID"})
		return
	}

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	c.JSON(200, existingUser)

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
// @Failure 500 {object} ErrorResponse
// @Router /users [post]
func CreateUserHandler(c *gin.Context) {
	var newUser models.User
	// request body json
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(400, gin.H{"error": "Invalid data"})
		return
	}

	//gerar um novo uuid
	newUser.ID = uuid.New()

	//transformar senha do usuário em hash
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newUser.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}
	newUser.Password = string(hashedPassword)

	db := database.GetDB()

	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}

	c.JSON(201, newUser)
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
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /users/{id} [put]
func UpdateUserHandler(c *gin.Context) {
	userID := c.Param("id")

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	var updatedUser models.User
	if err := c.BindJSON(&updatedUser); err != nil {
		c.JSON(400, gin.H{"error": "Invalid data"})
		return
	}

	if updatedUser.Name == "" && updatedUser.Email == "" {
		c.JSON(400, gin.H{"error": "Name and Email cannot be empty"})
		return
	}

	if updatedUser.Name != "" {
		existingUser.Name = updatedUser.Name
	}

	if updatedUser.Email != "" {
		existingUser.Email = updatedUser.Email
	}

	if updatedUser.Master != existingUser.Master && updatedUser.Master != nil {
		existingUser.Master = updatedUser.Master
	}

	if updatedUser.Password != existingUser.Password && updatedUser.Password != "" {
		existingUser.Password = updatedUser.Password
	}

	if err := db.Save(&existingUser).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error updating user", "details": err.Error()})
	}

	c.JSON(200, gin.H{"message": "User updated successfully", "user": existingUser})
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
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /users/{id} [delete]
func DeleteUserHandler(c *gin.Context) {
	userID := c.Param("id")

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	if err := db.Delete(&existingUser).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error deleting user", "details": err.Error()})
		return
	}

	c.JSON(200, gin.H{"message": "User deleted successfully"})
}
