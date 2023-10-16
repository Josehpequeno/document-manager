package handlers

import (
	"document-manager/api/models"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestDeleteDocumentHandler(t *testing.T) {
	db := runInitDb()
	// Migrate the models
	err := db.AutoMigrate(&models.Document{})
	if err != nil {
		t.Fatal("Error migrating models:", err)
	}

	// Create a test document
	testDocumentID := uuid.New()
	testDocument := models.Document{
		ID:        testDocumentID,
		Title:     "Test Document",
		OwnerID:   "test_owner_id",
		OwnerName: "Test Owner",
		FilePath:  "./upload/file.pdf", // Adjust this path based on your actual implementation
	}

	// Save the test document to the database
	err = db.Create(&testDocument).Error
	assert.Nil(t, err)

	// Create a Gin router
	r := gin.Default()
	r.DELETE("/documents/:id", DeleteDocumentHandler)

	// Create a request to delete the test document
	req, _ := http.NewRequest("DELETE", "/documents/"+testDocumentID.String(), nil)

	// Create a response recorder
	resp := httptest.NewRecorder()

	// Serve the request
	r.ServeHTTP(resp, req)

	// Check the response code
	assert.Equal(t, http.StatusOK, resp.Code)

	// Check if the document is deleted
	var response MessageResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, "Document deleted successfully", response.Message)

	// Check if the document is deleted from the database
	var deletedDocument models.Document
	err = db.Where("id = ?", testDocumentID).First(&deletedDocument).Error
	assert.NotNil(t, err) // This should return an error indicating that the document is not found

	// Check if the file is deleted
	_, fileErr := os.Stat(testDocument.FilePath)
	assert.True(t, os.IsNotExist(fileErr)) // This should return true, indicating that the file is not found
}
