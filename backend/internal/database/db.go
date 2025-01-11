package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is a global variable for simplicity in a small project
var DB *gorm.DB

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
            LogLevel:      logger.Warn,
            Colorful:      true,
        },
    )
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: newLogger,
    })
    if err != nil {
        log.Fatalf("Failed to connect to Postgres: %v", err)
    }

    DB = db
    log.Println("Connected to Postgres!")
}

// getEnv gets an environment variable or returns a fallback
func getEnv(key, fallback string) string {
    if val, ok := os.LookupEnv(key); ok {
        return val
    }
    return fallback
}
