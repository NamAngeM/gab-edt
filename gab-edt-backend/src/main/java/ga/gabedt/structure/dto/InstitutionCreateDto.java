package ga.gabedt.structure.dto;

import ga.gabedt.structure.InstitutionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Création d'un établissement client et de son premier administrateur (SUPER_ADMIN uniquement).
 */
public record InstitutionCreateDto(
        @NotBlank String name,
        @NotBlank @Size(max = 20) String code,
        @NotNull InstitutionType type,
        String city,
        @NotBlank @Email String adminEmail,
        @NotBlank String adminFirstName,
        @NotBlank String adminLastName,
        @NotBlank @Size(min = 12, message = "Le mot de passe doit contenir au moins 12 caractères") String adminPassword
) {}
