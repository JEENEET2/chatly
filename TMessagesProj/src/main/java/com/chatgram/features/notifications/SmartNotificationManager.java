package com.chatgram.features.notifications;

import android.text.TextUtils;
import com.chatgram.utils.ChatGramPrefs;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SmartNotificationManager {
    private static final String KEY_NOTIFICATION_KEYWORDS = "notification_filter_keywords";
    private static final String KEY_FILTER_ENABLED = "notification_filter_enabled";

    public static boolean isFilterEnabled() {
        return ChatGramPrefs.getBoolean(KEY_FILTER_ENABLED, false);
    }

    public static void setFilterEnabled(boolean enabled) {
        ChatGramPrefs.putBoolean(KEY_FILTER_ENABLED, enabled);
    }

    public static List<String> getKeywords() {
        String saved = ChatGramPrefs.getString(KEY_NOTIFICATION_KEYWORDS, "");
        if (TextUtils.isEmpty(saved)) {
            return new ArrayList<>();
        }
        return new ArrayList<>(Arrays.asList(saved.split(",")));
    }

    public static void saveKeywords(List<String> keywords) {
        if (keywords == null || keywords.isEmpty()) {
            ChatGramPrefs.putString(KEY_NOTIFICATION_KEYWORDS, "");
            return;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < keywords.size(); i++) {
            sb.append(keywords.get(i));
            if (i < keywords.size() - 1) {
                sb.append(",");
            }
        }
        ChatGramPrefs.putString(KEY_NOTIFICATION_KEYWORDS, sb.toString());
    }

    public static void addKeyword(String keyword) {
        if (TextUtils.isEmpty(keyword)) return;
        keyword = keyword.trim().toLowerCase();
        List<String> current = getKeywords();
        if (!current.contains(keyword)) {
            current.add(keyword);
            saveKeywords(current);
        }
    }

    public static void removeKeyword(String keyword) {
        if (TextUtils.isEmpty(keyword)) return;
        keyword = keyword.trim().toLowerCase();
        List<String> current = getKeywords();
        if (current.remove(keyword)) {
            saveKeywords(current);
        }
    }

    public static boolean shouldSuppressNotification(String text, String senderName) {
        if (!isFilterEnabled()) {
            return false;
        }
        
        List<String> keywords = getKeywords();
        if (keywords.isEmpty()) {
            return false;
        }

        String lowerText = text != null ? text.toLowerCase() : "";
        String lowerSender = senderName != null ? senderName.toLowerCase() : "";

        for (String keyword : keywords) {
            if (!keyword.isEmpty()) {
                if (lowerText.contains(keyword) || lowerSender.contains(keyword)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
