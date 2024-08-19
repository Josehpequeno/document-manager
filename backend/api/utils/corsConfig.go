package utils

import (
	"log"

	"github.com/gin-contrib/cors"
)

func CORSConfig() cors.Config {
	config := cors.DefaultConfig()
	// config.AllowAllOrigins = true
	localIp, err := GetLocalIP()
	config.AllowOrigins = []string{"http://localhost", "http://localhost:3000"}
	// write the local IP to the .env file
	if err != nil {
		log.Printf("Warning: Error retrieving local IP address: %v", err)
	} else {
		config.AllowOrigins = append(config.AllowOrigins, "http://"+localIp)
		_ = WriteEnvFile(localIp)
	}
	config.AllowMethods = []string{"POST", "GET", "PUT", "OPTIONS", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization", "Accept", "User-Agent", "Cache-Control", "Pragma"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true

	return config
}
