package models

import (
	"time"

	"github.com/google/uuid"
)

type Document struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string     `gorm:"not null" json:"title"`
	Description string     `json:"description"`
	FilePath    string     `json:"filepath"`
	OwnerID     string     `json:"owner_id" gorm:"not null"`
	OwnerName   string     `json:"owner_name" gorm:"not null"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	DeletedAt   *time.Time `json:"deletedAt"`
}
