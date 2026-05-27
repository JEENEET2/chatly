package com.chatgram.features.folders;

import android.text.TextUtils;

public class SmartFolderManager {

    /**
     * Checks if a specific chat dialogue meets the criteria for a smart folder.
     * 
     * @param chatTitle the name of the chat/group
     * @param lastMessage the text content of the last message in the chat
     * @param isUnread whether the chat has unread messages
     * @param isBot whether the participant is a bot
     * @param keywords comma-separated list of keywords defined for this smart folder
     * @param folderFlags flags defining criteria like "unread_only" or "bots_only"
     */
    public static boolean matchesFolderCriteria(
        String chatTitle,
        String lastMessage,
        boolean isUnread,
        boolean isBot,
        String keywords,
        String folderFlags
    ) {
        // 1. Check flags
        if (folderFlags != null) {
            if (folderFlags.contains("unread_only") && !isUnread) {
                return false;
            }
            if (folderFlags.contains("bots_only") && !isBot) {
                return false;
            }
        }

        // 2. Check keywords if defined
        if (!TextUtils.isEmpty(keywords)) {
            String[] kwList = keywords.toLowerCase().split(",");
            String titleLower = chatTitle != null ? chatTitle.toLowerCase() : "";
            String msgLower = lastMessage != null ? lastMessage.toLowerCase() : "";
            
            boolean keywordMatch = false;
            for (String kw : kwList) {
                String trimmedKw = kw.trim();
                if (!trimmedKw.isEmpty()) {
                    if (titleLower.contains(trimmedKw) || msgLower.contains(trimmedKw)) {
                        keywordMatch = true;
                        break;
                    }
                }
            }
            if (!keywordMatch) {
                return false;
            }
        }

        return true;
    }
}
