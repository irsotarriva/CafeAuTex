use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct DialogFilter {
    pub name: String,
    pub extensions: Vec<String>,
}

/// Show a native open-file dialog.
/// Returns the chosen path, or null if the user cancelled.
#[tauri::command]
pub async fn open_file_dialog(
    _filters: Vec<DialogFilter>,
) -> Result<Option<String>, String> {
    // TODO(phase-1-polish): Integrate tauri-plugin-dialog when it is added as a dependency.
    // For now, returns None (no file selected) so the rest of the app can compile and run.
    Ok(None)
}

/// Show a native save-file dialog.
/// Returns the chosen path, or null if the user cancelled.
#[tauri::command]
pub async fn save_file_dialog(
    _filters: Vec<DialogFilter>,
) -> Result<Option<String>, String> {
    // TODO(phase-1-polish): Integrate tauri-plugin-dialog when it is added as a dependency.
    Ok(None)
}
