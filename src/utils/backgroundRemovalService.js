// utils/backgroundRemovalService.js
class BackgroundRemovalService {
  constructor() {
    this.apiKey = import.meta?.env?.VITE_REMOVE_BG_API_KEY || null;
    this.apiUrl = "https://api.remove.bg/v1.0/removebg";
  }

  async removeBackgroundWithAPI(imageFile) {
    if (!this.apiKey || this.apiKey === "free") {
      console.warn("⚠ No valid Remove.bg API key — using manual fallback.");
      return this.removeBackgroundManual(imageFile);
    }

    try {
      const formData = new FormData();
      formData.append("image_file", imageFile);
      formData.append("size", "auto");

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "X-Api-Key": this.apiKey },
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text());

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.warn("❌ Remove.bg API Request Failed:", error.message);
      return this.removeBackgroundManual(imageFile);
    }
  }

  async removeBackgroundManual(imageFile) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        this.advancedBackgroundRemoval(data, canvas.width, canvas.height);

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async removeBackgroundWithAPIBase64(imageData) {
    let imageToProcess;

    if (typeof imageData === "string" && imageData.startsWith("data:")) {
      const response = await fetch(imageData);
      imageToProcess = await response.blob();
    } else {
      imageToProcess = imageData;
    }

    return this.removeBackgroundWithAPI(imageToProcess);
  }

  advancedBackgroundRemoval(data, width, height, options = {}) {
    const { sensitivity = 0.15 } = options;
    const edgeData = this.detectEdges(data, width, height);

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const isEdge = edgeData[pixelIndex] > 128;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (!this.isForegroundPixel(r, g, b, isEdge, sensitivity)) {
        data[i + 3] = 0;
      }
    }
  }

  detectEdges(data, width, height) {
    const edgeData = new Uint8ClampedArray(data.length / 4);

    const getGray = (i) =>
      i < 0 || i + 2 >= data.length ? 0 : (data[i] + data[i + 1] + data[i + 2]) / 3;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x;

        const gx =
          -getGray((p - width - 1) * 4) -
          2 * getGray((p - 1) * 4) -
          getGray((p + width - 1) * 4) +
          getGray((p - width + 1) * 4) +
          2 * getGray((p + 1) * 4) +
          getGray((p + width + 1) * 4);

        const gy =
          -getGray((p - width - 1) * 4) -
          2 * getGray((p - width) * 4) -
          getGray((p - width + 1) * 4) +
          getGray((p + width - 1) * 4) +
          2 * getGray((p + width) * 4) +
          getGray((p + width + 1) * 4);

        edgeData[p] = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5);
      }
    }

    return edgeData;
  }

  isForegroundPixel(r, g, b, isEdge, sensitivity) {
    if (isEdge) return true;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max !== 0 && (max - min) / max > sensitivity;
  }

  async removeBackground(imageFile, method = "auto") {
    return method === "api"
      ? this.removeBackgroundWithAPI(imageFile)
      : this.removeBackgroundManual(imageFile);
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
}

export default new BackgroundRemovalService();
