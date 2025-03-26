# ---------------------------
# 1) Build Stage
# ---------------------------
FROM golang:latest AS builder

WORKDIR /app

# Copy go.mod and go.sum first
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .

# ---------------------------
# 2) Run Stage
# ---------------------------
FROM alpine:latest

# Create a group and user (optional)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main /app/main
COPY --from=builder /app/.env /app/.env
RUN chmod +x /app/main

# Create required directories with proper permissions
RUN mkdir -p ./static/uploads/profile_pictures && \
    chmod -R 777 ./static && \
    chown -R appuser:appgroup ./static

# Make sure appuser owns all files in /app
RUN chown -R appuser:appgroup /app

EXPOSE 8080
EXPOSE 5432

USER appuser

CMD ["/app/main"]
    