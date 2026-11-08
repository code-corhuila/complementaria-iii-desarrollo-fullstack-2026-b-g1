FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
COPY src src

RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

RUN groupadd -r gamevault && \
    useradd -r -g gamevault gamevault

COPY --from=build /app/target/*.jar app.jar

USER gamevault
EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]
