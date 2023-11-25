package handlers

import (
	"bytes"
	"document-manager/api/models"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

var idDocumentToDelete string

func TestCreateDocumentHandler(t *testing.T) {
	createUserForTokenAcess()
	db := runInitDb()

	directory, err := os.Getwd() //get the current directory using the built-in function
	if err != nil {
		fmt.Println(err) //print the error if obtained
	}
	filepath := strings.Split(directory, "document-manager")[0] + "document-manager/documents/" + "file.pdf"
	// _, fileErr := os.Create(filepath)
	// assert.Nil(t, fileErr)

	newDocument := models.Document{
		Title:     "Test Document",
		OwnerID:   userId,
		OwnerName: userName,
	}

	// documentJSON, err := json.Marshal(newDocument)
	// assert.Nil(t, err)

	r := gin.Default()

	r.POST("/documents", AuthMiddleware, CreateDocumentHandler)

	// Criar um buffer para armazenar os dados do formulário
	var b bytes.Buffer
	writer := multipart.NewWriter(&b)

	// Adicionar o JSON como um campo do formulário
	err = writer.WriteField("Title", newDocument.Title)
	assert.Nil(t, err)
	err = writer.WriteField("OwnerId", newDocument.OwnerID)
	assert.Nil(t, err)
	err = writer.WriteField("OwnerName", newDocument.OwnerName)
	assert.Nil(t, err)
	// Abrir o arquivo PDF
	file, err := os.Open(filepath)
	assert.Nil(t, err)
	defer file.Close()

	// Adicionar o arquivo PDF como um campo do formulário
	part, err := writer.CreateFormFile("file", "file.pdf")
	assert.Nil(t, err)
	_, err = io.Copy(part, file)
	assert.Nil(t, err)

	// Finalizar o formulário
	writer.Close()
	req, _ := http.NewRequest("POST", "/documents", &b)
	req.Header.Set("Authorization", accessToken)
	assert.Nil(t, err)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp := httptest.NewRecorder()

	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusCreated, resp.Code)
	var response DocumentResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	idDocumentToDelete = response.ID.String()

	var existingDocument models.Document
	err = db.Where("id = ?", response.ID).First(&existingDocument).Error
	assert.Nil(t, err)

	_, fileErr := os.Stat(existingDocument.FilePath)
	assert.Nil(t, fileErr)

	// _ = os.Remove(newDocument.FilePath)
}

// func TestUpdateDocumentHandler(t *testing.T) {

// }

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
	// testDocumentID := uuid.New()
	// testDocument := models.Document{
	// 	ID:        idDocumentToDelete,
	// 	Title:     "Test Document",
	// 	OwnerID:   userId,
	// 	OwnerName: userName,
	// 	FilePath:  "/home/naota/document-manager/documents/file (cópia).pdf", // Adjust this path based on your actual implementation
	// }

	// Create a Gin router
	r := gin.Default()
	r.DELETE("/documents/:id", AuthMiddleware, DeleteDocumentHandler)

	// Create a request to delete the test document
	req, _ := http.NewRequest("DELETE", "/documents/"+idDocumentToDelete, nil)
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
	err = db.Where("id = ?", idDocumentToDelete).First(&deletedDocument).Error
	assert.NotNil(t, err) // This should return an error indicating that the document is not found

	// Check if the file is deleted
	_, fileErr := os.Stat(deletedDocument.FilePath)
	assert.True(t, os.IsNotExist(fileErr)) // This should return true, indicating that the file is not found
}
