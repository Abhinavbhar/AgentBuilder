package handler

import (
	"backend/db"
	"context"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

func CreateBot(c *fiber.Ctx) error {
	// Get form values
	title := c.FormValue("title")
	description := c.FormValue("description")
	noOfFilesStr := c.FormValue("no_of_files")
	email := c.FormValue("email")
	fmt.Println(email)
	if title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "title is required",
		})
	}

	n, err := strconv.Atoi(noOfFilesStr)
	if err != nil || n <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid number of files",
		})
	}

	bucketName := "live"
	// Unique folder for this upload
	uniqueID := uuid.New().String()

	var uploadedFiles []string

	// Loop over each file in the form

	for i := 0; i < n; i++ {
		fileKey := "file" + strconv.Itoa(i)
		fileHeader, err := c.FormFile(fileKey)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("file %s is required", fileKey),
			})
		}

		// Upload to MinIO
		objectName := fmt.Sprintf("%s/%s", uniqueID, fileHeader.Filename)
		fmt.Println(objectName)
		file, err := fileHeader.Open()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "cannot open uploaded file",
			})
		}

		defer file.Close()
		_, err = db.Client.PutObject(
			context.Background(),
			bucketName,
			objectName,
			file,
			fileHeader.Size,
			minio.PutObjectOptions{},
		)
		if err != nil {
			fmt.Println(err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to upload file to MinIO",
			})
		}

		uploadedFiles = append(uploadedFiles, objectName)
	}
	// sendind to rabbit q
	qmessage := uniqueID + "mail-:" + email
	SendURLToQueue(qmessage)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message":     "Bot created successfully",
		"title":       title,
		"description": description,
		"files":       uploadedFiles,
		"unique_id":   uniqueID,
	})
}
