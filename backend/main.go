package main

import (
	database "backend/dataBase"
	"backend/handler"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	database.ConnectDb()
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})
	app.Post("/auth/google/signup", handler.Signup)
	log.Fatal(app.Listen(":8080"))
}
