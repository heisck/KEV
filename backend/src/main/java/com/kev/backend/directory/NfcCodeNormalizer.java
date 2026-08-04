package com.kev.backend.directory;

import java.util.Locale;

/** Canonical form for NFC UIDs exchanged between UITS, devices, and the API. */
public final class NfcCodeNormalizer {

    private NfcCodeNormalizer() {}

    public static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().replaceAll("[^A-Za-z0-9]", "").toLowerCase(Locale.ROOT);
    }
}
