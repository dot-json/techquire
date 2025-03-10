package models

import (
	"time"

	"gorm.io/gorm"
)

// MeToo model for users indicating they have the same problem
type MeToo struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    PostID    uint           `gorm:"not null" json:"post_id"`
    UserID    uint           `gorm:"not null" json:"user_id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}