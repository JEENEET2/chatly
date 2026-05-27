package com.chatgram.features.settings;

import android.content.Context;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.Toast;
import org.telegram.messenger.AndroidUtilities;
import org.telegram.messenger.LocaleController;
import org.telegram.messenger.R;
import org.telegram.ui.ActionBar.ActionBar;
import org.telegram.ui.ActionBar.AlertDialog;
import org.telegram.ui.ActionBar.BaseFragment;
import org.telegram.ui.ActionBar.Theme;
import org.telegram.ui.Components.LayoutHelper;
import org.telegram.ui.Components.UItem;
import org.telegram.ui.Components.UniversalAdapter;
import org.telegram.ui.Components.UniversalRecyclerView;

import com.chatgram.features.ghostmode.GhostModeManager;
import com.chatgram.features.decoyvault.DecoyVaultManager;
import com.chatgram.features.notifications.SmartNotificationManager;
import com.chatgram.features.backup.BackupRestoreManager;
import com.chatgram.utils.ChatGramPrefs;

import java.io.File;
import java.util.ArrayList;

public class ChatGramSettingsActivity extends BaseFragment {

    private UniversalRecyclerView listView;

    @Override
    public View createView(Context context) {
        // 1. Configure Action Bar
        actionBar.setBackButtonImage(R.drawable.ic_ab_back);
        actionBar.setTitle("ChatGram Settings");
        if (AndroidUtilities.isTablet()) {
            actionBar.setOccupyStatusBar(false);
        }
        actionBar.setActionBarMenuOnItemClick(new ActionBar.ActionBarMenuOnItemClick() {
            @Override
            public void onItemClick(int id) {
                if (id == -1) {
                    finishFragment();
                }
            }
        });

        // 2. Configure List View
        listView = new UniversalRecyclerView(this, this::fillItems, this::onClick, this::onLongClick);
        fragmentView = listView;
        
        updateColors();
        return fragmentView;
    }

    private void fillItems(ArrayList<UItem> items, UniversalAdapter adapter) {
        // Ghost Mode Section
        items.add(UItem.asHeader("Ghost Mode"));
        
        UItem suppressRead = UItem.asCheck(1, "Suppress Read Receipts");
        suppressRead.checked = GhostModeManager.isSuppressReadReceiptsEnabled();
        items.add(suppressRead);
        
        UItem hideTyping = UItem.asCheck(2, "Hide Typing Status");
        hideTyping.checked = GhostModeManager.isHideTypingStatusEnabled();
        items.add(hideTyping);
        
        items.add(UItem.asShadow("Allows you to read messages and type in chats without updating the double-checkmark read indicator or sending typing status notifications."));

        // Decoy Vault Section
        items.add(UItem.asHeader("Decoy Vault"));
        
        UItem enableDecoy = UItem.asCheck(3, "Enable Decoy Vault");
        enableDecoy.checked = DecoyVaultManager.isDecoyVaultEnabled();
        items.add(enableDecoy);
        
        items.add(UItem.asButton(4, "Set Decoy PIN Passcode"));
        items.add(UItem.asShadow("Inputting the decoy PIN on the passcode lock screen opens a clean, empty app state to protect your privacy."));

        // Notification Filter Section
        items.add(UItem.asHeader("Smart Notification Filter"));
        
        UItem enableFilter = UItem.asCheck(5, "Enable Notification Filter");
        enableFilter.checked = SmartNotificationManager.isFilterEnabled();
        items.add(enableFilter);
        
        items.add(UItem.asButton(6, "Manage Filter Keywords"));
        items.add(UItem.asShadow("Suppress push notification alerts for incoming messages containing blacklisted keywords."));

        // Backup & Restore
        items.add(UItem.asHeader("Backup & Restore"));
        items.add(UItem.asButton(7, "Export Settings to File"));
        items.add(UItem.asButton(8, "Import Settings from File"));
        items.add(UItem.asShadow("Export or restore your custom ChatGram configurations from local storage. Sensitive passcodes are excluded from backups."));

        // Security Enhancements
        items.add(UItem.asHeader("Security Enhancements"));
        UItem forceSecure = UItem.asCheck(9, "Block Screenshots & Screen Recording");
        forceSecure.checked = ChatGramPrefs.getBoolean("security_force_secure", false);
        items.add(forceSecure);
        items.add(UItem.asShadow("Prevents taking screenshots and blocks screen recorders globally across the entire app."));
    }

