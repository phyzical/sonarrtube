FROM rockylinux:9.3.20231119 as base
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
    # renovate: datasource=yum repo=epel-9-everything-x86_64
    chromium-126.0.6478.126-1.el9 \
    # renovate: datasource=yum repo=rocky-9-appstream-x86_64
    git-2.43.5-1.el9_4 \
    && yum -y clean all \
    && rm -rf /var/cache/yum

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER app

WORKDIR ${APP_DIR}

COPY .FORCE_NEW_DOCKER_BUILD .FORCE_NEW_DOCKER_BUILD

ENV LC_ALL="C.UTF-8"
ENV LANG="C.UTF-8"

FROM base as build
USER root

RUN yum -y update \
    && dnf module install -y nodejs:20 \
    && yum install -y \
    # renovate: datasource=yum repo=epel-9-everything-x86_64
    yarnpkg-1.22.19-5.el9  \
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

# RUN yarn test
RUN yarn lint && \
    yarn build

# FROM base as dependencies
# # This layer gets discarded to reduce the production image size. Only the dependencies
# # built here will be copied into the production stage.
# USER root

# # Add other dependencies
# RUN yum -y install \
#     --enablerepo=devel \
#     # renovate: datasource=yum repo=rocky-9-baseos-x86_64
#     xz-5.2.5-8.el9_0 \
#     # renovate: datasource=yum repo=rocky-9-appstream-x86_64
#     gcc-11.4.1-2.1.el9 \
#     # renovate: datasource=yum repo=rocky-9-appstream-x86_64
#     gcc-c++-11.4.1-2.1.el9 \
#     # renovate: datasource=yum repo=rocky-9-baseos-x86_64
#     make-4.3-7.el9 \
#     # renovate: datasource=yum repo=rocky-9-baseos-x86_64
#     unzip-6.0-56.el9 \
#     # renovate: datasource=yum repo=rocky-9-appstream-x86_64
#     automake-1.16.2-8.el9 \
#     # renovate: datasource=yum repo=rocky-9-appstream-x86_64
#     readline-devel-8.1-4.el9 \
#     # renovate: datasource=yum repo=rocky-9-appstream-x86_64
#     openssl-devel-3.0.7-25.el9_3 \
#     # renovate: datasource=yum repo=rocky-9-baseos-x86_64
#     bzip2-1.0.8-8.el9 \
#     # renovate: datasource=yum repo=rocky-9-crb-x86_64
#     mysql-devel-8.0.36-1.el9_3 \
#     && yum -y clean all \
#     && rm -rf /var/cache/yum

FROM base as final

USER app

COPY --from=build /usr/bin/node /usr/lib/node_modules/npm/bin/npm /usr/bin/
COPY --from=build --chown=app ${APP_DIR}/build ${APP_DIR}/build
COPY --chown=app ./main.js ./main.js

USER root

RUN find / -path /proc -prune -o -perm /u=s,g=s -type f -print -exec rm {} \;

USER app

ARG RELEASE_VERSION="VERSION_PROVIDED_ON_BUILD"
ENV RELEASE_VERSION $RELEASE_VERSION

ENTRYPOINT ["node"]
CMD ["main.js"]