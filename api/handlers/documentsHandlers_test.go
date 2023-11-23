package handlers

import (
	"bytes"
	"document-manager/api/models"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestUpdateDocumentWithoutFileHandler(t *testing.T) {
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
		OwnerID:   userId,
		OwnerName: userName,
	}
	// Save the test document to the database
	db.Create(&testDocument)
	var existingDocument models.Document
	err = db.First(&existingDocument, "ID = ?", testDocument.ID).Error
	assert.Nil(t, err)

	r := gin.Default()
	createUserForTokenAcess()
	r.PUT("/documents/:id", AuthMiddleware, UpdateDocumentWithoutFileHandler)

	updateDocumentData := DocumentRequest{
		Title:       "Test Document update",
		Description: "Test Document update description",
		OwnerID:     userId,
		OwnerName:   userName,
	}
	reqBody, err := json.Marshal(updateDocumentData)
	assert.Nil(t, err)

	req, _ := http.NewRequest("PUT", "/documents/"+testDocumentID.String(), bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response MessageWithDocumentResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, "Document updated successfully", response.Message)
	assert.Equal(t, testDocumentID, response.Document.ID)
	assert.Equal(t, updateDocumentData.Description, response.Document.Description)
	assert.Equal(t, updateDocumentData.OwnerID, response.Document.OwnerID)
	assert.Equal(t, updateDocumentData.OwnerName, response.Document.OwnerName)
	assert.Equal(t, updateDocumentData.Title, response.Document.Title)
	err = db.Unscoped().Delete(&existingDocument).Error
	assert.Nil(t, err)
}

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
		OwnerID:   userId,
		OwnerName: userName,
		FilePath:  "/home/naota/document-manager/documents/file.pdf", // Adjust this path based on your actual implementation
	}

	directory, err := os.Getwd() //get the current directory using the built-in function
	if err != nil {
		fmt.Println(err) //print the error if obtained
	}
	fmt.Println("Current working directory:", directory)

	// Save the test document to the database
	err = db.Create(&testDocument).Error
	assert.Nil(t, err)

	// Create a Gin router
	r := gin.Default()
	r.DELETE("/documents/:id", AuthMiddleware, DeleteDocumentHandler)

	// Create a request to delete the test document
	req, _ := http.NewRequest("DELETE", "/documents/"+testDocumentID.String(), nil)
	req.Header.Set("Authorization", accessToken)
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
