/**
 * Intercepta eventos de pegado (Ctrl+V) en áreas de texto o inputs.
 * Si el usuario tiene una imagen copiada en el portapapeles, la convierte
 * a formato legible (Data URL base64) y la inserta con la sintaxis Markdown:
 * ![Descripción](data:image/png;base64,...)
 */
export function handleClipboardImage(
  event: React.ClipboardEvent<HTMLTextAreaElement>,
  currentText: string,
  setText: (newText: string) => void,
  onImageInserted?: (info: string) => void
): boolean {
  const items = event.clipboardData?.items;
  if (!items) return false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      event.preventDefault();
      const blob = item.getAsFile();
      if (!blob) return false;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const textarea = event.target as HTMLTextAreaElement;
        const start = textarea.selectionStart || currentText.length;
        const end = textarea.selectionEnd || currentText.length;

        const timestamp = new Date().toISOString().slice(11, 19).replace(/:/g, "");
        const imageMarkdown = `\n![Figura ${timestamp}](${base64})\n`;

        const updatedText =
          currentText.substring(0, start) + imageMarkdown + currentText.substring(end);
        setText(updatedText);

        if (onImageInserted) {
          onImageInserted(`Imagen agregada correctamente (${(blob.size / 1024).toFixed(1)} KB)`);
        }
      };
      reader.readAsDataURL(blob);
      return true;
    }
  }

  return false;
}
