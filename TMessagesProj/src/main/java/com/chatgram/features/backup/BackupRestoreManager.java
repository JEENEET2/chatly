package com.chatgram.features.backup;

import android.content.Context;
import com.chatgram.utils.ChatGramPrefs;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;

public class BackupRestoreManager {

    private static final String[] BACKUP_KEYS = {
        "ghost_suppress_read",
        "ghost_hide_typing",
        "notification_filter_enabled",
        "notification_filter_keywords",
        "decoy_vault_enabled"
        // Excluding "decoy_pin_hash" for security reasons
    };

    public interface BackupCallback {
        void onSuccess();
        void onError(String error);
    }

    public static void exportBackup(File file, BackupCallback callback) {
        try {
            Map<String, Object> data = new HashMap<>();
            
            // Read non-sensitive settings keys
            for (String key : BACKUP_KEYS) {
                // Determine if key is boolean or string
                if (key.endsWith("_enabled") || key.startsWith("ghost_")) {
                    data.put(key, ChatGramPrefs.getBoolean(key, false));
                } else {
                    data.put(key, ChatGramPrefs.getString(key, ""));
                }
            }

            // Write to file
            Gson gson = new Gson();
            try (FileWriter writer = new FileWriter(file)) {
                gson.toJson(data, writer);
            }
            callback.onSuccess();
        } catch (Exception e) {
            callback.onError(e.getMessage());
        }
    }

    public static void importBackup(File file, BackupCallback callback) {
        if (!file.exists()) {
            callback.onError("Backup file does not exist");
            return;
        }
        try {
            Gson gson = new Gson();
            Type mapType = new TypeToken<Map<String, Object>>(){}.getType();
            Map<String, Object> data;
            
            try (FileReader reader = new FileReader(file)) {
                data = gson.fromJson(reader, mapType);
            }

            if (data == null) {
                callback.onError("Backup data is empty or invalid");
                return;
            }

            // Restore keys
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                String key = entry.getKey();
                Object val = entry.getValue();
                
                if (val instanceof Boolean) {
                    ChatGramPrefs.putBoolean(key, (Boolean) val);
                } else if (val instanceof String) {
                    ChatGramPrefs.putString(key, (String) val);
                } else if (val instanceof Number) {
                    ChatGramPrefs.putInt(key, ((Number) val).intValue());
                }
            }
            callback.onSuccess();
        } catch (Exception e) {
            callback.onError(e.getMessage());
        }
    }
}
