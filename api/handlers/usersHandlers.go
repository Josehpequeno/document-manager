package handlers

import (
	"document-manager/api/models"
	"document-manager/database"

	"github.com/gin-gonic/gin"
)

func GetAllUsersHandler(c *gin.Context) {
	db := database.GetDB()

	var users []models.User

	if err := db.Find(&users).Error; err != nil {
		c.JSON(500, gin.H{"error": "Error ao obter os usuários do banco de dados"})
		return
	}

	c.JSON(200, users)
}
