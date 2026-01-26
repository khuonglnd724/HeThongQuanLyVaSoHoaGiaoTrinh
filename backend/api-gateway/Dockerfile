FROM eclipse-temurin:21-jre
ENV JAVA_OPTS=""
WORKDIR /app
EXPOSE 8080
# Expect the host build process to produce the jar under target/ (script builds JARs before docker build)
COPY target/*-SNAPSHOT.jar /app/app.jar
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
