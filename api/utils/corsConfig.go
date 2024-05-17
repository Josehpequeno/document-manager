package utils

import (
	"github.com/gin-contrib/cors"
)

func CORSConfig() cors.Config {
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	// config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"POST", "GET", "PUT", "OPTIONS", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "User-Agent", "Cache-Control", "Pragma"}
	config.ExposeHeaders = []string{"Content-Length"}

	return config
}
