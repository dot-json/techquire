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
RUN chmod +x /app/main

EXPOSE 8080

USER appuser

CMD ["/app/main"]
    