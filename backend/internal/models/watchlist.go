package models

import "time"

// Watchlist model for users watching posts
type UserWatchlist struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    PostID    uint           `gorm:"not null" json:"post_id"`
    UserID    uint           `gorm:"not null" json:"user_id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
}

// TableName overrides the table name used by UserWatchlist to `user_watchlist`
func (UserWatchlist) TableName() string {
    return "user_watchlist"
}