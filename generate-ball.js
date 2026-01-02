const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a 36x36 canvas
const canvas = createCanvas(36, 36);
const ctx = canvas.getContext('2d');

// Clear with transparency
ctx.clearRect(0, 0, 36, 36);

// Create radial gradient for 3D effect
const gradient = ctx.createRadialGradient(14, 14, 2, 18, 18, 18);
gradient.addColorStop(0, '#FFFF66');  // Light yellow center (highlight)
gradient.addColorStop(0.4, '#C8FF00');  // Neon lime-yellow
gradient.addColorStop(1, '#8BB000');  // Darker edge

// Draw circle
ctx.fillStyle = gradient;
ctx.beginPath();
ctx.arc(18, 18, 17, 0, Math.PI * 2);
ctx.fill();

// Draw tennis ball seams (darker yellow curved lines)
ctx.strokeStyle = '#6B7D00';
ctx.lineWidth = 1.5;

// Left seam
ctx.beginPath();
ctx.arc(10, 18, 8, -Math.PI / 3, Math.PI / 3);
ctx.stroke();

// Right seam
ctx.beginPath();
ctx.arc(26, 18, 8, Math.PI * 2 / 3, Math.PI * 4 / 3);
ctx.stroke();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('public/tennis-ball.png', buffer);
console.log('Tennis ball sprite generated: 36x36px');
