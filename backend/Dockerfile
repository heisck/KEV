# syntax=docker/dockerfile:1
# Render (and any container host) build for the KEV backend. There is no native Java
# runtime on Render, so the service is deployed as a Docker image.

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Resolve dependencies from the pom alone so a source-only change reuses this layer.
COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
# Tests run in CI (with Testcontainers + Docker); an image build has neither, and
# repeating them here would double every deploy.
RUN mvn -B -q package -DskipTests

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Heap is sized from the container limit rather than the host's, so the JVM does not
# assume memory the plan does not have and get OOM-killed.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC" \
    SPRING_PROFILES_ACTIVE=prod \
    PORT=8080

COPY --from=build /build/target/*.jar app.jar

# Rolling log files land here; the app runs unprivileged.
RUN useradd --system --create-home --uid 10001 kev && \
    mkdir -p /app/logs && chown -R kev:kev /app
USER kev

EXPOSE 8080
# Render assigns the port at runtime — bind to it, falling back to 8080 elsewhere.
CMD ["sh", "-c", "exec java -jar app.jar --server.port=${PORT:-8080}"]
