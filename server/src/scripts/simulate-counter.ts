/**
 * Front Back IR Counter 시뮬레이터
 *
 * @description
 * 전후방 적외선 센서의 실시간 CLI 시뮬레이터입니다.
 * 듀얼 IR 센서 구성을 위한 대화형 시각화 및 데이터 수집 기능을 제공하며,
 * 네트워크 통신 기능을 포함한 완전한 시뮬레이션 환경을 구현합니다.
 *
 * @features
 * - 전후방 IR 센서 시뮬레이션 및 레이저 시각화
 * - WASD 키보드 조작을 통한 장애물 제어
 * - 좌표계 기반 실시간 CLI 시각화
 * - 고주파 데이터 수집 (1ms 간격)
 * - 세션 기반 인증을 통한 HTTP API 연동
 * - 페이로드 크기 모니터링이 포함된 실시간 데이터 전송
 * - 센서 위치 및 장애물 속성 설정 가능
 *
 * @architecture
 * - Sensor: 설정 가능한 범위의 IR 레이저 센서 (최대: 255, 폭: 10)
 * - Obstacle: 감지 대상을 나타내는 대화형 정사각형 객체 (10x10)
 * - Renderer: 색상 코드 기반 CLI 좌표계 시각화
 * - SimulatorState: 센서 및 장애물에 대한 중앙 상태 관리
 * - DataCommunication: 고주파 데이터 수집 및 HTTP 전송
 * - CounterApiClient: 세션 관리 및 API 통신 계층
 * - App: 키보드 입력 처리를 포함한 메인 애플리케이션 컨트롤러
 *
 * @controls
 * - WASD: 4방향 장애물 이동
 * - Space: 장애물 활성화/비활성화 토글
 * - T: 서버로의 데이터 전송 토글
 * - Ctrl+C: 시뮬레이터 종료
 *
 * @visualization
 * - 센서: [F] (전방, 녹색) y=20 위치, [B] (후방, 파란색) y=-20 위치
 * - 레이저 빔: 수평으로 확장되는 노란색 대시(-)
 * - 장애물: 활성화 시 빨간색 슬래시(/), 비활성화 시 회색(/)
 * - 좌표계: -50~+50 범위, 10단위 격자 간격
 *
 * @data_format
 * 수집 데이터 구조: [unix_timestamp, front_reading, back_reading]
 * 전송 방식: 1초마다 배치 전송, 페이로드 크기 리포팅 포함
 */

import * as readline from "readline";

