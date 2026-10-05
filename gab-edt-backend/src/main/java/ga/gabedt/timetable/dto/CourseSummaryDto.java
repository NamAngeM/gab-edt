package ga.gabedt.timetable.dto;

import java.util.UUID;

/**
 * Enseignement (matière x enseignant x classe) et son suivi horaire.
 *
 * @param plannedHours   volume prévu (null si non renseigné)
 * @param scheduledHours séances posées au planning, hors annulations (passées et à venir)
 * @param doneHours      séances terminées (non annulées, fin dans le passé)
 * @param cancelledHours séances annulées
 * @param madeUpHours    rattrapages posés (non annulés)
 * @param toMakeUpHours  séances annulées encore sans rattrapage
 * @param remainingHours volume prévu restant à planifier (prévu - planifié), null si pas de prévu
 */
public record CourseSummaryDto(
        UUID id,
        SubjectDto subject,
        TeacherDto teacher,
        GroupDto group,
        Double plannedHours,
        double scheduledHours,
        double doneHours,
        double cancelledHours,
        double madeUpHours,
        double toMakeUpHours,
        Double remainingHours
) {}
