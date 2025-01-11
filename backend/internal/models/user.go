package models

import "time"

// User is a minimal GORM model
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Email    string `gorm:"unique;not null"`
    Username  string    `gorm:"unique;not null"`
    Password string `gorm:"not null"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
