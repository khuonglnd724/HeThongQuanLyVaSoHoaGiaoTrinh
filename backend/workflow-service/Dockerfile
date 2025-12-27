# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
RUN mvn -q -B -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests clean package

# Run stage
FROM eclipse-temurin:21-jre
ENV JAVA_OPTS=""
WORKDIR /app
EXPOSE 8084
COPY --from=build /workspace/target/*-SNAPSHOT.jar /app/app.jar
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
