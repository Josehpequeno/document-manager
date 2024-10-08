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

	r.GET("/api/", handlers.HelloHandler)

	r.POST("/api/refresh-token", handlers.RefreshTokenHandler)

	usersProtected := r.Group("/api/users")
	usersProtected.Use(handlers.AuthMiddleware)
	{
		usersProtected.GET("/", handlers.GetAllUsersHandler)
		usersProtected.GET("/:id", handlers.GetUserByIDHandler)
		usersProtected.PUT("/:id", handlers.UpdateUserHandler)
		usersProtected.DELETE("/:id", handlers.DeleteUserHandler)
	}
	r.POST("/api/users", handlers.CreateUserHandler)

	//master
	usersMasterProtect := r.Group("/api/usersMaster")
	usersMasterProtect.Use(handlers.AuthMiddlewareMaster)
	{
		r.POST("/", handlers.CreateUserMasterHandler)
		r.DELETE("/:id", handlers.DeleteUserMasterHandler)
	}
	r.POST("/api/login", handlers.LoginHandler)

	// documents
	documentsProtected := r.Group("/api/documents")
	documentsProtected.Use(handlers.AuthMiddleware)
	{
		documentsProtected.GET("/", handlers.GetAllDocumentsHandler)
		documentsProtected.GET("/:id", handlers.GetDocumentByIDHandler)
		documentsProtected.PUT("/:id", handlers.UpdateDocumentWithoutFileHandler)
		documentsProtected.DELETE("/:id", handlers.DeleteDocumentHandler)
		documentsProtected.GET("/file/:id", handlers.GetDocumentFileByIDHandler)
		documentsProtected.POST("/upload", handlers.CreateDocumentHandler)
		documentsProtected.PUT("/upload/:id", handlers.UpdateDocumentHandler)
	}

	//swagger
	r.GET("/api/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	return r
}
