import { useState } from "react";

export interface LeavesSettings {
  enabled: boolean;
  size: number; // 0.5 ~ 2.0
  speed: number; // 1 ~ 10
  count: number; // 5 ~ 50
  clearInterval: number; // 30 ~ 300 (seconds)
}

interface LeavesSettingsPanelProps {
  settings: LeavesSettings;
  onSettingsChange: (settings: LeavesSettings) => void;
}

export const LeavesSettingsPanel = ({ settings, onSettingsChange }: LeavesSettingsPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof LeavesSettings, value: number | boolean) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        // 확장된 설정 패널
        <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">🍂 낙엽 설정</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* 활성화/비활성화 */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">활성화</label>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleChange("enabled", e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {/* 낙엽 크기 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">크기</label>
                <span className="text-xs text-muted-foreground">{settings.size.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.size}
                onChange={(e) => handleChange("size", parseFloat(e.target.value))}
                className="w-full cursor-pointer"
                disabled={!settings.enabled}
              />
            </div>

            {/* 떨어지는 속도 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">속도</label>
                <span className="text-xs text-muted-foreground">{settings.speed}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.speed}
                onChange={(e) => handleChange("speed", parseInt(e.target.value))}
                className="w-full cursor-pointer"
                disabled={!settings.enabled}
              />
            </div>

            {/* 낙엽 양 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">개수</label>
                <span className="text-xs text-muted-foreground">{settings.count}개</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.count}
                onChange={(e) => handleChange("count", parseInt(e.target.value))}
                className="w-full cursor-pointer"
                disabled={!settings.enabled}
              />
            </div>

            {/* 청소 주기 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-foreground">청소 주기</label>
                <span className="text-xs text-muted-foreground">{settings.clearInterval}초</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="30"
                value={settings.clearInterval}
                onChange={(e) => handleChange("clearInterval", parseInt(e.target.value))}
                className="w-full cursor-pointer"
                disabled={!settings.enabled}
              />
            </div>

            {/* 초기화 버튼 */}
            <button
              onClick={() =>
                onSettingsChange({
                  enabled: true,
                  size: 1,
                  speed: 5,
                  count: 20,
                  clearInterval: 60,
                })
              }
              className="w-full mt-2 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-foreground rounded transition-colors"
            >
              기본값으로 초기화
            </button>
          </div>
        </div>
      ) : (
        // 축소된 버튼
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border hover:bg-background/90 transition-colors"
        >
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => {
              e.stopPropagation();
              handleChange("enabled", e.target.checked);
            }}
            className="w-4 h-4 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-sm text-foreground select-none">🍂 낙엽</span>
        </button>
      )}
    </div>
  );
};
