FROM maven:3-jdk-8

#RUN curl -s http://skullabs.github.io/kikaha-cli/installer | bash
RUN curl -s http://download.kikaha.io/installer | bash

RUN wget https://github.com/rancher/rancher-compose/releases/download/v0.7.3/rancher-compose-linux-amd64-v0.7.3.tar.gz \
  -O /tmp/rancher-compose.tar.gz && \
  tar -xvf /tmp/rancher-compose.tar.gz -C /tmp && \
  mkdir -p /rancher/bin && \
  cp /tmp/rancher-compose-*/rancher-compose /rancher/bin/ && \
  chmod +x /rancher/bin/rancher-compose

ENV PATH /root/.kikaha:/rancher/bin/:$PATH

RUN mkdir /apps

# ------------------------------------------------------------------------------
# Install base
RUN apt-get update \
  && apt-get install -y \
   build-essential \
   g++ \
   curl \
   libssl-dev \
   apache2-utils \
   git \
   libxml2-dev \
   sshfs

# ------------------------------------------------------------------------------
# Add volumes
RUN git clone https://8a1f3cd6467eda9be1c10cfb80e2a3835e239954:x-oauth-basic@github.com/autoshift/autoshift-api.git

# ------------------------------------------------------------------------------
# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get install -y nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ------------------------------------------------------------------------------
# Install Cloud9
RUN git clone https://github.com/c9/core.git /opt/cloud9
WORKDIR /opt/cloud9
RUN scripts/install-sdk.sh

# Tweak standlone.js conf
RUN sed -i -e 's_127.0.0.1_0.0.0.0_g' /opt/cloud9/configs/standalone.js

EXPOSE 80

VOLUME ["/autoshift-api","/apps"]

CMD node /opt/cloud9/server.js --listen 0.0.0.0 --port 80 --auth $RANCHER_ACCESS_KEY:$RANCHER_SECRET_KEY -w /autoshift-api
