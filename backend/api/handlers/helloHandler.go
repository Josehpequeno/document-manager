package handlers

import (
	"github.com/gin-gonic/gin"
)

// HelloHandler returns a simple greeting message.
// @Summary Get a greeting message
// @Description Get a greeting message
// @ID get-greeting
// @Tags Misc
// @Accept json
// @Produce json
// @Success 200 {object} MessageResponse
// @Router / [get]
func HelloHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Welcome to the API Document Manager with Gin!"})
}
