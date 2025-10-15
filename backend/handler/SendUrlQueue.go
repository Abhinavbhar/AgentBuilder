package handler

import (
	"fmt"
	"log"

	"github.com/streadway/amqp"
)

// failOnError is just a helper for clean error handling
func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

// SendURLToQueue connects to RabbitMQ and sends a given URL to the queue
func SendURLToQueue(url string) {
	// Connect to RabbitMQ
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	// Open a channel
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	// Declare (or ensure existence of) the queue
	q, err := ch.QueueDeclare(
		"minio_urls", // queue name
		true,         // durable (survives restarts)
		false,        // auto-delete
		false,        // exclusive
		false,        // no-wait
		nil,          // args
	)
	failOnError(err, "Failed to declare a queue")

	// Publish the URL message
	err = ch.Publish(
		"",     // default exchange
		q.Name, // routing key (same as queue name)
		false,  // mandatory
		false,  // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(url),
		})
	failOnError(err, "Failed to publish URL")

	fmt.Printf("✅ Sent MinIO URL: %s\n", url)
}

// Example usage
