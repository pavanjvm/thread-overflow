.PHONY: install dev frontend backend lint typecheck build db-push db-generate

install:
	npm install

dev:
	@trap 'kill 0' INT TERM EXIT; \
	npm run dev:api & \
	npm run dev

frontend:
	npm run dev

backend:
	npm run dev:api

lint:
	npm run lint

typecheck:
	npm run typecheck

build:
	npm run build

db-push:
	npm run db:push

db-generate:
	npm run db:generate
