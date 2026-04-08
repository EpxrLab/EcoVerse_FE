import { useRef, useEffect, useState, useCallback } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { Spin, Progress } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import EcoGame from "../../features/eco-game/EcoGame";
import EcoGameHUD from "../../features/eco-game/EcoGameHUD";
import { startGame } from "../../services";

export default function EcoGamePage() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [levelConfig, setLevelConfig] = useState(null);
  const navigate = useNavigate();
  const { campaignId, roundId, roundGameConfigId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const levelNumber = location.state?.levelNumber;
  const typeCode = location.state?.typeCode;

  useEffect(() => {
    let cancelled = false;

    async function initGame() {
      try {
        setLoading(true);
        setLoadingText("Đang tải thông tin màn chơi...");

        // Call the real API
        const response = await startGame(
          campaignId,
          roundId,
          roundGameConfigId,
          levelNumber,
        );
        if (cancelled) return;

        const apiData = response?.data;
        if (!apiData) throw new Error("Invalid API response");

        setLoadingText("Đang tải dữ liệu 3D Models...");
        const wasteItems = apiData.wasteItems || [];

        // Pre-load logic for GLTF models
        const loader = new GLTFLoader();
        let loadedCount = 0;

        const preloadedItems = await Promise.all(
          wasteItems.map((item) => {
            return new Promise((resolve) => {
              if (!item.imageUrl) {
                loadedCount++;
                setLoadingProgress(
                  Math.round((loadedCount / wasteItems.length) * 100),
                );
                resolve({ ...item, preloadedModel: null });
                return;
              }
              loader.load(
                item.imageUrl,
                (gltf) => {
                  loadedCount++;
                  setLoadingProgress(
                    Math.round((loadedCount / wasteItems.length) * 100),
                  );

                  // Setup shading
                  gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                      child.castShadow = true;
                      child.receiveShadow = true;
                    }
                  });
                  resolve({ ...item, preloadedModel: gltf.scene });
                },
                undefined,
                (err) => {
                  console.warn("Failed to load model for", item.itemName, err);
                  loadedCount++;
                  setLoadingProgress(
                    Math.round((loadedCount / wasteItems.length) * 100),
                  );
                  resolve({ ...item, preloadedModel: null });
                },
              );
            });
          }),
        );

        // Build the final config for EcoGame
        const isCollectGame = typeCode === "COLLECT_SORTING";
        const finalConfig = {
          id: apiData.roundGameConfigId,
          name: apiData.gameTypeName || "",
          difficulty: apiData.resolvedDifficulty?.toLowerCase() || "medium",
          stage1Game: isCollectGame ? "searescue" : "runner",
          runner: {
            // we can override default runner props here if needed
          },
          searescue: {
            gameTime:
              apiData.timeLimitSeconds > 0 ? apiData.timeLimitSeconds : 60,
            totalTrash: apiData.itemCount,
            maxHp: apiData.lives || 10,
          },
          sorter: {
            timeLimit: apiData.timeLimitSeconds || 0,
          },
          wasteItems: preloadedItems,
          itemCount: apiData.itemCount, // store root level info for runner game
          lives: apiData.lives,
        };

        setLevelConfig(finalConfig);
        setLoading(false);

        requestAnimationFrame(() => {
          if (cancelled || !containerRef.current) return;

          const game = new EcoGame();
          game.init(containerRef.current, finalConfig);
          gameRef.current = game;
          setGameInstance(game);
        });
      } catch (err) {
        console.error("[EcoGamePage] Failed to load level config:", err);
        if (!cancelled) setLoading(false);
      }
    }

    if (campaignId && roundId && roundGameConfigId && levelNumber) {
      initGame();
    }

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
    };
  }, [campaignId, roundId, roundGameConfigId, levelNumber, typeCode]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate, campaignId]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "#000",
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            zIndex: 10,
            gap: "16px",
          }}
        >
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#4caf50" }}
                spin
              />
            }
          />
          <p style={{ color: "#aaa", fontSize: "16px" }}>{loadingText}</p>
          {loadingProgress > 0 && loadingProgress < 100 && (
            <div style={{ width: "200px" }}>
              <Progress
                percent={loadingProgress}
                size="small"
                strokeColor="#4caf50"
              />
            </div>
          )}
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* HUD Overlay */}
      {!loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <EcoGameHUD
              game={gameInstance}
              onBack={handleBack}
              levelConfig={levelConfig}
              gameType={typeCode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
