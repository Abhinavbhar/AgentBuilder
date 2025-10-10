package handler

import (
	database "backend/dataBase"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
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

	// Decode JSON response
	var tokenInfo GoogleTokenInfo
	if err := json.Unmarshal(bodyBytes, &tokenInfo); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse Google response"})
	}

	// 1️⃣ Verify issuer
	if tokenInfo.Issuer != "https://accounts.google.com" && tokenInfo.Issuer != "accounts.google.com" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid issuer"})
	}

	// 2️⃣ Verify audience (replace with your actual client ID)
	const clientID = "59155913835-mp7c1mgg8rvcv60uf6mj5i608cnu42q3.apps.googleusercontent.com"
	if tokenInfo.Audience != clientID {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid audience"})
	}

	// 3️⃣ Verify email is confirmed
	if tokenInfo.EmailVerified != "true" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Email not verified"})
	}

	// TODO: Create or fetch user in your DB here
	var exists bool
	derr := database.Conn.QueryRow(context.Background(), `SELECT EXISTS(SELECT 1 FROM Users where email=$1)`, tokenInfo.Email).Scan(&exists)
	if derr != nil {
		fmt.Println("database error", derr)
	}
	// will make it go fluent when writing the signin logic it will be just a copy paste of that
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"username": tokenInfo.Name,
			"exp":      time.Now().Add(time.Hour * 24).Unix(),
		})
	godotenv.Load()

	tokenString, tokenErr := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if tokenErr != nil {
		fmt.Println("err signing the token", tokenErr)
		c.Status(fiber.StatusInternalServerError)
		return c.JSON("internal server error")
	}

	if exists {
		return c.JSON(fiber.Map{
			"message": "user already exists",
			"token":   tokenString,
		})
	}
	if !exists {

		_, databaseEntryErrpo := database.Conn.Exec(context.Background(), `INSERT INTO Users (email,name,picture) VALUES($1,$2,$3)`,

			tokenInfo.Email, tokenInfo.Name, tokenInfo.Picture,
		)
		if databaseEntryErrpo != nil {
			fmt.Println("database error", databaseEntryErrpo)
			c.Status(fiber.StatusInternalServerError)
			return c.JSON(fiber.Map{
				"message": "database error",
			})
		}
	}

	return c.JSON(fiber.Map{
		"message": "Signup/Login successful",
		"token":   tokenString,
	})
}
