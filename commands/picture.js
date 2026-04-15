// Add this to your commands object/map (e.g., in your message handler)
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const generateImageCommand = {
  name: 'image',
  description: 'Generates a custom image with text. Usage: !image <text> [bgcolor=rgb(0,0,0)] [textcolor=rgb(255,255,255)]',
  async execute(client, message, args) {
    const text = args.slice(1).join(' ') || 'Hello from WhatsApp Bot!';
    const bgColor = args[0] || 'rgb(0,123,255)'; // Default blue background
    const textColor = args[1] || 'rgb(255,255,255)'; // Default white text

    try {
      // Create canvas (1200x600 for good WhatsApp quality)
      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext('2d');

      // Parse colors (simple RGB parser)
      const parseColor = (colorStr) => {
        const rgb = colorStr.match(/rgb\((\d+),(\d+),(\d+)\)/);
        return rgb ? `rgb(${rgb[1]},${rgb[2]},${rgb[3]})` : colorStr;
      };

      // Background gradient for nicer look
      const gradient = ctx.createLinearGradient(0, 0, 1200, 600);
      gradient.addColorStop(0, parseColor(bgColor));
      gradient.addColorStop(1, parseColor(bgColor.replace('0,123,255', '0,50,150'))); // Darker variant
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 600);

      // Add subtle shadow/texture
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, 1200, 600);

      // Text styling
      ctx.font = 'bold 80px Arial';
      ctx.fillStyle = parseColor(textColor);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;

      // Wrap long text across multiple lines
      const maxWidth = 1000;
      const lineHeight = 90;
      const words = text.split(' ');
      let line = '';
      let y = 250;

      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, 600, y);
          line = word + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 600, y);

      // Output image
      const buffer = canvas.toBuffer('image/png');
      const filename = `generated_${Date.now()}.png`;

      // Send as attachment
      const media = await client.sendMessage(message.from, buffer, { 
        caption: `✨ Generated image: "${text}"\n\nColors: BG=${bgColor} Text=${textColor}`,
        mimetype: 'image/png'
      });

      // Optional: Save to disk for debugging
      fs.writeFileSync(filename, buffer);
      console.log(`Image saved as ${filename}`);

    } catch (error) {
      console.error('Image generation failed:', error);
      await client.sendMessage(message.from, '❌ Error generating image. Make sure text is under 100 chars.');
    }
  }
};
