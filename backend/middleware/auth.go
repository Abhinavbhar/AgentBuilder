package middleware

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type tokenInfo struct {
	name  string `json:"name"`
	email string `json:"email`
}

func AuthMiddleware(c *fiber.Ctx) error {
	tokenStr := c.Cookies("token")
	fmt.Println(tokenStr, "token came")

	if tokenStr == "" {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{"error": "ur token is not authorized please signin"})
	}
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "token is unauthorized please signin again"})
	}
	claims := token.Claims.(jwt.MapClaims)
	var info tokenInfo
	info.email = claims["email"].(string)
	info.name = claims["name"].(string)
	c.Locals("name", info.name)
	c.Locals("email", info.email)
	return c.Next()
}
