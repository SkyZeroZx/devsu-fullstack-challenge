FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml ./
COPY api-gateway/pom.xml ./api-gateway/
COPY banking-service/pom.xml ./banking-service/
COPY auth-service/pom.xml ./auth-service/

RUN mvn dependency:go-offline -pl auth-service -am -B

COPY auth-service/src ./auth-service/src

RUN mvn package -pl auth-service -am -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/auth-service/target/*.jar app.jar

EXPOSE 8091

ENTRYPOINT ["java", "-jar", "app.jar"]
