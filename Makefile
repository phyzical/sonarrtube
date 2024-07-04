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
	docker run -it --env-file=.env \
		--rm \
		--name ${NAME} \
		-v ${PWD}/cache:/app/cache\
		-v ${PWD}/downloads:/app/downloads \
		-v ${PWD}/cookies.txt:/app/cookies.txt \
		${TAG}
run-image-bash: 
	docker run -it --rm --name ${NAME}-bash \
		-v ${PWD}/cache:/app/cache:rw \
		-v ${PWD}/downloads:/app/downloads:rw \
		-v ${PWD}/cookies.txt:/app/cookies.txt:ro \
		--entrypoint=/bin/bash \
		${TAG}