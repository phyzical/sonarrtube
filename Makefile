builds:
	yarn build
install:
	yarn install
run:
	yarn run start
lint:
	yarn run lint-fix
build-image:
	docker build . -t phyzical/sonarrtube
run-image:
	docker run --env-file=.env -v cache:/app/cache phyzical/sonarrtube 