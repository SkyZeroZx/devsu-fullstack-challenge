FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml ./
COPY api-gateway/pom.xml ./api-gateway/
COPY banking-service/pom.xml ./banking-service/
COPY auth-service/pom.xml ./auth-service/

RUN mvn dependency:go-offline -pl api-gateway -am -B

COPY api-gateway/src ./api-gateway/src

RUN mvn package -pl api-gateway -am -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/api-gateway/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
