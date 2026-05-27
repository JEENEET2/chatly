package com.chatgram.features.decoyvault;

import android.text.TextUtils;
import com.chatgram.utils.ChatGramPrefs;
import java.security.MessageDigest;

public class DecoyVaultManager {
    private static final String KEY_DECOY_PIN_HASH = "decoy_pin_hash";
    private static final String KEY_DECOY_ENABLED = "decoy_vault_enabled";
    
    private static boolean decoySessionActive = false;

    public static boolean isDecoyVaultEnabled() {
        return ChatGramPrefs.getBoolean(KEY_DECOY_ENABLED, false);
    }

    public static void setDecoyVaultEnabled(boolean enabled) {
        ChatGramPrefs.putBoolean(KEY_DECOY_ENABLED, enabled);
    }

    public static void setDecoyPasscode(String passcode) {
        if (TextUtils.isEmpty(passcode)) {
            ChatGramPrefs.putSecureString(KEY_DECOY_PIN_HASH, "");
            return;
        }
        try {
            String hash = sha256(passcode);
            ChatGramPrefs.putSecureString(KEY_DECOY_PIN_HASH, hash);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static boolean checkDecoyPasscode(String passcode) {
        if (!isDecoyVaultEnabled()) {
            return false;
        }
        String storedHash = ChatGramPrefs.getSecureString(KEY_DECOY_PIN_HASH, "");
        if (TextUtils.isEmpty(storedHash)) {
            return false;
        }
        try {
            String hash = sha256(passcode);
            return storedHash.equals(hash);
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean isDecoySessionActive() {
        return decoySessionActive;
    }

    public static void setDecoySessionActive(boolean active) {
        decoySessionActive = active;
    }

    private static String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes("UTF-8"));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
