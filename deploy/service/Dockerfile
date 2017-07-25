FROM 1science/java:oracle-jdk-8

#install and build kikaha package
RUN mkdir -p /openview-api-src/
COPY . /openview-api-src/

ENV MVNVER 3.3.9

# install mvn kikaha and build the openview-api package
RUN cd / && \
    PATH=/root/.kikaha/:/apache-maven-$MVNVER/bin/:$PATH && \
    curl -s http://download.kikaha.io/installer | bash && \
    wget http://mirrors.koehn.com/apache/maven/maven-3/$MVNVER/binaries/apache-maven-$MVNVER-bin.zip && \
    unzip /apache-maven-$MVNVER-bin.zip && \
    cd /openview-api-src/ && \
    kikaha package && \
    cp target/openview-api-0.0.1-SNAPSHOT.zip /tmp/openview-api.zip && \
    unzip /tmp/openview-api.zip -d /tmp \
    && rm /tmp/openview-api.zip \
    && mv /tmp/openview-api-* /openview-api \
    && chmod +x /openview-api/bin/*.sh

# clean up
RUN rm -rf /openview-api-src/ /root/.kikaha/ /apache-maven-$MVNVER/bin/ /apache-maven-$MVNVER-bin.zip

COPY templates /openview-api/templates

ENV PATH /openview-api/bin/:$PATH

WORKDIR /

CMD kikaha.sh debug
