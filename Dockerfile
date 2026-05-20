# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle build.gradle
COPY settings.gradle settings.gradle
COPY src src

# Make gradlew executable and build the application
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy only the fat JAR from the builder stage (exclude -plain.jar)
COPY --from=builder /app/build/libs/fullstackproject-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
