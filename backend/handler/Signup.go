package handler

import (
	database "backend/db"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type SignupData struct {
	Cred string `json:"credential"` // token from frontend
}

type GoogleTokenInfo struct {
	Issuer        string `json:"iss"`
	Azp           string `json:"azp"`
	Audience      string `json:"aud"`
	Sub           string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Iat           string `json:"iat"`
	Exp           string `json:"exp"`
	Jti           string `json:"jti"`
	Alg           string `json:"alg"`
	Kid           string `json:"kid"`
	Typ           string `json:"typ"`
}

func Signup(c *fiber.Ctx) error {
	var req SignupData
	fmt.Println("a req came")
	if err := c.BodyParser(&req); err != nil || req.Cred == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing or invalid credential"})
	}

	// Call Google token info endpoint
	resp, err := http.Get("https://oauth2.googleapis.com/tokeninfo?id_token=" + req.Cred)
	if err != nil {
		fmt.Println("Error fetching Google token info:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to contact Google"})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to read response"})
	}

	var tokenInfo GoogleTokenInfo
	if err := json.Unmarshal(bodyBytes, &tokenInfo); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse Google response"})
	}

	// Check if user exists in DB
	var exists bool
	derr := database.Conn.QueryRow(context.Background(), `SELECT EXISTS(SELECT 1 FROM Users WHERE email=$1)`, tokenInfo.Email).Scan(&exists)
	if derr != nil {
		fmt.Println("database error", derr)
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email": tokenInfo.Email,
			"name":  tokenInfo.Name,
			"exp":   time.Now().Add(time.Hour * 24 * 30).Unix(),
		})

	tokenString, tokenErr := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if tokenErr != nil {
		fmt.Println("err signing the token", tokenErr)
		c.Status(fiber.StatusInternalServerError)
		return c.JSON("internal server error")
	}

	// Insert user if not exists
	if !exists {
		_, databaseEntryErr := database.Conn.Exec(context.Background(), `INSERT INTO Users (email,name,picture) VALUES($1,$2,$3)`,
			tokenInfo.Email, tokenInfo.Name, tokenInfo.Picture,
		)
		if databaseEntryErr != nil {
			fmt.Println("database error", databaseEntryErr)
			c.Status(fiber.StatusInternalServerError)
			return c.JSON(fiber.Map{"message": "database error"})
		}
	}

	// Set JWT as HttpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "token",
		Value:    tokenString,
		HTTPOnly: true,                      // cannot be accessed by JS
		Secure:   true,                      // only over HTTPS
		SameSite: "Strict",                  // prevent CSRF
		Path:     "/",                       // available for all paths
		MaxAge:   time.Now().Hour() + 24*30, // 30 days in seconds
	})

	// Return JSON response as well
	message := "Signup/Login successful"
	if exists {
		message = "User already exists"
	}

	return c.JSON(fiber.Map{
		"message": message, // optional, frontend may not need it if using cookie
	})
}
