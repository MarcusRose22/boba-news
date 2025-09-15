/**
 * Interactive Chart System with Scroll Animation and Sugar Cube Physics
 * @description Creates a scroll-controlled chart animation with falling sugar cubes representing data
 * @author BobaNews Development Team
 */
import { Chart } from "chart.js/auto";

/**
 * Sugar Cube class representing individual falling sugar cubes
 */
class SugarCube {
  constructor(x, y, targetY, columnIndex, cubeIndex = 0) {
    this.x = x;
    this.y = y;
    this.targetY = targetY;
    this.columnIndex = columnIndex;
    this.cubeIndex = cubeIndex; // Position in stack
    this.size = 14; // Even larger size for better visibility
    this.velocity = 0;
    this.isStacked = false;
    this.hasLanded = false;

    // Physics properties
    this.gravity = 0.4;
    this.bounce = 0.2; // Less bouncy for more stable stacking
    this.friction = 0.95;
    this.minVelocity = 0.05; // Threshold for stopping

    // Visual properties
    this.rotation = Math.random() * 0.1 - 0.05; // Subtle rotation
    this.opacity = 1;
  }

  update() {
    if (!this.isStacked) {
      // Apply gravity
      this.velocity += this.gravity;
      this.y += this.velocity;

      // Check if reached target position (landed)
      if (this.y >= this.targetY) {
        this.y = this.targetY; // Snap to exact position
        this.hasLanded = true;

        // Apply bounce effect
        if (!this.isStacked) {
          this.velocity = -this.velocity * this.bounce;

          // Stop bouncing if velocity is too low
          if (Math.abs(this.velocity) < this.minVelocity) {
            this.velocity = 0;
            this.isStacked = true;
            this.y = this.targetY; // Ensure exact position
          }
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.rotation);

    // Draw sugar cube with 3D effect
    ctx.fillStyle = "white";
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

    // Add border
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

    // Add 3D shadow effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(-this.size / 2 + 1, -this.size / 2 + 1, this.size, this.size);

    ctx.restore();
  }
}

/**
 * Sugar Physics Engine managing all sugar cube animations
 */
class SugarPhysicsEngine {
  constructor(canvasElement, chartInstance) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.chart = chartInstance;
    this.sugarCubes = [];
    this.animationId = null;
    this.isRunning = false;

    this.setupCanvas();
    this.bindEvents();
  }

  setupCanvas() {
    // Position canvas over the chart
    this.canvas.style.position = "absolute";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "10";

    this.resizeCanvas();
  }

  bindEvents() {
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    const chartCanvas = this.chart.canvas;
    const rect = chartCanvas.getBoundingClientRect();
    const chartContainer = chartCanvas.parentElement;
    const containerRect = chartContainer.getBoundingClientRect();

    // Calculate the offset of the chart canvas relative to its container
    const offsetTop = rect.top - containerRect.top;
    const offsetLeft = rect.left - containerRect.left;

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";

    // Position the sugar canvas to align with the chart canvas
    this.canvas.style.top = offsetTop + "px";
    this.canvas.style.left = offsetLeft + "px";
  }

  getChartArea() {
    return this.chart.chartArea;
  }

  calculateSugarPositions(dataIndex, value) {
    const chartArea = this.getChartArea();
    const meta = this.chart.getDatasetMeta(0);
    const point = meta.data[dataIndex];

    if (!chartArea) {
      return [];
    }

    if (!point) {
      return [];
    }

    // Get the Y scale to calculate 50g position directly
    const yScale = this.chart.scales.y;

    // Get the pixel position for 50g on the Y axis
    // Add offset to compensate for container padding issues
    const baseline50g = yScale.getPixelForValue(50) + 10;

    // Get the pixel position for the current data value
    const dataPointY = yScale.getPixelForValue(value);

    // Calculate stack height (difference between data point and 50g baseline)
    const targetStackHeight = baseline50g - dataPointY;

    // Calculate number of sugar cubes needed
    const cubeSize = 14;
    const cubeSpacing = 1;
    const cubeHeight = cubeSize + cubeSpacing;
    const cubesPerColumn = Math.max(
      0,
      Math.floor(targetStackHeight / cubeHeight)
    );

    const positions = [];
    const columnsCount = 2;
    const totalWidth = columnsCount * cubeSize + (columnsCount - 1) * 2; // 2 columns with spacing
    const startX = point.x - totalWidth / 2 + 8; // Shift 5px to the right

    // Stack from 50g baseline upward
    for (let i = 0; i < cubesPerColumn; i++) {
      for (let col = 0; col < columnsCount; col++) {
        const x = startX + col * (cubeSize + 2) + Math.random() * 2 - 1;

        // Stack from 50g baseline upward (baseline50g is bottom, stack goes up)
        const targetY = baseline50g - (i + 1) * cubeHeight;
        const startY = chartArea.top - Math.random() * 50 - 30;

        positions.push({
          x: x,
          y: startY,
          targetY: targetY,
          delay: Math.random() * 200 + i * 25,
          cubeIndex: i,
          columnIndex: col,
        });
      }
    }

    return positions;
  }

  dropSugarCubes(dataIndex, value) {
    // Ensure canvas is properly positioned before dropping cubes
    this.resizeCanvas();

    const positions = this.calculateSugarPositions(dataIndex, value);

    if (positions.length === 0) {
      return;
    }

    positions.forEach((pos, index) => {
      setTimeout(() => {
        const cube = new SugarCube(
          pos.x,
          pos.y,
          pos.targetY,
          pos.columnIndex,
          pos.cubeIndex
        );
        this.sugarCubes.push(cube);
      }, pos.delay);
    });

    this.startAnimation();
  }

  startAnimation() {
    if (this.isRunning) return;

    this.isRunning = true;
    const animate = () => {
      this.update();
      this.draw();

      // Continue animation if there are cubes or if any cube is still moving
      const hasMovingCubes = this.sugarCubes.some(
        (cube) => !cube.isStacked || Math.abs(cube.velocity) > 0.01
      );

      if (
        this.sugarCubes.length > 0 &&
        (hasMovingCubes || this.sugarCubes.length > 0)
      ) {
        this.animationId = requestAnimationFrame(animate);
      } else if (this.sugarCubes.length === 0) {
        this.isRunning = false;
      } else {
        // Keep drawing static cubes
        this.animationId = requestAnimationFrame(animate);
      }
    };

    animate();
  }

  update() {
    // Update all sugar cubes
    this.sugarCubes.forEach((cube) => cube.update());

    // Keep all cubes (don't remove stacked ones - we want to see them)
    // Only remove cubes if they're way off screen or if explicitly cleared
    this.sugarCubes = this.sugarCubes.filter((cube) => {
      return cube.y < this.canvas.height + 100; // Keep cubes that are visible
    });
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all sugar cubes
    this.sugarCubes.forEach((cube) => cube.draw(this.ctx));
  }

  clearAllCubes() {
    this.sugarCubes = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isRunning = false;
  }

  destroy() {
    this.clearAllCubes();
    window.removeEventListener("resize", () => this.resizeCanvas());
  }
}

class InteractiveChart {
  constructor() {
    this.ctx = document.getElementById("sugarChart").getContext("2d");
    this.chartSection = document.querySelector(".chart-section");
    this.isInView = false;
    this.isLocked = false;
    this.animationProgress = 0; // 0 to 1
    this.scrollAccumulator = 0;
    this.lastScrollY = window.scrollY;
    this.originalData = [52, 54, 60, 64, 66, 69, 72, 78];
    this.animatedData = new Array(8).fill(null);
    this.droppedCubes = new Set(); // Track which data points have dropped cubes

    this.initChart();
    this.initSugarCanvas();
    this.bindEvents();
    this.addCustomStyles();
  }

