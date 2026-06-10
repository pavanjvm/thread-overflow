.PHONY: install dev frontend backend lint typecheck build db-push db-generate

install:
	npm --prefix frontend install
	npm --prefix backend install

dev:
	@trap 'kill 0' INT TERM EXIT; \
	npm run dev:api & \
	npm run dev:frontend

frontend:
	npm run dev:frontend

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
