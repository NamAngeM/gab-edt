# ==============================================================================
# GAB-EDT Backend — Dockerfile
# ==============================================================================
# Build multi-stage : Maven build → Java runtime
# ==============================================================================

# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copier les fichiers Maven wrapper et pom.xml d'abord (cache Docker)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Télécharger les dépendances (layer séparée pour le cache)
RUN ./mvnw dependency:go-offline -B

# Copier le code source
COPY src/ src/

# Build de l'application (skip tests pour le build Docker)
RUN ./mvnw clean package -DskipTests -B

# ── Stage 2 : Runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Copier le JAR depuis le stage de build
COPY --from=builder /app/target/*.jar app.jar

# Changer le propriétaire
RUN chown appuser:appgroup app.jar

# Basculer vers l'utilisateur non-root
USER appuser

# Exposition du port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Démarrage de l'application
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
