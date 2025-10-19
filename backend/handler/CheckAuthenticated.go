package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
)

func CheckAuthenticated(c *fiber.Ctx) error {
	fmt.Println("came to auth")
	return c.JSON(fiber.Map{
		"email": c.Locals("email"),
		"name":  c.Locals("name"),
	})
}
