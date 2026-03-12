use std::path::PathBuf;

#[derive(serde::Serialize)]
pub struct CompileResult {
    pub success: bool,
    pub pdf_path: Option<PathBuf>,
    pub log: String,
}

/// Invoke the Tectonic sidecar to compile a .tex file to PDF.
///
/// `tex_path`  — absolute path to the root .tex file to compile.
/// `output_dir` — directory where the PDF and log should be written.
///
/// Tectonic is bundled as a sidecar binary. In development it is expected
/// at `src-tauri/binaries/tectonic-<target-triple>`. The Tauri shell plugin
/// is used to spawn it so that it benefits from Tauri's sidecar sandboxing.
///
/// This is a stub — full implementation is tracked in Phase 2 of the Notion plan.
#[tauri::command]
pub async fn compile_latex(
    tex_path: PathBuf,
    output_dir: PathBuf,
) -> Result<CompileResult, String> {
    // TODO(phase-2): Spawn `tectonic` sidecar via tauri_plugin_shell.
    // Tectonic args: `tectonic -X compile <tex_path> --outdir <output_dir>`
    let _ = (tex_path, output_dir);
    Err("LaTeX compilation is not yet implemented (Phase 2)".to_string())
}
