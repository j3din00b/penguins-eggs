ARG GITHUB_REPOSITORY
ARG GITHUB_REF_NAME
ARG GITHUB_RUN_NUMBER

FROM debian:12.9

ARG GITHUB_REPOSITORY
ARG GITHUB_REF_NAME
ARG GITHUB_RUN_NUMBER

##USER root
## ENV USER=root
RUN apt-get install sudo
RUN useradd -ms /bin/bash artisan
RUN adduser artisan sudo
USER artisan
WORKDIR /home/artisan

ADD mychroot/ /

RUN /ci/install.sh $GITHUB_REPOSITORY $GITHUB_REF_NAME $GITHUB_RUN_NUMBER

RUN sudo rm -rf /ci/
