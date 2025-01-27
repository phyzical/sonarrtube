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
	docker build . --platform=linux/amd64 --target ${BUILD_TARGET} -t ${TAG}
run-image:
	docker run -it --env-file=.env \
		--rm \
		--name ${NAME} \
		--platform=linux/amd64 \
		-v ${PWD}/cache:/app/cache\
		-v ${PWD}/downloads:/app/downloads \
		-v ${PWD}/cookies.txt:/app/cookies.txt \
		${TAG}
TARGET=
run-image-tests:
	docker run -it \
		--rm \
		--platform=linux/amd64 \
		--name ${NAME} \
		-v ${PWD}/tests:/app/tests \
		-v ${PWD}/src:/app/src \
		-v ${PWD}/jest.config.ts:/app/jest.config.ts \
		-v ${PWD}/tsconfig.build.json:/app/tsconfig.build.json \
		-v ${PWD}/tsconfig.json:/app/tsconfig.json \
		${TAG} \
		yarn test ${TARGET}
run-image-bash: 
	docker run -it --rm --name ${NAME}-bash \
		-v ${PWD}/cache:/app/cache:rw \
		--platform=linux/amd64 \
		-v ${PWD}/downloads:/app/downloads:rw \
		-v ${PWD}/cookies.txt:/app/cookies.txt:ro \
		--entrypoint=/bin/bash \
		${TAG}
# Use this if the tests bug out and you have a bazilion chromes running
kill-chromes:
	pkill -f "chrome"