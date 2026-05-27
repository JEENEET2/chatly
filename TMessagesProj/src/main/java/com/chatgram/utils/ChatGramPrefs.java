package com.chatgram.utils;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKeys;
import org.telegram.messenger.ApplicationLoader;

public class ChatGramPrefs {
    private static final String PREFS_NAME = "chatgram_settings";
    private static final String ENCRYPTED_PREFS_NAME = "chatgram_secure_settings";
    
    private static SharedPreferences prefs;
    private static SharedPreferences securePrefs;

    private static synchronized SharedPreferences getPrefs() {
        if (prefs == null) {
            Context context = ApplicationLoader.applicationContext;
            prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        }
        return prefs;
    }

    private static synchronized SharedPreferences getSecurePrefs() {
        if (securePrefs == null) {
            try {
                Context context = ApplicationLoader.applicationContext;
                String masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC);
                securePrefs = EncryptedSharedPreferences.create(
                    ENCRYPTED_PREFS_NAME,
                    masterKeyAlias,
                    context,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                );
            } catch (Exception e) {
                // Fallback to standard SharedPreferences if encryption fails (e.g. older Android or custom ROMs)
                securePrefs = getPrefs();
            }
        }
        return securePrefs;
    }

    // String Prefs
    public static void putString(String key, String value) {
        getPrefs().edit().putString(key, value).apply();
    }

    public static String getString(String key, String def) {
        return getPrefs().getString(key, def);
    }

    // Boolean Prefs
    public static void putBoolean(String key, boolean value) {
        getPrefs().edit().putBoolean(key, value).apply();
    }

    public static boolean getBoolean(String key, boolean def) {
        return getPrefs().getBoolean(key, def);
    }

    // Integer Prefs
    public static void putInt(String key, int value) {
        getPrefs().edit().putInt(key, value).apply();
    }

    public static int getInt(String key, int def) {
        return getPrefs().getInt(key, def);
    }

    // Secure String Prefs
    public static void putSecureString(String key, String value) {
        getSecurePrefs().edit().putString(key, value).apply();
    }

    public static String getSecureString(String key, String def) {
        return getSecurePrefs().getString(key, def);
    }
}
