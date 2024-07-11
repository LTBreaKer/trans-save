all:
	docker-compose up --build

blockchain:
	docker-compose up -d blockchain --build

down:
	docker-compose down -v

clean:
	docker-compose down -v
	docker rmi -f $(shell docker images -q)

re: clean all