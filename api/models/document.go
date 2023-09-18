package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Document struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string    `gorm:"not null"`
	Description string
	Content     []byte
	OwnerID     string `gorm:"not null"`
	OwnerName   string `gorm:"not null"`
	gorm.Model
}
