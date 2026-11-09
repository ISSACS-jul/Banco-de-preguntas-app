// Previene la aparición de la ventana de consola adicional en Windows en modo release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
async fn save_file_native(
    default_filename: String,
    content: String,
    filter_name: String,
    filter_ext: String,
) -> Result<Option<String>, String> {
    let file = rfd::AsyncFileDialog::new()
        .set_title("Guardar como...")
        .set_file_name(&default_filename)
        .add_filter(&filter_name, &[&filter_ext])
        .save_file()
        .await;

    if let Some(file_handle) = file {
        let path = file_handle.path().to_path_buf();
        std::fs::write(&path, content.as_bytes())
            .map_err(|e| format!("Error al escribir el archivo: {}", e))?;
        Ok(Some(path.display().to_string()))
    } else {
        Ok(None) // El usuario canceló la selección
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file_native])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