  /**
   * Initialize sugar cube canvas and physics engine
   */
  initSugarCanvas() {
    // Create sugar canvas
    this.sugarCanvas = document.createElement("canvas");
    this.sugarCanvas.id = "sugarCanvas";

    // Add canvas to chart container
    const chartContainer = this.chartSection.querySelector(".chart-container");
    if (!chartContainer) {
      return;
    }

    chartContainer.appendChild(this.sugarCanvas);

    // Initialize physics engine after chart is fully rendered
    setTimeout(() => {
      if (this.chart && this.chart.chartArea) {
        this.sugarEngine = new SugarPhysicsEngine(this.sugarCanvas, this.chart);
      } else {
        // If chart isn't ready, try again after a longer delay
        setTimeout(() => {
          if (this.chart && this.chart.chartArea) {
            this.sugarEngine = new SugarPhysicsEngine(
              this.sugarCanvas,
              this.chart
            );
          }
        }, 500);
      }
    }, 200);
  }

  /**
   * Initialize Chart.js instance with custom configuration
   */
  initChart() {
    // Create chart with initially empty data - NO BACKGROUND FILL
    this.chart = new Chart(this.ctx, {
      type: "line",
      data: {
        labels: [
          "2012",
          "2013",
          "2014",
          "2016",
          "2018",
          "2020",
          "2022",
          "2024",
        ],
        datasets: [
          {
            label: "Average Daily Sugar Intake (grams)",
            data: this.animatedData,
            backgroundColor: "transparent", // Remove background fill
            borderColor: "transparent", // Hide the line
            borderWidth: 0,
            fill: false, // Disable fill - sugar cubes will replace this
            tension: 0.4,
            pointBackgroundColor: "transparent", // Hide points
            pointBorderColor: "transparent",
            pointBorderWidth: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // Disable default animations for smooth control
        },
        plugins: {
          title: {
            display: true,
            text: "Taiwan Sugar Consumption Crisis",
            font: {
              size: 20,
              weight: "bold",
              family: "Noto Serif TC",
            },
            color: "#DC143C",
          },
          subtitle: {
            display: true,
            text: "Daily sugar intake per person (grams) - WHO recommends max 25g",
            font: {
              size: 13,
              family: "Noto Serif TC",
            },
            color: "#666",
          },
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            position: function (elements, eventPosition) {
              // Position tooltip at the top center of the chart
              const chart = this.chart;
              const chartArea = chart.chartArea;
              return {
                x: chartArea.left + chartArea.width / 2,
                y: chartArea.top - 10,
              };
            },
            backgroundColor: "rgba(220, 20, 60, 0.95)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#fff",
            borderWidth: 2,
            cornerRadius: 8,
            displayColors: false,
            xAlign: "center",
            yAlign: "bottom",
            titleFont: {
              family: "Noto Serif TC",
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              family: "Noto Serif TC",
              size: 13,
            },
            padding: 12,
            caretSize: 8,
            callbacks: {
              title: function (context) {
                return context[0].label;
              },
              label: function (context) {
                return `Average Daily Sugar Intake: ${context.parsed.y}g`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 50,
            max: 80,
            ticks: {
              stepSize: 5,
              font: {
                family: "Noto Serif TC",
              },
              color: "#666",
            },
            grid: {
              color: "rgba(200, 200, 200, 0.3)",
            },
          },
          x: {
            ticks: {
              font: {
                family: "Noto Serif TC",
              },
              color: "#666",
            },
            grid: {
              color: "rgba(200, 200, 200, 0.3)",
            },
          },
        },
        elements: {
          line: {
            borderWidth: 3,
          },
        },
        interaction: {
          intersect: false,
          mode: "index",
        },
      },
    });
  }

  /**
   * Bind event listeners for scroll and wheel interactions
   */
  bindEvents() {
    // Use passive listeners for better performance, except wheel which needs preventDefault
    window.addEventListener("scroll", this.handleScroll.bind(this), {
      passive: false,
    });
    window.addEventListener("wheel", this.handleWheel.bind(this), {
      passive: false,
    });
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  /**
   * Handle scroll events to detect when chart is centered in viewport
   * @param {Event} e - Scroll event
   */
  handleScroll(e) {
    const rect = this.chartSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;

    // Check if chart section is centered in viewport (with 150px tolerance)
    const isCentered = Math.abs(sectionCenter - viewportCenter) < 150;

    if (isCentered && !this.isInView) {
      this.enterInteractiveMode();
    } else if (!isCentered && this.isInView && this.animationProgress === 0) {
      this.exitInteractiveMode();
    }
  }

  /**
   * Enter interactive mode - lock scrolling and enable chart animation
   */
  enterInteractiveMode() {
    this.isInView = true;
    this.isLocked = true;
    this.chartSection.classList.add("interactive");
    document.body.style.overflow = "hidden"; // Prevent page scroll

    // Add subtle visual feedback
    this.showScrollHint();
  }

  /**
   * Exit interactive mode - restore normal scrolling
   */
  exitInteractiveMode() {
    this.isInView = false;
    this.isLocked = false;
    this.chartSection.classList.remove("interactive");
    document.body.style.overflow = "auto"; // Allow page scroll
  }

  /**
   * Show scroll hint to user when entering interactive mode
   */
  showScrollHint() {
    const hint = this.chartSection.querySelector(".scroll-hint");
    if (hint) {
      hint.style.opacity = "1";
      // Hide hint after 3 seconds or when animation starts
      setTimeout(() => {
        if (this.animationProgress > 0) {
          hint.style.opacity = "0";
        }
      }, 3000);
    }
  }

  /**
   * Handle wheel events to control chart animation
   * @param {WheelEvent} e - Wheel event
   */
  handleWheel(e) {
    if (!this.isLocked) return;

    e.preventDefault();

    const scrollDirection = e.deltaY > 0 ? 1 : -1;
    const scrollSensitivity = 0.002; // Adjust for optimal feel

    // Update animation progress based on scroll direction
    this.animationProgress += scrollDirection * scrollSensitivity;
    this.animationProgress = Math.max(0, Math.min(1, this.animationProgress));

    // Update chart data
    this.updateChartData();

    // Handle unlock conditions
    this.handleUnlockConditions(scrollDirection, e.deltaY);
  }

  /**
   * Handle conditions for unlocking scroll when animation is complete or at start
   * @param {number} scrollDirection - Direction of scroll (1 for down, -1 for up)
   * @param {number} deltaY - Raw wheel delta value
   */
  handleUnlockConditions(scrollDirection, deltaY) {
    // If animation is complete and user scrolls down, unlock and continue scrolling
    if (this.animationProgress === 1 && scrollDirection > 0) {
      setTimeout(() => {
        this.isLocked = false;
        document.body.style.overflow = "auto";
        // Continue scrolling
        window.scrollBy({
          top: deltaY,
          behavior: "auto",
        });
      }, 100);
    }

    // If at start and user scrolls up, unlock to allow upward scroll
    if (this.animationProgress === 0 && scrollDirection < 0) {
      setTimeout(() => {
        this.isLocked = false;
        document.body.style.overflow = "auto";
        window.scrollBy({
          top: deltaY,
          behavior: "auto",
        });
      }, 100);
    }
  }

  /**
   * Update chart data based on current animation progress and trigger sugar cube drops
   */
  updateChartData() {
    // Calculate how many points to show based on progress
    const pointsToShow = Math.floor(
      this.animationProgress * this.originalData.length
    );
    const partialProgress =
      (this.animationProgress * this.originalData.length) % 1;

    // Handle reverse scrolling - clear sugar cubes if going backwards
    if (pointsToShow < this.droppedCubes.size) {
      this.clearExcessSugarCubes(pointsToShow);
    }

    // Reset animated data
    this.animatedData.fill(null);

    // Show completed points and trigger sugar cube drops
    for (let i = 0; i < pointsToShow; i++) {
      this.animatedData[i] = this.originalData[i];

      // Drop sugar cubes for new data points
      if (!this.droppedCubes.has(i) && this.sugarEngine) {
        this.sugarEngine.dropSugarCubes(i, this.originalData[i]);
        this.droppedCubes.add(i);
      }
    }

    // Show partial point if in progress (smooth interpolation)
    if (pointsToShow < this.originalData.length && partialProgress > 0) {
      const currentPointIndex = pointsToShow;
      const targetValue = this.originalData[currentPointIndex];
      const startValue =
        currentPointIndex > 0 ? this.originalData[currentPointIndex - 1] : 50;
      this.animatedData[currentPointIndex] =
        startValue + (targetValue - startValue) * partialProgress;
    }

    // Update chart without animation
    this.chart.data.datasets[0].data = [...this.animatedData];
    this.chart.update("none");

    // Add visual feedback
    this.updateProgressIndicator();
  }

  /**
   * Clear excess sugar cubes when scrolling backwards
   */
  clearExcessSugarCubes(newPointsCount) {
    if (this.sugarEngine) {
      // Clear all cubes and reset
      this.sugarEngine.clearAllCubes();
      this.droppedCubes.clear();

      // Re-drop cubes for remaining points
      for (let i = 0; i < newPointsCount; i++) {
        this.sugarEngine.dropSugarCubes(i, this.originalData[i]);
        this.droppedCubes.add(i);
      }
    }
  }

  /**
   * Update progress indicator and manage hint visibility
   */
  updateProgressIndicator() {
    const progress = Math.round(this.animationProgress * 100);
    const container = this.chartSection.querySelector(".chart-container");

    let indicator = container.querySelector(".scroll-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "scroll-indicator";
      indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(220, 20, 60, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: bold;
                transition: all 0.3s ease;
                z-index: 10;
                backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
      container.appendChild(indicator);
    }

    indicator.textContent = `📈 ${progress}%`;
    indicator.style.opacity =
      this.isLocked && this.animationProgress > 0 ? "1" : "0";

    // Update hint visibility - hide when animation starts
    const hint = this.chartSection.querySelector(".scroll-hint");
    if (hint && this.animationProgress > 0) {
      hint.style.opacity = "0";
    }
  }

  /**
   * Handle window resize events
   */
  handleResize() {
    if (this.chart) {
      this.chart.resize();
    }

    // Also resize sugar canvas
    if (this.sugarEngine) {
      this.sugarEngine.resizeCanvas();
    }
  }

  /**
   * Clean up resources when chart is destroyed
   */
  destroy() {
    if (this.sugarEngine) {
      this.sugarEngine.destroy();
    }

    if (this.chart) {
      this.chart.destroy();
    }

    // Remove event listeners
    window.removeEventListener("scroll", this.handleScroll.bind(this));
    window.removeEventListener("wheel", this.handleWheel.bind(this));
    window.removeEventListener("resize", this.handleResize.bind(this));
  }

  /**
   * Add custom styles for the interactive chart system and sugar cubes
   */
  addCustomStyles() {
    // Check if styles are already added
    if (document.querySelector("#interactive-chart-styles")) {
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = "interactive-chart-styles";
    styleElement.textContent = `
            .chart-container {
                position: relative;
                overflow: hidden;
            }

            .scroll-indicator {
                pointer-events: none;
            }

            /* Sugar Canvas Styles */
            #sugarCanvas {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                pointer-events: none !important;
                z-index: 5 !important;
            }

            /* Enhanced Chart Section Styles */
            .chart-section.interactive {
                box-shadow: 0 0 30px rgba(220, 20, 60, 0.3) !important;
                transform: scale(1.02);
                transition: all 0.5s ease;
            }

            .chart-section::after {
                content: '↕ Scroll to animate chart';
                position: absolute;
                bottom: -30px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 12px;
                color: #666;
                opacity: 0;
                transition: opacity 0.5s;
            }

            .chart-section.active::after {
                opacity: 1;
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }

            .chart-section.locked {
                animation: pulse 2s infinite;
            }

            /* Sugar cube animation hint */
            .chart-section.interactive .scroll-hint {
                color: #DC143C !important;
                border-color: #DC143C !important;
                box-shadow: 0 2px 10px rgba(220, 20, 60, 0.2);
            }

            /* Performance optimizations */
            .chart-container canvas {
                image-rendering: -webkit-optimize-contrast;
                image-rendering: -moz-crisp-edges;
                image-rendering: pixelated;
            }
        `;

    document.head.appendChild(styleElement);
  }
}

/**
 * Initialize the interactive chart system when DOM is loaded
 */
function initializeInteractiveChart() {
  // Ensure Chart.js is loaded before initializing
  if (typeof Chart === "undefined") {
    console.error("Chart.js is required for InteractiveChart");
    return;
  }

  // Ensure required DOM elements exist
  const chartCanvas = document.getElementById("sugarChart");
  const chartSection = document.querySelector(".chart-section");

  if (!chartCanvas || !chartSection) {
    console.error("Required DOM elements not found for InteractiveChart");
    return;
  }

  // Initialize the interactive chart
  const interactiveChart = new InteractiveChart();
  // Expose for debugging
  window.interactiveChart = interactiveChart;
  window.chart = interactiveChart.chart;
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeInteractiveChart);
} else {
  // DOM is already loaded
  initializeInteractiveChart();
}

// Export for module usage if needed
if (typeof module !== "undefined" && module.exports) {
  module.exports = { InteractiveChart, initializeInteractiveChart };
}
