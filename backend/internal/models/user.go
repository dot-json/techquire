package models

import "time"

// User is a minimal GORM model
type User struct {
    ID                uint       `gorm:"primaryKey"`
    Email             string     `gorm:"unique;not null"`
    Username          string     `gorm:"unique;not null"`
    Password          string     `gorm:"not null"`
    Role              string     `gorm:"default:'user'"` // User role: user, moderator, admin
    ProfilePictureURL *string    `gorm:"null"` // Nullable profile picture URL
    Reputation        int        `gorm:"default:0"` // User reputation points
    NumberOfPosts     int        `gorm:"default:0"` // Number of posts created by the user
    NumberOfSolutions int        `gorm:"default:0"` // Number of solutions provided by the user
    CreatedAt         time.Time
    UpdatedAt         time.Time
    
    Posts             []Post     `gorm:"foreignKey:UserID"` // One-to-many relationship with Post
    Comments          []Comment  `gorm:"foreignKey:UserID"` // One-to-many relationship with Comment
    Watchlist         []Post     `gorm:"many2many:user_watchlist"` // Many-to-many relationship with Post for watchlist
    MeTooPosts        []Post     `gorm:"many2many:me_toos;joinForeignKey:UserID;joinReferences:PostID"` // Many-to-many for metoos
}
