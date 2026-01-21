# Multi-stage Dockerfile for academic-service
# Build stage: compile with Maven
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy only pom first to leverage layer caching for dependencies
COPY pom.xml ./
RUN mvn -q -B -DskipTests dependency:go-offline

# Copy source and build
COPY src ./src
RUN mvn -q -B -DskipTests clean package

# Run stage: use lightweight JRE
FROM eclipse-temurin:21-jre
ENV JAVA_OPTS=""
WORKDIR /app
EXPOSE 8082

# Copy the application jar from the build stage
COPY --from=build /workspace/target/*-SNAPSHOT.jar /app/app.jar

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
