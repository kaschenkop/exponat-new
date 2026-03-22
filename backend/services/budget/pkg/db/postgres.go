package db

import (
	"context"
	"database/sql"
	"time"

	_ "github.com/lib/pq"
)

type Pool struct {
	DB *sql.DB
}

func NewPostgresPool(connStr string) (*Pool, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}

	return &Pool{DB: db}, nil
}

func (p *Pool) Close() {
	p.DB.Close()
}
