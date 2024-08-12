package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHelloHandler(t *testing.T) {
	mockResponse := `{"message":"Welcome to the API Document Manager with Gin!"}`

	r := gin.Default()
	r.GET("/", HelloHandler)

	//cria um request
	req, _ := http.NewRequest("GET", "/", nil)

	// performa o request
	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response MessageResponse
	err := json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, mockResponse, resp.Body.String())
}
