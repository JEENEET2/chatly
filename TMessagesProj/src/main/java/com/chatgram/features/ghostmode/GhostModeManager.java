package com.chatgram.features.ghostmode;

import com.chatgram.utils.ChatGramPrefs;

public class GhostModeManager {
    private static final String KEY_SUPPRESS_READ = "ghost_suppress_read";
    private static final String KEY_HIDE_TYPING = "ghost_hide_typing";

    public static boolean isSuppressReadReceiptsEnabled() {
        return ChatGramPrefs.getBoolean(KEY_SUPPRESS_READ, false);
    }

    public static void setSuppressReadReceipts(boolean enabled) {
        ChatGramPrefs.putBoolean(KEY_SUPPRESS_READ, enabled);
    }

    public static boolean isHideTypingStatusEnabled() {
        return ChatGramPrefs.getBoolean(KEY_HIDE_TYPING, false);
    }

    public static void setHideTypingStatus(boolean enabled) {
        ChatGramPrefs.putBoolean(KEY_HIDE_TYPING, enabled);
    }

    /**
     * Intercepts outgoing Telegram network requests to suppress read history or typing notifications.
     * Returns true if the request was intercepted/suppressed, false if it should proceed.
     */
    public static boolean shouldInterceptRequest(Object request) {
        if (request == null) {
            return false;
        }
        
        String className = request.getClass().getSimpleName();
        
        // Suppress read history requests
        if (isSuppressReadReceiptsEnabled()) {
            if (className.equals("TL_messages_readHistory") || 
                className.equals("TL_messages_readMentions") ||
                className.equals("TL_channels_readHistory") ||
                className.equals("TL_channels_readMessageContents")) {
                return true;
            }
        }
        
        // Suppress typing indicators
        if (isHideTypingStatusEnabled()) {
            if (className.equals("TL_messages_setTyping") || 
                className.equals("TL_channels_setTyping")) {
                return true;
            }
        }
        
        return false;
    }
}
