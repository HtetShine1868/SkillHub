# SkillHub backend — multi-stage image for Render / any Docker host
# Root Directory on Render: backend
# Runtime: Docker

FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

COPY src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN useradd --system --uid 1001 --no-create-home spring

COPY --from=build /app/target/*.jar app.jar
RUN chown spring:spring /app/app.jar

USER spring

EXPOSE 8080

# Render injects PORT. Spring also reads server.port from application.properties.
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
