/**
 * 生成徽標圖像
 * 由於我們沒有實際的徽標圖像，此腳本用於在運行時生成它們
 */

// 生成大漠之家徽標
export function generateDesertHomeLogo() {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(60, 60, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // 沙丘
    ctx.fillStyle = '#f9a825';
    ctx.beginPath();
    ctx.moveTo(20, 85);
    ctx.bezierCurveTo(40, 60, 50, 70, 70, 60);
    ctx.bezierCurveTo(90, 50, 100, 70, 100, 85);
    ctx.lineTo(20, 85);
    ctx.fill();
    
    // 太陽
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(80, 40, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // 波浪
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 70);
    ctx.bezierCurveTo(40, 65, 50, 75, 60, 70);
    ctx.bezierCurveTo(70, 65, 80, 75, 90, 70);
    ctx.stroke();
    
    return canvas.toDataURL();
}

// 生成認養一棵樹徽標
export function generateTreeLogo() {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#c8e6c9';
    ctx.beginPath();
    ctx.arc(60, 60, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // 樹幹
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(55, 60, 10, 30);
    
    // 樹冠
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(60, 50, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // 手掌
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.ellipse(60, 80, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 手指
    ctx.beginPath();
    ctx.moveTo(45, 75);
    ctx.lineTo(40, 65);
    ctx.lineTo(45, 70);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(75, 75);
    ctx.lineTo(80, 65);
    ctx.lineTo(75, 70);
    ctx.fill();
    
    return canvas.toDataURL();
} 