// ANSI 색상 코드
const Colors = {
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

interface Position {
  x: number;
  y: number;
}

interface CounterConfig {
  startThreshold: number;
  endThreshold: number;
  endDebouncingTime: number;
}

type CounterDataItem = [number, number, number];

class CounterApiClient {
  private baseUrl: string;
  private sessionKey: string | null = null;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  async login(username: string, password: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/actors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(
          `Login failed: ${response.status} ${response.statusText}`
        );
      }

      this.sessionKey = await response.text();
      return this.sessionKey;
    } catch (error) {
      throw new Error(`Login error: ${error}`);
    }
  }

  async registerCounter(
    deviceId: string,
    name: string,
    config: CounterConfig
  ): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/counters/front-back-ir/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Session ${this.sessionKey}`,
          },
          body: JSON.stringify({
            deviceId,
            name,
            ...config,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Register counter failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      throw new Error(`Register counter error: ${error}`);
    }
  }

  async submitSensorData(
    deviceId: string,
    data: CounterDataItem[]
  ): Promise<number> {
    try {
      const payload = JSON.stringify({ data });
      const payloadSize = Buffer.byteLength(payload, "utf8");

      const response = await fetch(
        `${this.baseUrl}/counters/front-back-ir/${deviceId}/data`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Session ${this.sessionKey}`,
          },
          body: payload,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Submit sensor data failed: ${response.status} ${response.statusText}`
        );
      }

      return payloadSize;
    } catch (error) {
      throw new Error(`Submit sensor data error: ${error}`);
    }
  }

  getSessionKey(): string | null {
    return this.sessionKey;
  }
}

class Sensor {
  private position: Position;
  private laserWidth: number;
  private maxDistance: number;
  private type: "front" | "back";

  constructor(
    position: Position,
    type: "front" | "back",
    laserWidth: number = 10
  ) {
    this.position = position;
    this.type = type;
    this.laserWidth = laserWidth;
    this.maxDistance = 255;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  getType(): "front" | "back" {
    return this.type;
  }

  getLaserWidth(): number {
    return this.laserWidth;
  }

  measureDistance(obstacles: Obstacle[]): number {
    let closestDistance = this.maxDistance;

    for (const obstacle of obstacles) {
      if (!obstacle.isActive()) continue;

      const obstaclePos = obstacle.getPosition();
      const obstacleSize = obstacle.getSize();

      if (
        obstaclePos.y <= this.position.y + this.laserWidth / 2 &&
        obstaclePos.y + obstacleSize >= this.position.y - this.laserWidth / 2
      ) {
        if (obstaclePos.x >= this.position.x) {
          const distance = obstaclePos.x - this.position.x;
          if (distance < closestDistance) {
            closestDistance = distance;
          }
        }
      }
    }

    return Math.max(0, this.maxDistance - closestDistance);
  }
}

class Obstacle {
  private position: Position;
  private size: number;
  private active: boolean;

  constructor(position: Position, size: number = 10) {
    this.position = position;
    this.size = size;
    this.active = false;
  }

  getPosition(): Position {
    return { ...this.position };
  }

  getSize(): number {
    return this.size;
  }

  isActive(): boolean {
    return this.active;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  toggleActive(): void {
    this.active = !this.active;
  }

  move(dx: number, dy: number): void {
    this.position.x += dx;
    this.position.y += dy;
  }

  setPosition(position: Position): void {
    this.position = { ...position };
  }
}

class SimulatorState {
  private frontSensor: Sensor;
  private backSensor: Sensor;
  private obstacles: Obstacle[];

  constructor() {
    this.frontSensor = new Sensor({ x: 0, y: 20 }, "front");
    this.backSensor = new Sensor({ x: 0, y: -20 }, "back");
    const obstacle = new Obstacle({ x: 100, y: 0 });
    obstacle.setActive(false); // 기본적으로 비활성화 (회색으로 표시)
    this.obstacles = [obstacle];
  }

  getFrontSensor(): Sensor {
    return this.frontSensor;
  }

  getBackSensor(): Sensor {
    return this.backSensor;
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  addObstacle(obstacle: Obstacle): void {
    this.obstacles.push(obstacle);
  }

  removeObstacle(index: number): void {
    if (index >= 0 && index < this.obstacles.length) {
      this.obstacles.splice(index, 1);
    }
  }

  getSensorReadings(): [number, number] {
    return [
      this.frontSensor.measureDistance(this.obstacles),
      this.backSensor.measureDistance(this.obstacles),
    ];
  }
}

class Renderer {
  private width: number;
  private height: number;
  private scale: number;
  private logs: string[];
  private maxLogs: number;

  constructor(
    width: number = 30,
    height: number = 10,
    scale: number = 10,
    logHeight: number = 5
  ) {
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.logs = [];
    this.maxLogs = logHeight;
  }

  addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  render(
    state: SimulatorState,
    transmissionEnabled?: boolean,
    deviceId?: string
  ): string {
    const grid: string[][] = [];

    for (let y = 0; y < this.height; y++) {
      grid[y] = new Array(this.width).fill(" ");
    }

    const frontSensor = state.getFrontSensor();
    const backSensor = state.getBackSensor();
    const obstacles = state.getObstacles();

    this.renderLasers(grid, frontSensor, obstacles);
    this.renderLasers(grid, backSensor, obstacles);
    this.renderObstacles(grid, obstacles);
    this.renderSensor(grid, frontSensor, `${Colors.green}[F]${Colors.reset}`);
    this.renderSensor(grid, backSensor, `${Colors.blue}[B]${Colors.reset}`);

    let output = "";

    // Calculate world coordinates (range: -50 to 50, height=10 means each row = 10 units)
    // Top row (y=9) = +40, middle row (y=5) = 0, bottom row (y=0) = -50

    for (let y = this.height - 1; y >= 0; y--) {
      // Calculate world Y coordinate: map height to -50 to +50 range
      const worldY = (y - Math.floor(this.height / 2)) * this.scale;

      // Add Y coordinate labels for key positions (outside the graph area)
      let yLabel = "";
      if (worldY % 20 === 0) {
        yLabel = `${Colors.gray}${worldY.toString().padStart(3)}${
          Colors.reset
        }`;
      } else {
        yLabel = `${Colors.gray}   ${Colors.reset}`;
      }

      // Add padding and vertical line separator
      const padding = "  "; // 2 spaces padding
      const separator = `${Colors.gray}│${Colors.reset}`;

      output += yLabel + padding + separator + " " + grid[y].join("") + "\n";
    }

    // Add X axis at y=0 line (with proper padding to align with graph)
    const zeroLine = Math.floor(this.height / 2);
    if (zeroLine >= 0 && zeroLine < this.height) {
      // Add a visual indicator for y=0 line with consistent spacing
      const axisLabel = `${Colors.gray}   ${Colors.reset}`; // 3 spaces to match yLabel width
      const padding = "  "; // 2 spaces padding
      const separator = `${Colors.gray}└${Colors.reset}`;
      const xAxis = `${Colors.gray}${"─".repeat(Math.min(this.width, 15))}→ X${
        Colors.reset
      }`;

      output += axisLabel + padding + separator + xAxis + "\n";
    }

    const [frontReading, backReading] = state.getSensorReadings();
    const activeObstacles = state
      .getObstacles()
      .filter((o) => o.isActive()).length;

    // Device ID display
    if (deviceId) {
      output += `\n${Colors.cyan}Device ID:${Colors.reset} ${deviceId}\n`;
    } else {
      output += `\n${Colors.cyan}Device ID:${Colors.reset} Not set\n`;
    }

    // Sensor readings
    output += `${Colors.cyan}Sensor Readings:${Colors.reset} `;
    output += `${Colors.green}Front=${frontReading.toFixed(1)}${
      Colors.reset
    }, `;
    output += `${Colors.blue}Back=${backReading.toFixed(1)}${Colors.reset} | `;

    // Transmission status
    const transmissionStatusColor = transmissionEnabled
      ? Colors.green
      : Colors.red;
    const transmissionStatus = transmissionEnabled ? "ON" : "OFF";
    output += `${Colors.cyan}Transmission:${Colors.reset} ${transmissionStatusColor}${transmissionStatus}${Colors.reset}\n`;

    // Obstacles status and position
    const obstacleStatusColor = activeObstacles > 0 ? Colors.red : Colors.gray;
    const obstacleStatus = activeObstacles > 0 ? "active" : "inactive";
    const firstObstacle = state.getObstacles()[0];
    const obstaclePos = firstObstacle
      ? firstObstacle.getPosition()
      : { x: 0, y: 0 };
    output += `${Colors.magenta}Obstacles:${Colors.reset} ${obstacleStatusColor}${obstacleStatus}${Colors.reset} | `;
    output += `${Colors.magenta}Obstacle Position:${Colors.reset} ${obstaclePos.x}, ${obstaclePos.y}\n`;

    output += `${Colors.white}Controls: WASD (move), Space (toggle), T (transmission), Q (quit)${Colors.reset}\n`;

    output += `\n${Colors.cyan}[LOG AREA]${Colors.reset}\n`;

    for (let i = 0; i < this.maxLogs; i++) {
      if (i < this.logs.length) {
        output += this.logs[i] + "\n";
      } else {
        output += "\n";
      }
    }

    return output;
  }

  private renderSensor(grid: string[][], sensor: Sensor, symbol: string): void {
    const pos = sensor.getPosition();
    const gridX = Math.floor(pos.x / this.scale);
    const yOffset = Math.floor(this.height / 2);
    const gridY = Math.floor(pos.y / this.scale) + yOffset;

    if (
      gridX >= 0 &&
      gridX < this.width - 3 &&
      gridY >= 0 &&
      gridY < this.height
    ) {
      // ANSI 색상 코드가 포함된 문자열을 그리드에 직접 배치
      grid[gridY][gridX] = symbol;
      // 추가 셀은 빈 공간으로 처리 (색상 코드 때문에 복잡함을 방지)
      grid[gridY][gridX + 1] = "";
      grid[gridY][gridX + 2] = "";
    }
  }

  private renderLasers(
    grid: string[][],
    sensor: Sensor,
    obstacles: Obstacle[]
  ): void {
    const pos = sensor.getPosition();
    const distance = sensor.measureDistance(obstacles);
    const actualDistance = 255 - distance;

    const startX = Math.floor(pos.x / this.scale) + 3;
    const endX = Math.min(
      this.width - 1,
      Math.floor((pos.x + actualDistance) / this.scale)
    );
    const yOffset = Math.floor(this.height / 2);
    const laserY = Math.floor(pos.y / this.scale) + yOffset;

    if (laserY >= 0 && laserY < this.height) {
      const laserChar = `${Colors.yellow}-${Colors.reset}`;
      for (let x = startX; x <= endX; x++) {
        if (x >= 0 && x < this.width && grid[laserY][x] === " ") {
          grid[laserY][x] = laserChar;
        }
      }
    }
  }

  private renderObstacles(grid: string[][], obstacles: Obstacle[]): void {
    const yOffset = Math.floor(this.height / 2);

    for (const obstacle of obstacles) {
      const pos = obstacle.getPosition();
      const size = obstacle.getSize();
      const gridX = Math.floor(pos.x / this.scale);
      const gridY = Math.floor(pos.y / this.scale) + yOffset;
      const gridSize = Math.max(1, Math.floor(size / this.scale));

      // 활성 상태에 따라 색상 결정
      const isActive = obstacle.isActive();
      const obstacleChar = isActive
        ? `${Colors.red}/${Colors.reset}`
        : `${Colors.gray}/${Colors.reset}`;

      for (let dy = 0; dy < gridSize; dy++) {
        for (let dx = 0; dx < gridSize; dx++) {
          const x = gridX + dx;
          const y = gridY + dy;
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            grid[y][x] = obstacleChar;
          }
        }
      }
    }
  }

  clearScreen(): void {
    console.clear();
  }
}

type SensorData = [number, number, number];

class DataCommunication {
  private data: SensorData[];
  private lastTransmission: number;
  private isCollecting: boolean;
  private apiClient: CounterApiClient;
  private deviceId: string;
  private transmissionEnabled: boolean = false;

  constructor(apiClient: CounterApiClient, deviceId: string) {
    this.data = [];
    this.lastTransmission = Date.now();
    this.isCollecting = false;
    this.apiClient = apiClient;
    this.deviceId = deviceId;
  }

  startCollection(): void {
    this.isCollecting = true;
    this.collectData();
  }

  stopCollection(): void {
    this.isCollecting = false;
  }

  toggleTransmission(): void {
    this.transmissionEnabled = !this.transmissionEnabled;

    if (this.transmissionEnabled) {
      // Clear previous data and reset timing when starting transmission
      this.data = [];
      this.lastTransmission = Date.now();
    }
  }

  isTransmissionEnabled(): boolean {
    return this.transmissionEnabled;
  }

  private collectData(): void {
    if (!this.isCollecting) return;

    // Only collect 1ms data when transmission is enabled
    if (this.transmissionEnabled && this.simulatorState) {
      const [frontReading, backReading] =
        this.simulatorState.getSensorReadings();
      this.recordReading(frontReading, backReading);
    }

    setTimeout(() => {
      if (this.isCollecting) {
        this.collectData();
      }
    }, 1); // Back to 1ms interval
  }

  setSimulatorState(state: SimulatorState): void {
    this.simulatorState = state;
  }

  private simulatorState: SimulatorState | null = null;

  private recordReading(frontSensor: number, backSensor: number): void {
    const absoluteTimestamp = Date.now();
    this.data.push([absoluteTimestamp, frontSensor, backSensor]);

    if (
      this.transmissionEnabled &&
      Date.now() - this.lastTransmission >= 1000
    ) {
      this.transmitData();
      this.lastTransmission = Date.now();
    }
  }

  private async transmitData(): Promise<void> {
    if (this.data.length === 0) return;

    const dataCount = this.data.length;
    const timeSpan =
      dataCount > 0 ? this.data[this.data.length - 1][0] - this.data[0][0] : 0;

    try {
      const payloadSize = await this.apiClient.submitSensorData(
        this.deviceId,
        this.data
      );
      this.lastTransmissionInfo = `✓ Sent ${dataCount} readings (~1ms interval, ${timeSpan}ms span, ${payloadSize} bytes)`;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.lastTransmissionInfo = `✗ Failed to send ${dataCount} readings: ${errorMessage}`;
    }

    this.data = [];
  }

  getLastTransmissionInfo(): string | null {
    return this.lastTransmissionInfo;
  }

  private lastTransmissionInfo: string | null = null;

  getData(): SensorData[] {
    return [...this.data];
  }
}

interface KeyBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  toggle: string;
  transmit: string;
  quit: string;
}

class App {
  private state: SimulatorState;
  private renderer: Renderer;
  private dataCommunication: DataCommunication;
  private keyBindings: KeyBindings;
  private isRunning: boolean;
  private rl: readline.Interface;
  private apiClient: CounterApiClient;
  private deviceId: string;
  private isAuthenticated: boolean = false;
  private isCounterRegistered: boolean = false;

  constructor() {
    this.state = new SimulatorState();
    this.renderer = new Renderer();
    this.apiClient = new CounterApiClient();
    this.deviceId = `simulator-${Date.now()}`;
    this.dataCommunication = new DataCommunication(
      this.apiClient,
      this.deviceId
    );
    this.keyBindings = {
      up: "w",
      down: "s",
      left: "a",
      right: "d",
      toggle: " ",
      transmit: "t",
      quit: "q",
    };
    this.isRunning = false;
    // Initialize readline interface later to avoid conflicts
    this.rl = null as any;
  }

  setKeyBindings(keyBindings: Partial<KeyBindings>): void {
    this.keyBindings = { ...this.keyBindings, ...keyBindings };
  }

  private async initialize(): Promise<void> {
    // Step 1: Login
    await this.performLogin();
    if (!this.isAuthenticated) {
      throw new Error("Authentication failed");
    }

    // Step 2: Register Counter
    await this.registerCounter();
    if (!this.isCounterRegistered) {
      throw new Error("Counter registration failed");
    }

    console.log(
      `${Colors.green}✓ Simulator initialization complete!${Colors.reset}`
    );
    console.log(
      `${Colors.cyan}Starting simulator interface...${Colors.reset}\n`
    );

    this.renderer.addLog("Simulator started successfully");
    this.renderer.addLog("Use WASD to move obstacle");
    this.renderer.addLog("Press T to toggle data transmission");
  }

  private async performLogin(): Promise<void> {
    console.log(
      `${Colors.cyan}=== Front Back IR Counter Simulator Login ===${Colors.reset}`
    );
    console.log("Please enter your credentials:");

    const username = await this.promptInput("Username: ");
    const password = await this.promptInput("Password: ", true);

    try {
      console.log(
        `\n${Colors.yellow}Attempting login as '${username}'...${Colors.reset}`
      );
      const sessionKey = await this.apiClient.login(username, password);

      this.isAuthenticated = true;
      console.log(
        `${Colors.green}✓ Login successful! Session: ${sessionKey.substring(
          0,
          8
        )}...${Colors.reset}`
      );
      this.renderer.addLog(`Login successful as '${username}'`);
    } catch (error: any) {
      console.log(
        `${Colors.red}✗ Login failed: ${error.message}${Colors.reset}`
      );
      this.renderer.addLog(`Login failed: ${error.message}`);
      throw error;
    }
  }

  private async promptInput(
    prompt: string,
    isPassword: boolean = false
  ): Promise<string> {
    return new Promise((resolve) => {
      if (isPassword) {
        // Password input with hidden characters
        process.stdout.write(prompt);

        let password = "";
        const stdin = process.stdin;

        // Set up raw mode for password input
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const onData = (key: string) => {
          if (key === "\r" || key === "\n") {
            // Enter key
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener("data", onData);
            process.stdout.write("\n");
            resolve(password);
          } else if (key === "\u0003") {
            // Ctrl+C
            stdin.setRawMode(false);
            process.stdout.write("\n");
            process.exit(1);
          } else if (key === "\u007f" || key === "\b") {
            // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write("\b \b");
            }
          } else if (key >= " " && key <= "~") {
            // Printable characters only
            password += key;
            process.stdout.write("*");
          }
          // Ignore other control characters
        };

        stdin.on("data", onData);
      } else {
        // Regular input using readline
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question(prompt, (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      }
    });
  }

  private async registerCounter(): Promise<void> {
    try {
      const counterConfig: CounterConfig = {
        startThreshold: 50,
        endThreshold: 30,
        endDebouncingTime: 500,
      };

      console.log(
        `${Colors.yellow}Registering counter with ID: ${this.deviceId}${Colors.reset}`
      );
      await this.apiClient.registerCounter(
        this.deviceId,
        `IR Counter Simulator`,
        counterConfig
      );

      this.isCounterRegistered = true;
      console.log(
        `${Colors.green}✓ Counter registered successfully!${Colors.reset}`
      );
      this.renderer.addLog(`Counter registered: ${this.deviceId}`);
    } catch (error: any) {
      console.log(
        `${Colors.red}✗ Counter registration failed: ${error.message}${Colors.reset}`
      );
      this.renderer.addLog(`Counter registration failed: ${error.message}`);
      throw error;
    }
  }

  async start(): Promise<void> {
    try {
      // Initialize authentication and counter registration
      await this.initialize();

      this.isRunning = true;
      this.dataCommunication.setSimulatorState(this.state);
      this.dataCommunication.startCollection();

      // Initialize readline interface after login is complete
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      try {
        if (process.stdin.isTTY && process.stdin.setRawMode) {
          process.stdin.setRawMode(true);
          process.stdin.resume();
          process.stdin.setEncoding("utf8");

          process.stdin.on("data", (key: string) => {
            this.handleKeyPress(key);
          });
          console.log("Using raw mode for immediate key response");
        } else {
          console.log("Raw mode not supported. Using readline interface.");
          console.log(
            "Commands: w/a/s/d (move), space (toggle), t (transmission), q (quit)"
          );
          this.rl.on("line", (input: string) => {
            const trimmed = input.trim();
            if (trimmed.length > 0) {
              this.handleKeyPress(trimmed === "space" ? " " : trimmed[0]);
            }
          });
        }
      } catch (error) {
        console.log("Fallback to readline interface");
        this.rl.on("line", (input: string) => {
          const trimmed = input.trim();
          if (trimmed.length > 0) {
            this.handleKeyPress(trimmed === "space" ? " " : trimmed[0]);
          }
        });
      }

      this.gameLoop();
    } catch (error: any) {
      console.error("Failed to start simulator:", error.message);
      process.exit(1);
    }
  }

  private handleKeyPress(key: string): void {
    if (!this.isRunning) return;

    const obstacles = this.state.getObstacles();
    if (obstacles.length === 0) return;

    const obstacle = obstacles[0];
    const moveDistance = 10;

    switch (key.toLowerCase()) {
      case this.keyBindings.up:
        obstacle.move(0, moveDistance);
        break;
      case this.keyBindings.down:
        obstacle.move(0, -moveDistance);
        break;
      case this.keyBindings.left:
        obstacle.move(-moveDistance, 0);
        break;
      case this.keyBindings.right:
        obstacle.move(moveDistance, 0);
        break;
      case this.keyBindings.toggle:
        const newState = !obstacle.isActive();
        this.renderer.addLog(
          `Obstacle ${newState ? "activated" : "deactivated"}`
        );
        obstacle.toggleActive();
        break;
      case this.keyBindings.transmit:
        this.dataCommunication.toggleTransmission();
        const transmissionState =
          this.dataCommunication.isTransmissionEnabled();
        this.renderer.addLog(
          `Data transmission ${transmissionState ? "ENABLED" : "DISABLED"}`
        );
        break;
      case this.keyBindings.quit:
      case "\u0003":
        this.renderer.addLog("Shutting down simulator...");
        this.stop();
        break;
      default:
        this.renderer.addLog(`Unhandled key: "${key}"`);
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    this.renderer.clearScreen();

    // Check for data transmission updates
    const transmissionInfo = this.dataCommunication.getLastTransmissionInfo();
    if (transmissionInfo) {
      this.renderer.addLog(transmissionInfo);
      // Clear the transmission info after displaying
      this.dataCommunication["lastTransmissionInfo"] = null;
    }

    const output = this.renderer.render(
      this.state,
      this.dataCommunication.isTransmissionEnabled(),
      this.deviceId
    );
    console.log(output);

    // Data collection is now handled by DataCommunication's 1ms timer
    // No need to manually record readings here

    setTimeout(() => {
      this.gameLoop();
    }, 50);
  }

  stop(): void {
    this.isRunning = false;
    this.dataCommunication.stopCollection();
    try {
      if (process.stdin.setRawMode) {
        process.stdin.setRawMode(false);
      }
    } catch (error) {
      // Ignore error
    }
    if (this.rl) {
      this.rl.close();
    }
    process.exit(0);
  }
}

if (require.main === module) {
  const app = new App();

  console.log(
    `${Colors.magenta}Front Back IR Counter Simulator${Colors.reset}`
  );
  console.log(
    `${Colors.white}Connect to your linetracer counter system\n${Colors.reset}`
  );

  app.start().catch((error) => {
    console.error(
      `${Colors.red}Simulator failed to start: ${error.message}${Colors.reset}`
    );
    process.exit(1);
  });
}
