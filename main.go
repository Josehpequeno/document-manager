package main

import (
	"resume-manager/api"
)

func main() {
	router := api.SetupRouter()

	router.Run(":3450")
}
