# ── Stage 1: build Maven ──────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Scarica le dipendenze (layer cacheable separato)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Compila e pacchettizza (skip test: eseguiti in CI)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: runtime JRE minimale ─────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup --system --gid 1001 spring \
 && adduser  --system --uid 1001 spring -G spring

COPY --from=builder /app/target/*.jar app.jar

# Directory upload e logs (montate come volume in prod)
RUN mkdir -p /app/uploads /app/logs && chown -R spring:spring /app/uploads /app/logs

USER spring
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
