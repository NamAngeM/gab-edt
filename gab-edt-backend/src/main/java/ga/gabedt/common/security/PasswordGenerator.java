package ga.gabedt.common.security;

import java.security.SecureRandom;

/**
 * Génère des mots de passe provisoires aléatoires, lisibles (sans caractères ambigus
 * comme 0/O ou 1/l) pour pouvoir être recopiés depuis une fiche imprimée.
 */
public final class PasswordGenerator {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int LENGTH = 12;

    private PasswordGenerator() {
    }

    public static String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
