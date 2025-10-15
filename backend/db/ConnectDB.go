package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

var Conn *pgx.Conn

func ConnectDb() {
	//psqlInfo := ""
	var err error
	connUrl := "postgres://postgres:loda@localhost:5432/postgres?sslmode=disable"
	Conn, err = pgx.Connect(context.Background(), connUrl)

	if err != nil {
		fmt.Println("err conn", err)
	}

	_, errExecuting := Conn.Exec(context.Background(), Ddl)
	if errExecuting != nil {
		fmt.Println("error executing ddl sq;", errExecuting)
	}
	fmt.Println("connected")
}
