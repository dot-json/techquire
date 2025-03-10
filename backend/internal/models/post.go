package models

import "time"

// Post represents a post created by a user
type Post struct {
    ID          uint      `gorm:"primaryKey"`
    Title       string    `gorm:"not null"`
    Content     string    `gorm:"not null"`
    UserID      uint      `gorm:"not null"` // Foreign key to User
    CreatedAt   time.Time
    UpdatedAt   time.Time
    Comments    []Comment `gorm:"foreignKey:PostID"` // One-to-many relationship with Comment
    MeTooCount  int       `gorm:"default:0"` // Number of "me too" expressions
    MeToos      []MeToo   `gorm:"foreignKey:PostID"` // One-to-many relationship with MeToo
}