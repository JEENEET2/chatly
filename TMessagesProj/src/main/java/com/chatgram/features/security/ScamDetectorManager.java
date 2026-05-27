package com.chatgram.features.security;

import android.text.TextUtils;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ScamDetectorManager {
    private static final String[] SCAM_KEYWORDS = {
        "free telegram premium", "telegram-premium", "gift premium", "claim prize",
        "crypto double", "send btc", "free coins", "login verification", "verify account",
        "account lock", "unusual activity", "gift card code", "giveaway contest"
    };

    private static final String[] SUSPICIOUS_DOMAINS = {
        "te1egram", "telegrarn", "telegram-login", "tg-auth", "t-me.ru", "telegram.co"
    };

    public static class ScanResult {
        public final boolean isSuspicious;
        public final String reason;

        public ScanResult(boolean isSuspicious, String reason) {
            this.isSuspicious = isSuspicious;
            this.reason = reason;
        }
    }

    public static ScanResult scanMessage(String text) {
        if (TextUtils.isEmpty(text)) {
            return new ScanResult(false, "");
        }

        String lowerText = text.toLowerCase();

        // 1. Check for suspicious phishing keywords
        for (String keyword : SCAM_KEYWORDS) {
            if (lowerText.contains(keyword)) {
                return new ScanResult(true, "Contains phishing keyword: '" + keyword + "'");
            }
        }

        // 2. Check for suspicious domains
        for (String domain : SUSPICIOUS_DOMAINS) {
            if (lowerText.contains(domain)) {
                return new ScanResult(true, "Links to lookalike phishing domain: '" + domain + "'");
            }
        }

        // 3. Extract and verify URLs
        Pattern urlPattern = Pattern.compile(
            "\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]",
            Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = urlPattern.matcher(text);
        while (matcher.find()) {
            String url = matcher.group();
            String lowerUrl = url.toLowerCase();
            
            // Unsecured http links containing login details
            if (lowerUrl.startsWith("http://")) {
                if (lowerUrl.contains("login") || lowerUrl.contains("auth") || lowerUrl.contains("verify")) {
                    return new ScanResult(true, "Unsecured link (HTTP) asking for credentials");
                }
            }
            
            // Check for raw IP address links (often scams)
            Pattern ipPattern = Pattern.compile("https?://\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}");
            if (ipPattern.matcher(lowerUrl).find()) {
                return new ScanResult(true, "Suspicious raw IP address link");
            }
        }

        return new ScanResult(false, "");
    }
}
