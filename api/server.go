package api

import (
	"github.com/gin-gonic/gin"
)

// SetupRouter é a função pública que cria o roteador Gin e configura as rotas
func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/", helloHandler)

	return r
}

func helloHandler(c *gin.Context) {
	c.JSON(200, gin.H{"message": "Bem-vindo à API com Gin!"})
}
