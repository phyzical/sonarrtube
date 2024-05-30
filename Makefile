build:
	yarn build
install:
	yarn install
run:
	yarn run
build-image:
	docker build . -t phyzical/sonarrtube
run-image:
	docker run phyzical/sonarrtube