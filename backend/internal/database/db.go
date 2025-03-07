package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"techquire-backend/internal/models"
)

// DB is a global variable for simplicity in a small project
var DB *gorm.DB

// ClearDB truncates the relevant tables
func ClearDB() {
    tables := []string{"users", "posts", "solutions", "comments", "reactions", "me_toos", "user_watchlist"}
    for _, table := range tables {
        err := DB.Exec(fmt.Sprintf("TRUNCATE TABLE %s RESTART IDENTITY CASCADE", table)).Error
        if err != nil {
            log.Fatalf("[DB] Failed to clear table %s: %v", table, err)
        }
        log.Printf("[DB] Table %s cleared!", table)
    }
}

// ConnectDB initializes the connection to PostgreSQL
func ConnectDB() {
    dbHost := getEnv("DB_HOST", "localhost")
    dbUser := getEnv("DB_USER", "postgres")
    dbPass := getEnv("DB_PASS", "postgres")
    dbName := getEnv("DB_NAME", "techquire_db")
    dbPort := getEnv("DB_PORT", "5432")

    dsn := fmt.Sprintf(
        "host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
        dbHost, dbUser, dbPass, dbName, dbPort,
    )

    newLogger := logger.New(
        log.New(os.Stdout, "\r\n", log.LstdFlags),
        logger.Config{
            SlowThreshold: time.Second,
            LogLevel:      logger.Silent,
            Colorful:      true,
        },
    )
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: newLogger,
    })
    if err != nil {
        log.Fatalf("[DB] Failed to connect to Postgres: %v", err)
    }

    DB = db
    log.Println("[DB] Connected to Postgres!")

    // Auto-migrate the schema
    log.Println("[DB] Starting auto-migration...")
    if err := DB.AutoMigrate(&models.User{}, &models.Post{}, &models.Comment{}, &models.Solution{}, &models.Reaction{}, &models.MeToo{}); err != nil {
        log.Fatalf("[ERROR] Failed to migrate database: %v", err)
    }
    log.Println("[DB] Auto-migration completed!")

    // Clear tables and seed data
    log.Println("[DB] Clearing tables...")
    ClearDB()
    log.Println("[DB] Seeding tables...")
    SeedAll()
    log.Println("[DB] Seeding completed!")
}

// getEnv gets an environment variable or returns a fallback
func getEnv(key, fallback string) string {
    if val, ok := os.LookupEnv(key); ok {
        return val
    }
    return fallback
}
