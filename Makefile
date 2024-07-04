BUILD_TARGET=final
NAME=sonarrtube
TAG=phyzical/${NAME}:${BUILD_TARGET}

watch:
	yarn run watch
install:
	yarn install
run:
	yarn run start
lint:
	yarn run lint-fix
build-image:
	docker build . --target ${BUILD_TARGET} -t ${TAG}
run-image:
	docker run -it --env-file=.env -v cache:/app/cache \
		--rm \
		--name ${NAME} \
		-v downloads:/app/downloads \
		-v cookies.txt:/app/cookies.txt \
		${TAG}
run-image-bash: 
	docker run -it --rm --name ${NAME}-bash \
		--entrypoint=/bin/bash \
		${TAG}