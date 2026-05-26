/**
 * Utilidad para comprimir imágenes del lado del cliente utilizando HTML5 Canvas.
 * Esto reduce drásticamente el tamaño del archivo y el ancho de banda necesario,
 * previniendo el error "File too large" del backend de forma elegante.
 */
export function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si no es una imagen, resolver con el archivo original de inmediato
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular el factor de escala manteniendo la relación de aspecto
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback al archivo original
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir imagen (usar JPEG o el tipo original si es WEBP o PNG)
        const exportType = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: exportType,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback al original
            }
          },
          exportType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
