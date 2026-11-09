/**
 * Abre el diálogo nativo de "Guardar como..." del sistema operativo (Arch Linux / GTK)
 * para que el usuario pueda elegir libremente en qué carpeta guardar el archivo.
 */
export async function saveFileWithDialog(
  defaultFilename: string,
  content: string,
  filterName: string = "Archivo JSON (*.json)",
  filterExt: string = "json"
): Promise<{ success: boolean; path?: string; canceled?: boolean }> {
  // 1. Intentar mediante el comando nativo de Tauri (rfd / GTK FileChooser del sistema)
  try {
    const isTauri =
      typeof window !== "undefined" &&
      (Boolean((window as any).__TAURI_INTERNALS__) ||
        Boolean((window as any).__TAURI__));

    if (isTauri) {
      const { invoke } = await import("@tauri-apps/api/core");
      const savedPath = await invoke<string | null>("save_file_native", {
        defaultFilename,
        content,
        filterName,
        filterExt,
      });

      if (savedPath) {
        return { success: true, path: savedPath };
      } else {
        return { success: false, canceled: true };
      }
    }
  } catch (tauriError) {
    console.warn("Tauri native save dialog not available, trying browser API:", tauriError);
  }

  // 2. Intentar mediante la File System Access API del navegador (showSaveFilePicker)
  try {
    if ("showSaveFilePicker" in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultFilename,
        types: [
          {
            description: filterName,
            accept: {
              [filterExt === "json"
                ? "application/json"
                : filterExt === "tex"
                ? "text/plain"
                : "application/octet-stream"]: [`.${filterExt}`],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return { success: true, path: handle.name };
    }
  } catch (pickerError: any) {
    if (pickerError.name === "AbortError") {
      return { success: false, canceled: true };
    }
    console.warn("showSaveFilePicker failed, falling back to download:", pickerError);
  }

  // 3. Fallback estándar mediante descarga clásica del navegador
  try {
    const mimeType = filterExt === "json" ? "application/json" : "text/plain";
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (fallbackError) {
    console.error("All save methods failed:", fallbackError);
    return { success: false };
  }
}
