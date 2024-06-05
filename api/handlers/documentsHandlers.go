package handlers

import (
	"document-manager/api/models"
	"document-manager/database"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DocumentsResponse struct {
	Documents []DocumentResponse `json:"documents"`
}

type DocumentResponse struct {
	ID          uuid.UUID `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	OwnerID     string    `json:"owner_id"`
	OwnerName   string    `json:"owner_name"`
	FilePath    string    `json:"filepath"`
}

type DocumentRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	OwnerID     string `json:"owner_id"`
	OwnerName   string `json:"owner_name"`
}

type DocumentRequestFile struct {
	Title       string `form:"title" binding:"required"`
	Description string `form:"description"`
	OwnerID     string `form:"owner_id"`
	OwnerName   string `form:"owner_name"`
}

type MessageWithDocumentResponse struct {
	Message  string           `json:"message"`
	Document DocumentResponse `json:"document"`
}

// GetAllDocumentsHandler gets all documents.
// @Summary Get all documents
// @Description Get all documents
// @ID get-all-documents
// @Tags Documents
// @Accept json
// @Produce json
// @Param start query integer false "Start index for pagination" default(0)
// @Param limit query integer false "Maximum number of documents to retrieve per page" default(10)
// @Param sort query string false "Field to sort by (id, title, owner)" default(id)
// @Param sortDirection query string false "Sort direction (asc or desc)" default(asc)
//
//	@Success 200 {object} DocumentsResponse
//
// @Failure 401 {object} ErrorResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponseWithDetails
// @Security Bearer
// @Router /documents [get]
func GetAllDocumentsHandler(c *gin.Context) {
	start := c.DefaultQuery("start", "0")
	limit := c.DefaultQuery("limit", "10")
	sort := c.DefaultQuery("sort", "id")
	sortDir := c.DefaultQuery("dir", "asc")

	startInt, err := strconv.Atoi(start)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'start' parameter"})
		return
	}

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid 'limit' parameter"})
		return
	}

	var sortField string
	switch sort {
	case "id", "title", "owner":
		sortField = sort
	default:
		sortField = "id"
	}

	var sortOrder string
	switch sortDir {
	case "asc", "desc":
		sortOrder = sortDir
	default:
		sortOrder = "asc"
	}

	db := database.GetDB()

	var documents []models.Document

	query := db.Offset(startInt).Limit(limitInt).Order(sortField + " " + sortOrder).Find(&documents)
	if err = query.Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error retrieving documents", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"documents": documents})

}

// GetDocumentByIDHandler gets a document by ID.
// @Summary Get a document by ID
// @Description Get a document by ID
// @ID get-document-by-id
// @Tags Documents
// @Accept json
// @Produce json
// @Param id path string true "Document ID"
// @Success 200 {object} DocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /documents/{id} [get]
func GetDocumentByIDHandler(c *gin.Context) {
	documentIDStr := c.Param("id")
	documentID, err := uuid.Parse(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	db := database.GetDB()

	var existingDocument models.Document
	if err := db.Where("id = ?", documentID).First(&existingDocument).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	c.JSON(http.StatusOK, existingDocument)
}

// GetDocumentFileByIDHandler gets a document by ID.
// @Summary Get a document file by ID
// @Description Get a document file by ID
// @ID get-document-file-by-id
// @Tags Documents
// @Accept json
// @Produce octet-stream
// @Param id path string true "Document ID"
// @Success 200 {file} application/pdf
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /documents/file/{id} [get]
func GetDocumentFileByIDHandler(c *gin.Context) {
	documentIDStr := c.Param("id")
	documentID, err := uuid.Parse(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	db := database.GetDB()

	var existingDocument models.Document
	if err := db.Where("id = ?", documentID).First(&existingDocument).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Verifique se o arquivo existe
	_, err = os.Stat(existingDocument.FilePath)
	if os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// Abra o arquivo para leitura
	file, err := os.Open(existingDocument.FilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error opening file"})
		return
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting file info"})
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=%s", existingDocument.FilePath))
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", fmt.Sprintf("%d", fileInfo.Size()))

	c.File(existingDocument.FilePath)

	// Definir os cabeçalhos necessários para indicar que é um arquivo PDF
	// c.Header("Content-Description", "File Transfer")
	// c.Header("Content-Disposition", "inline; filename="+documentID.String()+".pdf")
	// c.Header("Content-Type", "application/pdf")
	// c.Header("Content-Transfer-Encoding", "binary")
	// c.Header("Expires", "0")
	// c.Header("Cache-Control", "must-revalidate")
	// c.Header("Pragma", "public")

	// Copiar o conteúdo do arquivo para o corpo da resposta
	// http.ServeContent(c.Writer, c.Request, documentID.String()+".pdf", fileInfo.ModTime(), file)

}

// CreateDocumentHandler creates a new document.
// @Summary Create a new document
// @Description Create a new document
// @ID create-document
// @Tags Documents
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Document file"
// @Param chunkIndex formData int true "Index of the current chunk (starting from 0)"
// @Param chunkTotal formData int true "Total number of chunks"
// @Param file formData file true "Chunk file to upload"
// @Success 201 {object} DocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /documents [post]
func CreateDocumentHandler(c *gin.Context) {
	err := c.Request.ParseMultipartForm(200 << 20) // 200 MB limit
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing form", "details": err.Error()})
		return
	}

	var docRequest DocumentRequestFile
	if err := c.Bind(&docRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data", "details": err.Error()})
		return
	}

	//handle file upload
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required", "details": err.Error()})
		return
	}
	defer file.Close()
	documentID := uuid.New()
	// filename := header.Filename + time.Now().Format("2006-01-02_15-04-05")

	directory, err := os.Getwd() //get the current directory using the built-in function
	if err != nil {
		fmt.Println(err) //print the error if obtained
	}
	filepath := strings.Split(directory, "document-manager")[0] + "document-manager/documents/" + documentID.String() + ".pdf"

	err = c.SaveUploadedFile(header, filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving file", "details": err.Error()})
		return
	}

	db := database.GetDB()

	newDocument := models.Document{
		ID:          documentID,
		Title:       docRequest.Title,
		Description: docRequest.Description,
		OwnerID:     docRequest.OwnerID,
		OwnerName:   docRequest.OwnerName,
		FilePath:    filepath,
	}

	if err := db.Create(&newDocument).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating document", "details": err.Error()})
		return
	}

	documentResponse := DocumentResponse{
		ID:        newDocument.ID,
		Title:     newDocument.Title,
		OwnerID:   newDocument.OwnerID,
		OwnerName: newDocument.OwnerName,
	}

	c.JSON(http.StatusCreated, documentResponse)
}

// UploadDocumentHandler uploads a document with a file.
// @Summary Upload a document with a file
// @Description Upload a document with a file
// @ID upload-document
// @Tags Documents
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Document file"
// @Success 200 {object} MessageWithDocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /documents/upload/{id} [put]
func UpdateDocumentHandler(c *gin.Context) {
	documentIDStr := c.Param("id")
	documentID, err := uuid.Parse(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	err = c.Request.ParseMultipartForm(200 << 20)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	var docRequest DocumentRequest
	if err := c.Bind(&docRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data", "details": err.Error()})
		return
	}

	db := database.GetDB()

	var existingDocument models.Document

	// Verificar se o documento existe
	if err := db.First(&existingDocument, "id = ?", documentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Documento não encontrado"})
		return
	}

	if docRequest.Title != "" {
		existingDocument.Title = docRequest.Title
	}
	if docRequest.Description != "" {
		existingDocument.Description = docRequest.Description
	}
	if docRequest.OwnerID != "" {
		existingDocument.OwnerID = docRequest.OwnerID
	}
	if docRequest.OwnerName != "" {
		existingDocument.OwnerName = docRequest.OwnerName
	}

	// file, header, err := c.Request.FormFile("file")
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}
	defer file.Close()

	// filename := header.Filename

	// directory, err := os.Getwd() //get the current directory using the built-in function
	// if err != nil {
	// 	fmt.Println(err) //print the error if obtained
	// }
	// filepath := strings.Split(directory, "document-manager")[0] + "document-manager/documents/" + documentIDStr + ".pdf"

	// if err := os.Remove(filepath); err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting document file", "details": err.Error()})
	// 	return
	// }
	if err := db.Save(&existingDocument).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update document information"})
		return
	}

	err = c.SaveUploadedFile(header, existingDocument.FilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving file", "details": err.Error()})
		return
	}

	documentResponse := DocumentResponse{
		ID:          existingDocument.ID,
		Title:       existingDocument.Title,
		Description: existingDocument.Description,
		OwnerID:     existingDocument.OwnerID,
		OwnerName:   existingDocument.OwnerName,
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document updated successfully", "document": documentResponse})
}

// UploadDocumentWithoutFileHandler uploads a document without a file.
// @Summary Upload a document without a file
// @Description Upload a document without a file
// @ID upload-document-no-file
// @Tags Documents
// @Produce json
// @Success 200 {object} MessageWithDocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /documents/{id} [put]
func UpdateDocumentWithoutFileHandler(c *gin.Context) {
	documentIDStr := c.Param("id")
	documentID, err := uuid.Parse(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	var docRequest DocumentRequest
	if err := c.Bind(&docRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form data", "details": err.Error()})
		return
	}

	db := database.GetDB()

	var existingDocument models.Document

	// Verificar se o documento existe
	if err := db.First(&existingDocument, "id = ?", documentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	if docRequest.Title != "" {
		existingDocument.Title = docRequest.Title
	}
	if docRequest.Description != "" {
		existingDocument.Description = docRequest.Description
	}
	if docRequest.OwnerID != "" {
		existingDocument.OwnerID = docRequest.OwnerID
	}
	if docRequest.OwnerName != "" {
		existingDocument.OwnerName = docRequest.OwnerName
	}

	if err := db.Save(&existingDocument).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update document information"})
		return
	}

	documentResponse := DocumentResponse{
		ID:          existingDocument.ID,
		Title:       existingDocument.Title,
		Description: existingDocument.Description,
		OwnerID:     existingDocument.OwnerID,
		OwnerName:   existingDocument.OwnerName,
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document updated successfully", "document": documentResponse})
}

// DeleteDocumentHandler deletes a document by ID.
// @Summary Delete a document by ID
// @Description Delete a document by ID
// @ID delete-document
// @Tags Documents
// @Accept json
// @Produce json
// @Param id path string true "Document ID"
// @Success 200 {string} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Security Bearer
// @Router /documents/{id} [delete]
func DeleteDocumentHandler(c *gin.Context) {
	documentIDStr := c.Param("id")
	documentID, err := uuid.Parse(documentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid document ID"})
		return
	}

	db := database.GetDB()

	var existingDocument models.Document
	if err := db.Where("id = ?", documentID).First(&existingDocument).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
	}

	//delete associated file
	directory, err := os.Getwd() //get the current directory using the built-in function
	if err != nil {
		fmt.Println(err) //print the error if obtained
	}
	filepath := strings.Split(directory, "document-manager")[0] + "document-manager/documents/" + documentIDStr + ".pdf"

	if err := os.Remove(filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting document file", "details": err.Error()})
		return
	}

	if err := db.Delete(&existingDocument).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting document", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted successfully"})
}
