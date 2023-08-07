package api

import (
	"document-manager/api/handlers"

	"github.com/gin-gonic/gin"
)

// SetupRouter é a função pública que cria o roteador Gin e configura as rotas
func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/", handlers.HelloHandler)

	r.GET("/users", handlers.GetAllUsersHandler)
	r.POST("/users", handlers.CreateUserHandler)
	r.PUT("/users/:id", handlers.UpdateUserHandler)
	r.DELETE("/users/:id", handlers.DeleteUserHandler)

	return r
}
