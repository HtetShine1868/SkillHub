# SkillHub backend image when Render root directory is the repo root.
# Prefer setting Root Directory to "backend" and using backend/Dockerfile.

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY backend/.mvn .mvn
COPY backend/mvnw backend/pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

COPY backend/src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN useradd --system --uid 1001 --no-create-home spring

COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring /app/app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
