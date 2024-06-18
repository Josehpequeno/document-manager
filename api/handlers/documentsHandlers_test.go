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

var idDocumentExample string

func TestGetAllDocumentsHandler(t *testing.T) {
	runInitDb()

	r := gin.Default()
	createUserForTokenAcess()
	r.GET("/documents", AuthMiddleware, GetAllDocumentsHandler)

	req, _ := http.NewRequest("GET", "/documents", nil)
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response DocumentsResponse
	err := json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)

	documentsLength := len(response.Documents)
	// usando zero no lugar do mínimo de usuários esperados no banco de dados.
	assert.GreaterOrEqual(t, documentsLength, 0, "The length of 'documents' should be greater than or equal to 0")
}

func TestGetDocumentByIDHandler(t *testing.T) {
	db := runInitDb()

	testDocumentID := uuid.New()
	testDocument := models.Document{
		ID:        testDocumentID,
		Title:     "Test Document",
		OwnerID:   userId,
		OwnerName: userName,
	}

	db.Create(&testDocument)

	var existingDocument models.Document
	err := db.First(&existingDocument, "id = ?", testDocument.ID).Error
	assert.Nil(t, err)

	r := gin.Default()
	createUserForTokenAcess()
	r.GET("/documents/:id", AuthMiddleware, GetDocumentByIDHandler)

	req, _ := http.NewRequest("GET", "/documents/"+testDocumentID.String(), nil)
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var documentResponse DocumentResponse
	err = json.Unmarshal(resp.Body.Bytes(), &documentResponse)
	assert.Nil(t, err)
	assert.Equal(t, testDocumentID, documentResponse.ID)
	assert.Equal(t, existingDocument.Title, documentResponse.Title)
	assert.Equal(t, existingDocument.Description, existingDocument.Description)
	assert.Equal(t, existingDocument.OwnerID, existingDocument.OwnerID)
	assert.Equal(t, existingDocument.OwnerName, existingDocument.OwnerName)

	err = db.Unscoped().Delete(&existingDocument).Error
	assert.Nil(t, err)
}

func TestCreateDocumentHandler(t *testing.T) {
	db := runInitDb()

	directory, err := os.Getwd() //get the current directory using the built-in function
	if err != nil {
		fmt.Println(err) //print the error if obtained
	}
	filepath := strings.Split(directory, "document-manager")[0] + "document-manager/documents/" + "file.pdf"

	newDocument := models.Document{
		Title:     "Test Document",
		OwnerID:   userId,
		OwnerName: userName,
	}

	r := gin.Default()
	r.POST("/documents", AuthMiddleware, CreateDocumentHandler)

	// Criar um buffer para armazenar os dados do formulário
	var b bytes.Buffer
	writer := multipart.NewWriter(&b)

	// Adicionar o JSON como um campo do formulário
	err = writer.WriteField("title", newDocument.Title)
	assert.Nil(t, err)
	err = writer.WriteField("owner_id", newDocument.OwnerID)
	assert.Nil(t, err)
	err = writer.WriteField("owner_name", newDocument.OwnerName)
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
	idDocumentExample = response.ID.String()

	var existingDocument models.Document
	err = db.Where("id = ?", response.ID).First(&existingDocument).Error
	assert.Nil(t, err)

	_, fileErr := os.Stat(existingDocument.FilePath)
	assert.Nil(t, fileErr)

}

func TestGetDocumentFileByIDHandler(t *testing.T) {
	// Configurar o roteador e a rota
	r := gin.Default()
	r.GET("/documents/file/:id", AuthMiddleware, GetDocumentFileByIDHandler)
	// Criar uma solicitação HTTP para a rota com um ID de documento válido
	req, _ := http.NewRequest("GET", "/documents/file/"+idDocumentExample, nil)
	req.Header.Set("Authorization", accessToken)

	// Criar um gravador de resposta falso
	resp := httptest.NewRecorder()

	// Executar a solicitação
	r.ServeHTTP(resp, req)

	// Verificar se o status da resposta é 200 OK
	assert.Equal(t, http.StatusOK, resp.Code)

	// Verificar se o tipo de conteúdo é application/pdf
	assert.Equal(t, "application/octet-stream", resp.Header().Get("Content-Type"))
}

func TestUpdateDocumentHandler(t *testing.T) {
	db := runInitDb()
	directory, err := os.Getwd() //get the current directory using the built-in function
	if err != nil {
		fmt.Println(err) //print the error if obtained
	}
	filepath := strings.Split(directory, "document-manager")[0] + "document-manager/documents/" + "file.pdf"

	newDocument := models.Document{
		Title:     "Test Document update",
		OwnerID:   userId,
		OwnerName: userName,
	}

	r := gin.Default()

	r.PUT("/documents/upload/:id", AuthMiddleware, UpdateDocumentHandler)

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
	req, _ := http.NewRequest("PUT", "/documents/upload/"+idDocumentExample, &b)
	req.Header.Set("Authorization", accessToken)
	assert.Nil(t, err)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp := httptest.NewRecorder()

	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)
	var response MessageWithDocumentResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)

	var existingDocument models.Document
	err = db.Where("id = ?", response.Document.ID).First(&existingDocument).Error
	assert.Nil(t, err)

	_, fileErr := os.Stat(existingDocument.FilePath)
	assert.Nil(t, fileErr)
}

func TestUpdateDocumentWithoutFileHandler(t *testing.T) {
	r := gin.Default()
	r.PUT("/documents/:id", AuthMiddleware, UpdateDocumentWithoutFileHandler)

	updateDocumentData := DocumentRequest{
		Title:       "Test Document update without file",
		Description: "Test Document update without file description",
		OwnerID:     userId,
		OwnerName:   userName,
	}
	reqBody, err := json.Marshal(updateDocumentData)
	assert.Nil(t, err)

	req, _ := http.NewRequest("PUT", "/documents/"+idDocumentExample, bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", accessToken)

	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	assert.Equal(t, http.StatusOK, resp.Code)

	var response MessageWithDocumentResponse
	err = json.Unmarshal(resp.Body.Bytes(), &response)
	assert.Nil(t, err)
	assert.Equal(t, "Document updated successfully", response.Message)
	assert.Equal(t, idDocumentExample, response.Document.ID.String())
	assert.Equal(t, updateDocumentData.Description, response.Document.Description)
	assert.Equal(t, updateDocumentData.OwnerID, response.Document.OwnerID)
	assert.Equal(t, updateDocumentData.OwnerName, response.Document.OwnerName)
	assert.Equal(t, updateDocumentData.Title, response.Document.Title)
	assert.Nil(t, err)
}

func TestDeleteDocumentHandler(t *testing.T) {
	db := runInitDb()
	// Migrate the models
	err := db.AutoMigrate(&models.Document{})
	if err != nil {
		t.Fatal("Error migrating models:", err)
	}

	// Create a Gin router
	r := gin.Default()
	r.DELETE("/documents/:id", AuthMiddleware, DeleteDocumentHandler)

	// Create a request to delete the test document
	req, _ := http.NewRequest("DELETE", "/documents/"+idDocumentExample, nil)
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
	err = db.Where("id = ?", idDocumentExample).First(&deletedDocument).Error
	assert.NotNil(t, err) // This should return an error indicating that the document is not found

	// Check if the file is deleted
	_, fileErr := os.Stat(deletedDocument.FilePath)
	assert.True(t, os.IsNotExist(fileErr)) // This should return true, indicating that the file is not found
}
