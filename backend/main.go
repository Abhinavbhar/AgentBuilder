package main

import (
	"backend/db"
	"backend/handler"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	app := fiber.New(fiber.Config{
		BodyLimit: 20 * 1024 * 1024, // 20 MB
	})
	db.ConnectDb()
	db.Init("localhost:9000", "admin", "admin123", false)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})
	app.Post("/auth/google/signup", handler.Signup)
	//add authentication middleware also
	app.Post("/user/createbot", handler.CreateBot)
	app.Listen("0.0.0.0:8080")
}
