import { useEffect, useState } from "react";

interface Leaf {
  id: number;
  type: number;
  x: number;
  y: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  sway: number;
  swayOffset: number;
  swaySpeed: number;
}

interface FallingLeavesProps {
  speed?: number; // 낙엽 떨어지는 속도 (1-10, 기본값 5)
  count?: number; // 떨어질 낙엽 개수 (1-50, 기본값 20)
  enabled?: boolean; // 애니메이션 활성화 여부
  size?: number; // 낙엽 크기 배율 (0.5-2.0, 기본값 1.0)
  clearIntervalSeconds?: number; // 바닥 낙엽 청소 주기 (초, 기본값 60)
}

// 5가지 낙엽 PNG (가을 느낌의 단풍잎, 은행잎, 떡갈나무잎 등)
const LeafSVG = ({ type, className }: { type: number; className?: string }) => {
  const leaves = [
    "/autumn-leaves/maple_3802662.png", // 단풍잎
    "/autumn-leaves/ginkgo_3802615.png", // 은행잎
    "/autumn-leaves/oak_3802657.png", // 떡갈나무잎
    "/autumn-leaves/clover_3802660.png", // 클로버잎
    "/autumn-leaves/poplar_3802529.png", // 포플러잎
  ];

  return <img src={leaves[type]} alt="leaf" className={className} />;
};

export const FallingLeaves = ({
  speed = 5,
  count = 20,
  enabled = true,
  size = 1.0,
  clearIntervalSeconds = 60,
}: FallingLeavesProps) => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [groundLeaves, setGroundLeaves] = useState<Leaf[]>([]);

  // 낙엽 초기화
  useEffect(() => {
    if (!enabled) {
      setLeaves([]);
      return;
    }

    // 새로운 낙엽 생성
    const createLeaf = (id: number): Leaf => ({
      id,
      type: Math.floor(Math.random() * 5),
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2, // -1 ~ 1
      speed: (Math.random() * 0.5 + 0.5) * speed,
      sway: Math.random() * 3 + 1, // 1 ~ 4 (더 넓은 흔들림)
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.5 + 0.5, // 0.5 ~ 1 (흔들림 속도)
    });

    const initialLeaves: Leaf[] = [];
    for (let i = 0; i < count; i++) {
      initialLeaves.push(createLeaf(i));
    }
    setLeaves(initialLeaves);
  }, [enabled, count, speed]);

  // 낙엽 애니메이션
  useEffect(() => {
    if (!enabled) return;

    // 새로운 낙엽 생성
    const createLeaf = (id: number): Leaf => ({
      id,
      type: Math.floor(Math.random() * 5),
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2, // -1 ~ 1
      speed: (Math.random() * 0.5 + 0.5) * speed,
      sway: Math.random() * 3 + 1, // 1 ~ 4 (더 넓은 흔들림)
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.5 + 0.5, // 0.5 ~ 1 (흔들림 속도)
    });

    let animationId: number;
    let lastTime = Date.now();
    let leafIdCounter = count;
    let groundCounter = 0;

    const animate = () => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastTime) / 16.67; // 60fps 기준 정규화
      lastTime = currentTime;

      setLeaves((prevLeaves) => {
        const newGroundLeaves: Leaf[] = [];
        const updatedLeaves = prevLeaves
          .map((leaf) => {
            const time = Date.now() / 1000;

            // 부드러운 낙하 (중력 효과)
            const newY = leaf.y + leaf.speed * 0.15 * deltaTime;

            // 부드러운 좌우 흔들림 (사인파 + 코사인파 조합)
            const swayX = Math.sin(time * leaf.swaySpeed + leaf.swayOffset) * leaf.sway;
            const newX = Math.max(0, Math.min(100, leaf.x + swayX * 0.05 * deltaTime));

            // 부드러운 회전 (각 낙엽마다 다른 회전 속도)
            const newRotation = leaf.rotation + leaf.rotationSpeed * leaf.speed * 0.8 * deltaTime;

            // 화면 하단에 도달하면 바닥 낙엽으로 이동
            if (newY > 100) {
              newGroundLeaves.push({ ...leaf, y: 100, x: newX });
              return null;
            }

            return {
              ...leaf,
              x: newX,
              y: newY,
              rotation: newRotation,
            };
          })
          .filter((leaf): leaf is Leaf => leaf !== null);

        // 바닥에 도달한 낙엽 추가 (고유한 ID로 변환)
        if (newGroundLeaves.length > 0) {
          const newLeavesWithUniqueId = newGroundLeaves.map((leaf, index) => ({
            ...leaf,
            id: groundCounter + index,
          }));
          groundCounter += newGroundLeaves.length;
          setGroundLeaves((prev) => [...prev, ...newLeavesWithUniqueId]);
        }

        // 새로운 낙엽 추가 (사라진 만큼)
        const leavesToAdd = prevLeaves.length - updatedLeaves.length;
        for (let i = 0; i < leavesToAdd; i++) {
          updatedLeaves.push(createLeaf(leafIdCounter++));
        }

        return updatedLeaves;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
    // count는 초기값 설정용으로만 사용되며, 변경 시 effect 재실행 불필요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, speed]);

  // 바닥 낙엽 청소 주기에 따라 제거
  useEffect(() => {
    if (!enabled) {
      setGroundLeaves([]);
      return;
    }

    const intervalId = setInterval(() => {
      setGroundLeaves([]);
    }, clearIntervalSeconds * 1000); // clearIntervalSeconds초마다

    return () => clearInterval(intervalId);
  }, [enabled, clearIntervalSeconds]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 떨어지는 낙엽 */}
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute will-change-transform"
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
            transform: `rotate(${leaf.rotation}deg)`,
            width: `${24 * size}px`,
            height: `${24 * size}px`,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <LeafSVG type={leaf.type} className="w-full h-full drop-shadow-md" />
        </div>
      ))}

      {/* 바닥에 쌓인 낙엽 */}
      {groundLeaves.map((leaf) => (
        <div
          key={`ground-${leaf.id}`}
          className="absolute transition-all duration-1000 ease-out"
          style={{
            left: `${leaf.x}%`,
            bottom: "0",
            transform: `rotate(${leaf.rotation}deg)`,
            width: `${20 * size}px`,
            height: `${20 * size}px`,
            opacity: 0.7,
          }}
        >
          <LeafSVG type={leaf.type} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};