    private void onClick(UItem item, View view, int position, float x, float y) {
        switch (item.id) {
            case 1:
                item.checked = !item.checked;
                GhostModeManager.setSuppressReadReceipts(item.checked);
                listView.adapter.notifyItemChanged(position);
                break;
            case 2:
                item.checked = !item.checked;
                GhostModeManager.setHideTypingStatus(item.checked);
                listView.adapter.notifyItemChanged(position);
                break;
            case 3:
                item.checked = !item.checked;
                DecoyVaultManager.setDecoyVaultEnabled(item.checked);
                listView.adapter.notifyItemChanged(position);
                break;
            case 4:
                showSetDecoyPinDialog();
                break;
            case 5:
                item.checked = !item.checked;
                SmartNotificationManager.setFilterEnabled(item.checked);
                listView.adapter.notifyItemChanged(position);
                break;
            case 6:
                showManageKeywordsDialog();
                break;
            case 7:
                exportChatGramSettings();
                break;
            case 8:
                importChatGramSettings();
                break;
            case 9:
                item.checked = !item.checked;
                ChatGramPrefs.putBoolean("security_force_secure", item.checked);
                listView.adapter.notifyItemChanged(position);
                if (getParentActivity() != null) {
                    if (item.checked) {
                        getParentActivity().getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                    } else {
                        // Note: Fall back to native check behavior if disabled
                        if (!(org.telegram.messenger.SharedConfig.passcodeHash.length() > 0 && !org.telegram.messenger.SharedConfig.allowScreenCapture)) {
                            getParentActivity().getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_SECURE);
                        }
                    }
                }
                break;
        }
    }

    private boolean onLongClick(UItem item, View view, int position, float x, float y) {
        return false;
    }

    private void showSetDecoyPinDialog() {
        if (getParentActivity() == null) return;

        AlertDialog.Builder builder = new AlertDialog.Builder(getParentActivity());
        builder.setTitle("Set Decoy PIN Passcode");
        builder.setMessage("Enter the numeric PIN to use as the decoy passcode:");

        final EditText input = new EditText(getParentActivity());
        input.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_VARIATION_PASSWORD);
        FrameLayout container = new FrameLayout(getParentActivity());
        container.addView(input, LayoutHelper.createFrame(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, Gravity.CENTER, 24, 8, 24, 8));
        builder.setView(container);

        builder.setPositiveButton("Save", (dialog, which) -> {
            String pin = input.getText().toString();
            if (pin.length() < 4) {
                Toast.makeText(getParentActivity(), "PIN must be at least 4 digits", Toast.LENGTH_SHORT).show();
            } else {
                DecoyVaultManager.setDecoyPasscode(pin);
                Toast.makeText(getParentActivity(), "Decoy PIN passcode saved successfully", Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", null);
        showDialog(builder.create());
    }

    private void showManageKeywordsDialog() {
        if (getParentActivity() == null) return;

        AlertDialog.Builder builder = new AlertDialog.Builder(getParentActivity());
        builder.setTitle("Manage Filter Keywords");
        
        StringBuilder currentKeywords = new StringBuilder();
        for (String kw : SmartNotificationManager.getKeywords()) {
            if (currentKeywords.length() > 0) currentKeywords.append(", ");
            currentKeywords.append(kw);
        }
        
        builder.setMessage("Enter comma-separated keywords to mute notifications (current: " + 
            (currentKeywords.length() > 0 ? currentKeywords.toString() : "none") + "):");

        final EditText input = new EditText(getParentActivity());
        input.setHint("e.g. spam, promo, giveaway");
        input.setText(currentKeywords.toString());
        
        FrameLayout container = new FrameLayout(getParentActivity());
        container.addView(input, LayoutHelper.createFrame(LayoutHelper.MATCH_PARENT, LayoutHelper.WRAP_CONTENT, Gravity.CENTER, 24, 8, 24, 8));
        builder.setView(container);

        builder.setPositiveButton("Save", (dialog, which) -> {
            String raw = input.getText().toString();
            ArrayList<String> kws = new ArrayList<>();
            for (String part : raw.split(",")) {
                String trimmed = part.trim().toLowerCase();
                if (!trimmed.isEmpty()) {
                    kws.add(trimmed);
                }
            }
            SmartNotificationManager.saveKeywords(kws);
            Toast.makeText(getParentActivity(), "Filter keywords updated", Toast.LENGTH_SHORT).show();
        });
        builder.setNegativeButton("Cancel", null);
        showDialog(builder.create());
    }

    private void exportChatGramSettings() {
        if (getParentActivity() == null) return;
        
        File backupFile = new File(getParentActivity().getExternalFilesDir(null), "chatgram_backup.json");
        BackupRestoreManager.exportBackup(backupFile, new BackupRestoreManager.BackupCallback() {
            @Override
            public void onSuccess() {
                Toast.makeText(getParentActivity(), "Settings backed up to:\n" + backupFile.getAbsolutePath(), Toast.LENGTH_LONG).show();
            }

            @Override
            public void onError(String error) {
                Toast.makeText(getParentActivity(), "Backup failed: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void importChatGramSettings() {
        if (getParentActivity() == null) return;

        File backupFile = new File(getParentActivity().getExternalFilesDir(null), "chatgram_backup.json");
        BackupRestoreManager.importBackup(backupFile, new BackupRestoreManager.BackupCallback() {
            @Override
            public void onSuccess() {
                Toast.makeText(getParentActivity(), "Settings restored successfully!", Toast.LENGTH_SHORT).show();
                if (listView != null) {
                    listView.adapter.update(true);
                }
            }

            @Override
            public void onError(String error) {
                Toast.makeText(getParentActivity(), "Restore failed: " + error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateColors() {
        if (actionBar != null) {
            actionBar.setTitleColor(Theme.getColor(Theme.key_windowBackgroundWhiteBlackText));
            actionBar.setItemsColor(Theme.getColor(Theme.key_windowBackgroundWhiteBlackText), false);
            actionBar.setBackgroundColor(Theme.getColor(Theme.key_windowBackgroundWhite));
        }
        if (listView != null) {
            listView.setBackgroundColor(Theme.getColor(Theme.key_windowBackgroundGray));
            listView.invalidate();
        }
    }
}
