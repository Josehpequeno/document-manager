package handlers

import (
	"document-manager/api/models"
	"document-manager/database"
	"net/http"
	"strconv"

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
