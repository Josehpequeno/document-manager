package api

import (
	"document-manager/api/handlers"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter é a função pública que cria o roteador Gin e configura as rotas
func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/", handlers.HelloHandler)

	r.GET("/users", handlers.GetAllUsersHandler)
	r.GET("/users/:id", handlers.GetUserByIDHandler)
	r.POST("/users", handlers.CreateUserHandler)
	r.PUT("/users/:id", handlers.UpdateUserHandler)
	r.DELETE("/users/:id", handlers.DeleteUserHandler)

	//swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	return r
}
