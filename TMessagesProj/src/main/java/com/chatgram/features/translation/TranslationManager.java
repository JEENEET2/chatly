package com.chatgram.features.translation;

import androidx.annotation.NonNull;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;

public class TranslationManager {

    public interface TranslationCallback {
        void onSuccess(String translatedText);
        void onError(String error);
    }

    /**
     * Translates text from source language to target language on-device using ML Kit.
     * Language codes should be two-letter ISO codes (e.g. "en", "es", "ru").
     */
    public static void translate(String text, String sourceLangCode, String targetLangCode, final TranslationCallback callback) {
        if (text == null || text.trim().isEmpty() || callback == null) {
            if (callback != null) callback.onError("Invalid text");
            return;
        }

        // Validate and retrieve target and source language tags
        String sourceLang = TranslateLanguage.fromLanguageTag(sourceLangCode);
        String targetLang = TranslateLanguage.fromLanguageTag(targetLangCode);

        if (sourceLang == null) {
            // Default source to English if invalid
            sourceLang = TranslateLanguage.ENGLISH;
        }
        if (targetLang == null) {
            // Default target to English if invalid
            targetLang = TranslateLanguage.ENGLISH;
        }

        // Build translator options
        TranslatorOptions options = new TranslatorOptions.Builder()
                .setSourceLanguage(sourceLang)
                .setTargetLanguage(targetLang)
                .build();

        final Translator translator = Translation.getClient(options);

        // Download conditions
        DownloadConditions conditions = new DownloadConditions.Builder()
                .requireWifi()
                .build();

        translator.downloadModelIfNeeded(conditions)
                .addOnSuccessListener(new OnSuccessListener<Void>() {
                    @Override
                    public void onSuccess(Void unused) {
                        translator.translate(text)
                                .addOnSuccessListener(new OnSuccessListener<String>() {
                                    @Override
                                    public void onSuccess(String translatedText) {
                                        callback.onSuccess(translatedText);
                                        translator.close();
                                    }
                                })
                                .addOnFailureListener(new OnFailureListener() {
                                    @Override
                                    public void onFailure(@NonNull Exception e) {
                                        callback.onError("Translation failed: " + e.getMessage());
                                        translator.close();
                                    }
                                });
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        callback.onError("Model download failed: " + e.getMessage());
                        translator.close();
                    }
                });
    }
}
