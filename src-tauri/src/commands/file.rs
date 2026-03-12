use std::path::PathBuf;

/// Read a UTF-8 text file from disk. Used for importing .tex and .bib files.
#[tauri::command]
pub async fn read_file(path: PathBuf) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read {}: {}", path.display(), e))
}

/// Write a UTF-8 string to disk. Used for LaTeX export.
#[tauri::command]
pub async fn write_file(path: PathBuf, content: String) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create directory {}: {}", parent.display(), e))?;
    }
    tokio::fs::write(&path, content.as_bytes())
        .await
        .map_err(|e| format!("Failed to write {}: {}", path.display(), e))
}

/// Reveal a file in the OS file manager (Finder / Nautilus / Explorer).
#[tauri::command]
pub async fn show_in_folder(path: PathBuf) -> Result<(), String> {
    // Platform-specific reveal logic is handled by the shell plugin via the frontend.
    // This stub exists as a Tauri command entry point for future native implementation.
    let _ = path;
    Ok(())
}
