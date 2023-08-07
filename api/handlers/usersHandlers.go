package handlers

import (
	"document-manager/api/models"
	"document-manager/database"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllUsersHandler(c *gin.Context) {
	db := database.GetDB()

	var users []models.User

	if err := db.Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error retrieving users", "details": err.Error()})
		return
	}

	c.JSON(200, gin.H{"users": users})
}

func CreateUserHandler(c *gin.Context) {
	var newUser models.User
	// request body json
	if err := c.BindJSON(&newUser); err != nil {
		c.JSON(400, gin.H{"error": "Invalid data"})
		return
	}

	//gerar um novo uuid
	newUser.ID = uuid.New()

	db := database.GetDB()

	if err := db.Create(&newUser).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error creating user", "details": err.Error()})
		return
	}

	c.JSON(201, newUser)
}

func UpdateUserHandler(c *gin.Context) {
	userID := c.Param("id")

	db := database.GetDB()

	var existingUser models.User
	if err := db.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	if err := c.BindJSON(&existingUser); err != nil {
		c.JSON(400, gin.H{"error": "Invalid data"})
		return
	}

	if err := db.Save(&existingUser).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error updating user", "details": err.Error()})
	}

	c.JSON(200, gin.H{"message": "User updated successfully", "user": existingUser})
}

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
