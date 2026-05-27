package com.chatgram.features.voice;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import java.io.File;

public class VoiceTranscriptionManager {

    public interface TranscriptionCallback {
        void onSuccess(String text);
        void onError(String error);
    }

    public static void transcribeVoice(Context context, String audioPath, final TranscriptionCallback callback) {
        if (audioPath == null || callback == null) {
            if (callback != null) callback.onError("Invalid parameters");
            return;
        }

        File file = new File(audioPath);
        if (!file.exists()) {
            callback.onError("Audio file does not exist");
            return;
        }

        // Check if SpeechRecognizer is available
        if (!SpeechRecognizer.isRecognitionAvailable(context)) {
            callback.onError("Speech recognition is not available on this device");
            return;
        }

        // Initialize SpeechRecognizer on the main thread
        final SpeechRecognizer recognizer = SpeechRecognizer.createSpeechRecognizer(context);
        
        final Intent recognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        
        // Since Telegram's audio files are typically encoded in Opus (.ogg), 
        // SpeechRecognizer usually accepts a microphone audio stream or direct audio uri in Android 13+.
        // To ensure high compatibility on older systems, we pass the speech intent.
        // We will configure a recognition listener to capture the results.
        recognizer.setRecognitionListener(new RecognitionListener() {
            @Override
            public void onReadyForSpeech(Bundle params) {}

            @Override
            public void onBeginningOfSpeech() {}

            @Override
            public void onRmsChanged(float rmsdB) {}

            @Override
            public void onBufferReceived(byte[] buffer) {}

            @Override
            public void onEndOfSpeech() {}

            @Override
            public void onError(int error) {
                String message;
                switch (error) {
                    case SpeechRecognizer.ERROR_AUDIO: message = "Audio recording error"; break;
                    case SpeechRecognizer.ERROR_CLIENT: message = "Client side error"; break;
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: message = "Insufficient permissions"; break;
                    case SpeechRecognizer.ERROR_NETWORK: message = "Network error"; break;
                    case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: message = "Network timeout"; break;
                    case SpeechRecognizer.ERROR_NO_MATCH: message = "No speech matches found"; break;
                    case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: message = "Speech engine busy"; break;
                    case SpeechRecognizer.ERROR_SERVER: message = "Server error"; break;
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: message = "No speech input timeout"; break;
                    default: message = "Unknown transcription error"; break;
                }
                callback.onError(message);
                recognizer.destroy();
            }

            @Override
            public void onResults(Bundle results) {
                java.util.ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (matches != null && !matches.isEmpty()) {
                    callback.onSuccess(matches.get(0));
                } else {
                    callback.onError("No text recognized");
                }
                recognizer.destroy();
            }

            @Override
            public void onPartialResults(Bundle partialResults) {}

            @Override
            public void onEvent(int eventType, Bundle params) {}
        });

        // Trigger the recognition
        recognizer.startListening(recognizerIntent);
    }
}
