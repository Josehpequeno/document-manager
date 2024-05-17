package api

import (
	"document-manager/api/handlers"
	"document-manager/api/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRouter é a função pública que cria o roteador Gin e configura as rotas
func SetupRouter() *gin.Engine {
	r := gin.Default()
	//cors
	r.Use(cors.New(utils.CORSConfig()))

	r.GET("/", handlers.HelloHandler)

	r.GET("/users", handlers.AuthMiddleware, handlers.GetAllUsersHandler)
	r.GET("/users/:id", handlers.AuthMiddleware, handlers.GetUserByIDHandler)
	r.POST("/users", handlers.CreateUserHandler)
	r.PUT("/users/:id", handlers.AuthMiddleware, handlers.UpdateUserHandler)
	r.DELETE("/users/:id", handlers.AuthMiddleware, handlers.DeleteUserHandler)
	//master
	r.POST("/usersMaster", handlers.AuthMiddlewareMaster, handlers.CreateUserMasterHandler)
	r.DELETE("/usersMaster/:id", handlers.AuthMiddlewareMaster, handlers.DeleteUserMasterHandler)
	r.POST("/login", handlers.LoginHandler)

	// documents
	r.GET("/documents", handlers.AuthMiddleware, handlers.GetAllDocumentsHandler)
	r.GET("/documents/:id", handlers.AuthMiddleware, handlers.GetDocumentByIDHandler)
	r.GET("/documents/file/:id", handlers.AuthMiddleware, handlers.GetDocumentFileByIDHandler)
	r.POST("/documents", handlers.AuthMiddleware, handlers.CreateDocumentHandler)
	r.PUT("/documents/upload/:id", handlers.AuthMiddleware, handlers.UpdateDocumentHandler)
	r.PUT("/documents/:id", handlers.AuthMiddleware, handlers.UpdateDocumentWithoutFileHandler)
	r.DELETE("/documents/:id", handlers.AuthMiddleware, handlers.DeleteDocumentHandler)
	//swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	return r
}
