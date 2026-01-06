import sharp from "sharp";

class ImageService {
  async process(buffer) {
    await sharp(buffer).metadata();

    const output = await sharp(buffer)
      .ensureAlpha()
      .png({ quality: 100 })
      .toBuffer();

    return output;
  }
}

export default new ImageService();
