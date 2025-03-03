FROM rockylinux/rockylinux:9.5.20241118 AS base
ENV APP_DIR=/app
ENV IS_DOCKER=true
ENV XDG_DATA_HOME="/tmp"

RUN groupadd -g 10001 app \
    && useradd -u 10001 -g 10001 --home ${APP_DIR} -ms /bin/bash app

RUN yum -y update \
    && yum -y install \
    # renovate: datasource=yum repo=rocky-9-extras-x86_64
    epel-release-9-7.el9 \
    && yum -y install \
    chromium \
    # renovate: datasource=yum repo=rocky-9-appstream-x86_64
    git-2.43.5-2.el9_5 \
    && yum -y clean all \
    && rm -rf /var/cache/yum

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER app

WORKDIR ${APP_DIR}

RUN mkdir -p ./tmp
COPY .FORCE_NEW_DOCKER_BUILD .FORCE_NEW_DOCKER_BUILD

ENV LC_ALL="C.UTF-8"
ENV LANG="C.UTF-8"

FROM base AS build
USER root

RUN yum -y update \
    && dnf module install -y nodejs:22 \
    && yum install -y \
    # renovate: datasource=yum repo=epel-9-everything-x86_64
    yarnpkg-1.22.22-5.el9  \
    && yum -y clean all \
    && rm -rf /var/cache/yum

# use ldd to get required libs
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN ldd \
    /usr/bin/node \
    | tr -s "[:blank:]" "\n" | grep "^/" | sed "/\/usr\/bin\//d" | \
    xargs -I % sh -c "mkdir -p /\$(dirname deps%); cp % /deps%;"

USER app

COPY --chown=app ./package.json ./yarn.lock ./
RUN yarn install

COPY --chown=app ./ ./

RUN yarn build

USER app

FROM base AS final
USER root

COPY --from=build /usr/lib/node_modules /usr/bin/node_modules
RUN ln -s /usr/bin/node_modules/yarn/bin/yarn /usr/bin/yarn

USER app

COPY --from=build /deps/lib64 /usr/lib64/
COPY --from=build /usr/bin/node /usr/lib/node_modules/npm/bin/npm /usr/bin/
COPY --from=build --chown=app ${APP_DIR}/node_modules ${APP_DIR}/node_modules
COPY --from=build --chown=app ${APP_DIR}/build ${APP_DIR}/build
COPY --chown=app ./main.js ./boot.sh ./package.json ./

USER root

RUN find / -path /proc -prune -o -perm /u=s,g=s -type f -print -exec rm {} \;

USER app

ARG RELEASE_VERSION="VERSION_PROVIDED_ON_BUILD"
ENV RELEASE_VERSION=$RELEASE_VERSION

ENTRYPOINT [ "/app/boot.sh" ]
CMD [ "node", "main.js" ]