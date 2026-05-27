package com.chatgram.features.theme;

import com.chatgram.utils.ChatGramPrefs;

public class PerChatThemeManager {
    private static final String PREFIX_SENDER = "theme_sender_bubble_";
    private static final String PREFIX_RECEIVER = "theme_receiver_bubble_";
    private static final String PREFIX_BG = "theme_bg_";

    public static void setSenderBubbleColor(long dialogId, int color) {
        ChatGramPrefs.putInt(PREFIX_SENDER + dialogId, color);
    }

    public static int getSenderBubbleColor(long dialogId, int defaultColor) {
        return ChatGramPrefs.getInt(PREFIX_SENDER + dialogId, defaultColor);
    }

    public static void setReceiverBubbleColor(long dialogId, int color) {
        ChatGramPrefs.putInt(PREFIX_RECEIVER + dialogId, color);
    }

    public static int getReceiverBubbleColor(long dialogId, int defaultColor) {
        return ChatGramPrefs.getInt(PREFIX_RECEIVER + dialogId, defaultColor);
    }

    public static void setBgColor(long dialogId, int color) {
        ChatGramPrefs.putInt(PREFIX_BG + dialogId, color);
    }

    public static int getBgColor(long dialogId, int defaultColor) {
        return ChatGramPrefs.getInt(PREFIX_BG + dialogId, defaultColor);
    }

    public static boolean hasCustomTheme(long dialogId) {
        return ChatGramPrefs.getInt(PREFIX_SENDER + dialogId, 0) != 0 ||
               ChatGramPrefs.getInt(PREFIX_RECEIVER + dialogId, 0) != 0 ||
               ChatGramPrefs.getInt(PREFIX_BG + dialogId, 0) != 0;
    }

    public static void clearCustomTheme(long dialogId) {
        ChatGramPrefs.putInt(PREFIX_SENDER + dialogId, 0);
        ChatGramPrefs.putInt(PREFIX_RECEIVER + dialogId, 0);
        ChatGramPrefs.putInt(PREFIX_BG + dialogId, 0);
    }
}
