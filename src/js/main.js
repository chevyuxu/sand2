import * as PIXI from 'pixi.js';

// 定義常量
const SAND_COLOR = 0xf5e7ba; // 沙子顏色
const SAND_PARTICLE_SIZE = 4; // 沙粒大小
const SAND_PARTICLE_COUNT = 10000; // 沙粒數量
const INTERACTION_RADIUS = 60; // 互動範圍半徑
const TRANSITION_DURATION = 2000; // 場景轉換時間（毫秒）

// 主應用類
class DesertApp {
    constructor() {
        this.app = null;
        this.sandContainer = null;
        this.oasisContainer = null;
        this.sandParticles = [];
        this.revealed = 0; // 揭示程度 (0-100%)
        this.animationProgress = 0; // 動畫進度
        this.stageIndex = 0; // 當前場景階段 (0:沙漠, 1:乾裂土地, 2:樹苗, 3:大樹, 4:綠洲)
        this.stages = [
            { name: 'desert', texture: null },
            { name: 'dry-land', texture: null },
            { name: 'seedling', texture: null },
            { name: 'tree', texture: null },
            { name: 'oasis', texture: null }
        ];

        this.isLoaded = false;
        this.isDragging = false;
        this.lastPointerPosition = { x: 0, y: 0 };
        this.desertFacts = [];

        this.init();
    }

