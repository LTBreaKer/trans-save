all:
	docker-compose up --build

down:
	docker-compose down -v

clean:
	docker-compose down -v
	docker rmi -f $(shell docker images -q)

re: clean all