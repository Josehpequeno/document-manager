package handlers

import (
	"document-manager/api/models"
	"document-manager/database"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DocumentsResponse struct {
	Documents []DocumentResponse `json:"documents"`
}

type DocumentResponse struct {
	ID        uuid.UUID `json:"id"`
	Title     string    `json:"title"`
	OwnerID   string    `json:"owner_id"`
	OwnerName string    `json:"owner_name"`
}

type DocumentRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	OwnerID     string `json:"owner_id"`
	OwnerName   string `json:"owner_name"`
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
	if query.Error != nil {
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

// CreateDocumentHandler creates a new document.
// @Summary Create a new document
// @Description Create a new document
// @ID create-document
// @Tags Documents
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Document file"
// @Success 201 {object} DocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /documents [post]
func CreateDocumentHandler(c *gin.Context) {
	err := c.Request.ParseMultipartForm(200 << 20) // 200 MB limit
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing form", "details": err.Error()})
		return
	}

	var docRequest DocumentRequest
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

	filename := header.Filename + time.Now().Format("2006-01-02_15-04-05")

	err = c.SaveUploadedFile(header, "./uploads/"+filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error saving file", "details": err.Error()})
		return
	}

	db := database.GetDB()

	newDocument := models.Document{
		Title:       docRequest.Title,
		Description: docRequest.Description,
		OwnerID:     docRequest.OwnerID,
		OwnerName:   docRequest.OwnerName,
		FilePath:    "./uploads/" + filename,
	}

	if err := db.Create(&newDocument).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating document", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, newDocument)
}

// UploadDocumentHandler uploads a document with a file.
// @Summary Upload a document with a file
// @Description Upload a document with a file
// @ID upload-document
// @Tags Documents
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Document file"
// @Success 200 {object} DocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /documents/upload/{id} [put]
func UploadDocumentHandler(c *gin.Context) {
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

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}
	defer file.Close()

	filename := header.Filename

	db := database.GetDB()
	document := models.Document{
		ID:          documentID,
		Title:       docRequest.Title,
		Description: docRequest.Description,
		OwnerID:     docRequest.OwnerID,
		OwnerName:   docRequest.OwnerName,
		FilePath:    "./uploads/" + filename,
	}

	if err := db.Save(&document).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update document information"})
		return
	}

	response := DocumentResponse{
		ID:        document.ID,
		Title:     document.Title,
		OwnerID:   document.OwnerID,
		OwnerName: document.OwnerName,
	}

	c.JSON(http.StatusOK, response)

}

// UploadDocumentWithoutFileHandler uploads a document without a file.
// @Summary Upload a document without a file
// @Description Upload a document without a file
// @ID upload-document-no-file
// @Tags Documents
// @Produce json
// @Success 200 {object} DocumentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /documents/{id} [put]
func UploadDocumentWithoutFileHandler(c *gin.Context) {
	// Your implementation here
}