    // 初始化應用
    init() {
        // 創建PIXI應用
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: SAND_COLOR,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true
        });

        // 添加畫布到DOM
        document.getElementById('sand-canvas-container').appendChild(this.app.view);

        // 創建容器
        this.sandContainer = new PIXI.Container();
        this.oasisContainer = new PIXI.Container();
        this.app.stage.addChild(this.oasisContainer);
        this.app.stage.addChild(this.sandContainer);

        // 加載資源
        this.loadResources();

        // 動態生成並設置徽標
        this.setupLogos();

        // 綁定事件
        this.bindEvents();
    }

    // 加載資源
    loadResources() {
        // 模擬圖片加載 (實際項目中應替換為真實的紋理)
        // 這裡我們臨時創建紋理，在實際項目中應從文件加載
        this.stages.forEach((stage, index) => {
            // 创建一个渐变色的背景作为每个阶段的纹理
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const ctx = canvas.getContext('2d');

            // 根據階段設置不同背景
            switch(index) {
                case 0: // 沙漠
                    ctx.fillStyle = '#f5e7ba';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    break;
                case 1: // 乾裂土地
                    this.drawCrackedLand(ctx);
                    break;
                case 2: // 樹苗
                    this.drawLandWithSeedling(ctx);
                    break;
                case 3: // 大樹
                    this.drawLandWithTree(ctx);
                    break;
                case 4: // 綠洲
                    this.drawOasis(ctx);
                    break;
            }
            stage.texture = PIXI.Texture.from(canvas);
        });

        // 初始化場景
        this.initScenes();

        // 所有資源加載完成後
        setTimeout(() => {
            this.isLoaded = true;
            this.hideLoadingScreen();
            this.createSandParticles();
        }, 1500); // 模擬加載時間
    }

    // 初始化場景
    initScenes() {
        // 設置背景 - 先加載所有階段的背景
        for (let i = 0; i < this.stages.length; i++) {
            const sprite = new PIXI.Sprite(this.stages[i].texture);
            sprite.width = this.app.screen.width;
            sprite.height = this.app.screen.height;
            sprite.visible = (i === 0); // 只顯示第一個階段（沙漠）
            this.stages[i].sprite = sprite;
            this.oasisContainer.addChild(sprite);
        }

        // 將背景精靈存儲在類屬中以便於切換
        this.backgroundSprite = this.stages[0].sprite;

        // 綠洲容器已經包含所有背景，但需要顯示
        this.oasisContainer.alpha = 1;
    }

    // 創建沙粒
    createSandParticles() {
        // 創建沙粒圖形作為覆蓋層
        // 將畫布分成網格，每個格子放置一個沙粒
        const gridSize = Math.sqrt(SAND_PARTICLE_COUNT);
        const cellWidth = this.app.screen.width / gridSize;
        const cellHeight = this.app.screen.height / gridSize;

        // 計算沙粒大小使其能完全覆蓋格子
        const particleSize = Math.max(cellWidth, cellHeight) * 1.2; // 稍微大一點以確保覆蓋

        // 創建沙粒網格
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const particle = new PIXI.Graphics();
                particle.beginFill(SAND_COLOR);
                particle.drawCircle(0, 0, particleSize);
                particle.endFill();

                // 設置位置在格子中心
                particle.x = col * cellWidth + cellWidth / 2;
                particle.y = row * cellHeight + cellHeight / 2;

                // 原始位置 (用於重置)
                particle.originalX = particle.x;
                particle.originalY = particle.y;

                // 記錄沙粒是否已被移動
                particle.moved = false;

                this.sandParticles.push(particle);
                this.sandContainer.addChild(particle);
            }
        }

        // 開始渲染循環
        this.app.ticker.add(() => this.update());

        // 計算初始時沙子覆蓋的百分比
        this.calculateCoverage();
    }

    // 計算沙子覆蓋的百分比
    calculateCoverage() {
        // 計算未移動的沙粒數量
        const unmoved = this.sandParticles.filter(p => !p.moved).length;
        // 計算覆蓋百分比
        const coverage = (unmoved / this.sandParticles.length) * 100;
        // 更新揭示程度
        this.revealed = 100 - coverage;

        // 更新場景顯示
        this.updateSceneVisibility();
    }

    // 綁定事件
    bindEvents() {
        // 窗口大小改變
        window.addEventListener('resize', () => this.handleResize());

        // 互動事件
        this.app.view.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        this.app.view.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        this.app.view.addEventListener('pointerup', () => this.handlePointerUp());
        this.app.view.addEventListener('pointercancel', () => this.handlePointerUp());

        // 綁定按鈕事件
        document.querySelector('.btn-support').addEventListener('click', () => {
            alert('感謝您的支持！這裡將跳轉到捐款頁面');
        });

        document.querySelector('.btn-info').addEventListener('click', () => {
            alert('瞭解更多關於大漠之家的防沙治沙工作');
        });
    }

    // 隱藏加載畫面
    hideLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    // 處理窗口大小改變
    handleResize() {
        // 調整畫布大小
        this.app.renderer.resize(window.innerWidth, window.innerHeight);

        // 調整背景大小
        if (this.backgroundSprite) {
            this.backgroundSprite.width = this.app.screen.width;
            this.backgroundSprite.height = this.app.screen.height;
        }

        // 重置沙粒位置
        this.resetSandParticles();
    }

    // 重置沙粒位置
    resetSandParticles() {
        // 重新計算格子大小
        const gridSize = Math.sqrt(this.sandParticles.length);
        const cellWidth = this.app.screen.width / gridSize;
        const cellHeight = this.app.screen.height / gridSize;

        // 重置每個沙粒
        let index = 0;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (index < this.sandParticles.length) {
                    const particle = this.sandParticles[index++];
                    particle.originalX = col * cellWidth + cellWidth / 2;
                    particle.originalY = row * cellHeight + cellHeight / 2;
                    particle.x = particle.originalX;
                    particle.y = particle.originalY;
                    particle.moved = false;
                }
            }
        }

        // 重置揭示程度
        this.revealed = 0;

        // 更新場景顯示
        this.updateSceneVisibility();
    }

    // 處理指針按下
    handlePointerDown(e) {
        this.isDragging = true;
        this.lastPointerPosition.x = e.clientX;
        this.lastPointerPosition.y = e.clientY;
    }

    // 處理指針移動
    handlePointerMove(e) {
        if (!this.isDragging) return;

        const x = e.clientX;
        const y = e.clientY;

        // 移動沙粒
        this.moveSandParticles(x, y);

        // 更新最後位置
        this.lastPointerPosition.x = x;
        this.lastPointerPosition.y = y;
    }

    // 處理指針抬起
    handlePointerUp() {
        this.isDragging = false;
    }

    // 移動沙粒
    moveSandParticles(x, y) {
        let anyMoved = false;

        this.sandParticles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < INTERACTION_RADIUS) {
                // 根據距離計算移動方向和力度
                const angle = Math.atan2(dy, dx);
                const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS;

                // 向外推沙粒
                particle.x += Math.cos(angle) * force * 30; // 增大推力
                particle.y += Math.sin(angle) * force * 30;

                // 限制沙粒在畫布內
                particle.x = Math.max(0, Math.min(this.app.screen.width, particle.x));
                particle.y = Math.max(0, Math.min(this.app.screen.height, particle.y));

                // 標記沙粒已被移動
                if (!particle.moved) {
                    particle.moved = true;
                    anyMoved = true;
                }
            }
        });

        // 如果有沙粒被移動，重新計算覆蓋率
        if (anyMoved) {
            this.calculateCoverage();
        }
    }

    // 更新場景顯示
    updateSceneVisibility() {
        // 根據揭示程度顯示不同的場景
        if (this.revealed >= 80) {
            // 綠洲階段 (80%+)
            this.showStage(4);
            if (this.stageIndex !== 4) {
                this.stageIndex = 4;
                this.revealFullOasis();
            }
        } else if (this.revealed >= 60) {
            // 大樹階段 (60-80%)
            this.showStage(3);
            this.stageIndex = 3;
        } else if (this.revealed >= 40) {
            // 樹苗階段 (40-60%)
            this.showStage(2);
            this.stageIndex = 2;
        } else if (this.revealed >= 20) {
            // 乾裂土地階段 (20-40%)
            this.showStage(1);
            this.stageIndex = 1;
        } else {
            // 沙漠階段 (0-20%)
            this.showStage(0);
            this.stageIndex = 0;
        }
    }

    // 顯示指定階段
    showStage(index) {
        // 隱藏所有階段
        for (let i = 0; i < this.stages.length; i++) {
            if (this.stages[i].sprite) {
                this.stages[i].sprite.visible = (i === index);
            }
        }

        // 更新背景精靈引用
        this.backgroundSprite = this.stages[index].sprite;
    }

    // 進入下一階段
    advanceStage() {
        this.stageIndex = Math.min(this.stages.length - 1, this.stageIndex + 1);

        // 更新背景紋理
        this.backgroundSprite.texture = this.stages[this.stageIndex].texture;

        // 如果到達綠洲階段，移除所有沙粒
        if (this.stageIndex === this.stages.length - 1) {
            this.revealFullOasis();
        }
    }

    // 完全顯示綠洲
    revealFullOasis() {
        // 動畫淡出沙粒
        const fadeOutSand = () => {
            const alpha = this.sandContainer.alpha - 0.02;
            this.sandContainer.alpha = Math.max(0, alpha);

            if (this.sandContainer.alpha > 0) {
                requestAnimationFrame(fadeOutSand);
            } else {
                // 沙子完全消失後顯示UI元素
                this.showUIElements();
            }
        };

        fadeOutSand();
    }

    // 顯示UI元素（大漠之家、認養一棵樹、立即支持、了解更多）
    showUIElements() {
        setTimeout(async () => {
            const logosContainer = document.querySelector('.logos-container');
            const buttonsContainer = document.querySelector('.buttons-container');
            const interactionHint = document.querySelector('.interaction-hint');

            // 加載並顯示小知識
            await this.loadDesertFacts();
            const factText = this.getRandomFact();

            // 將interaction-hint替換為小知識
            if (interactionHint) {
                interactionHint.innerHTML = factText;
                interactionHint.classList.remove('interaction-hint');
                interactionHint.classList.add('desert-fact');
            }

            // 顯示徽標
            if (logosContainer) {
                logosContainer.style.opacity = '1';
                logosContainer.style.transform = 'translateY(0)';
            }

            // 延遲顯示按鈕
            setTimeout(() => {
                if (buttonsContainer) {
                    buttonsContainer.style.opacity = '1';
                    buttonsContainer.style.transform = 'translateY(0)';
                }
            }, 300);
        }, 500);
    }

    // 更新函數 (每幀調用)
    update() {
        // 如果非拖動狀態，緩慢恢復沙粒位置
        if (!this.isDragging) {
            let anyMoved = false;

            this.sandParticles.forEach(particle => {
                // 如果沙粒已經被移動過，不要恢復它的位置
                if (!particle.moved) {
                    const dx = particle.originalX - particle.x;
                    const dy = particle.originalY - particle.y;

                    // 只有當沙粒距離原始位置足夠遠時才標記為已移動
                    if (Math.sqrt(dx * dx + dy * dy) > 5) {
                        particle.moved = true;
                        anyMoved = true;
                    } else {
                        particle.x += dx * 0.1;
                        particle.y += dy * 0.1;
                    }
                }
            });

            // 如果有沙粒被標記為已移動，重新計算覆蓋率
            if (anyMoved) {
                this.calculateCoverage();
            }
        }
    }

    // 繪製乾裂土地
    drawCrackedLand(ctx) {
        ctx.fillStyle = '#a88e5c';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 添加裂紋效果
        ctx.strokeStyle = '#8b7346';
        ctx.lineWidth = 2;

        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            const startX = Math.random() * ctx.canvas.width;
            const startY = Math.random() * ctx.canvas.height;
            ctx.moveTo(startX, startY);

            // 創建隨機裂紋
            for (let j = 0; j < 5; j++) {
                const angle = Math.random() * Math.PI * 2;
                const length = 20 + Math.random() * 50;
                ctx.lineTo(
                    startX + Math.cos(angle) * length * (j+1),
                    startY + Math.sin(angle) * length * (j+1)
                );
            }

            ctx.stroke();
        }
    }

    // 繪製有樹苗的土地
    drawLandWithSeedling(ctx) {
        // 背景是乾裂的土地
        this.drawCrackedLand(ctx);

        // 添加小樹苗
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2 + 50;

        // 樹苗莖
        ctx.fillStyle = '#7d5a38';
        ctx.fillRect(centerX - 3, centerY - 40, 6, 40);

        // 葉子
        ctx.fillStyle = '#6bab64';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 45, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 添加一些綠色斑點表示開始的植被
        ctx.fillStyle = '#8bc34a';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const size = 2 + Math.random() * 5;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 繪製有大樹的土地
    drawLandWithTree(ctx) {
        // 背景漸變為綠色
        const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        gradient.addColorStop(0, '#a88e5c');
        gradient.addColorStop(1, '#8bc34a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // 樹幹
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2 + 100;
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY);
        ctx.lineTo(centerX - 10, centerY - 100);
        ctx.lineTo(centerX + 10, centerY - 100);
        ctx.lineTo(centerX + 20, centerY);
        ctx.fill();

        // 樹冠
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 130, 60, 0, Math.PI * 2);
        ctx.fill();

        // 更多的植被
        ctx.fillStyle = '#8bc34a';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const size = 5 + Math.random() * 10;

            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 繪製綠洲場景
    drawOasis(ctx) {
        // 藍天背景
        const skyGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height * 0.6);
        skyGradient.addColorStop(0, '#87ceeb');
        skyGradient.addColorStop(1, '#add8e6');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height * 0.6);

        // 綠地
        const groundGradient = ctx.createLinearGradient(0, ctx.canvas.height * 0.6, 0, ctx.canvas.height);
        groundGradient.addColorStop(0, '#8bc34a');
        groundGradient.addColorStop(1, '#4caf50');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, ctx.canvas.height * 0.6, ctx.canvas.width, ctx.canvas.height * 0.4);

        // 太陽
        ctx.fillStyle = '#fff9c4';
        ctx.beginPath();
        ctx.arc(ctx.canvas.width * 0.8, ctx.canvas.height * 0.2, 40, 0, Math.PI * 2);
        ctx.fill();

        // 繪製多棵樹
        this.drawTree(ctx, ctx.canvas.width * 0.2, ctx.canvas.height * 0.7, 0.8);
        this.drawTree(ctx, ctx.canvas.width * 0.5, ctx.canvas.height * 0.65, 1);
        this.drawTree(ctx, ctx.canvas.width * 0.8, ctx.canvas.height * 0.75, 0.7);

        // 繪製水塘
        ctx.fillStyle = '#4fc3f7';
        ctx.beginPath();
        ctx.ellipse(
            ctx.canvas.width * 0.4,
            ctx.canvas.height * 0.8,
            ctx.canvas.width * 0.15,
            ctx.canvas.height * 0.05,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    // 繪製樹
    drawTree(ctx, x, y, scale) {
        const trunkHeight = 80 * scale;
        const trunkWidth = 15 * scale;
        const crownRadius = 50 * scale;

        // 樹幹
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x - trunkWidth/2, y - trunkHeight, trunkWidth, trunkHeight);

        // 樹冠
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(x, y - trunkHeight - crownRadius/2, crownRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    // 設置徽標
    setupLogos() {
        // 不再需要動態生成徽標，因為我們已經在HTML中設置了圖片路徑
        // 確保圖片存在於 public/assets/images/ 目錄中
    }

    // 加載小知識數據
    async loadDesertFacts() {
        try {
            const response = await fetch('./data/desert-facts.json');
            const data = await response.json();
            this.desertFacts = data.facts;
        } catch (error) {
            console.error('Failed to load desert facts:', error);
        }
    }

    // 隨機獲取一條小知識
    getRandomFact() {
        if (this.desertFacts.length === 0) return '';
        const randomIndex = Math.floor(Math.random() * this.desertFacts.length);
        return this.desertFacts[randomIndex].text;
    }
}

// 等待DOM加載完成後初始化應用
document.addEventListener('DOMContentLoaded', () => {
    new DesertApp();
});
