import { useRef, useEffect, useState, useCallback } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import { Spin, Progress } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import EcoGame from "../../features/eco-game/EcoGame";
import EcoGameHUD from "../../features/eco-game/EcoGameHUD";
import { startGame, submitGame } from "../../services";
import toast from "react-hot-toast";
import { useStudentContext } from "../../context";

export default function EcoGamePage() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("");
  const [levelConfig, setLevelConfig] = useState(null);
  const [replayKey, setReplayKey] = useState(0);
  const gameStartTimeRef = useRef(null);
  const deadTimeRef = useRef(0);
  const pauseStartTimeRef = useRef(null);
  const navigate = useNavigate();
  const { campaignId, roundId, roundGameConfigId } = useParams();
  const location = useLocation();
  const levelNumber = location.state?.levelNumber;
  const presetId = location.state?.presetId;
  const typeCode = location.state?.typeCode;

  const { refreshStudentData } = useStudentContext();

  // Cảnh báo người dùng khi họ cố gắng tải lại trang hoặc đóng tab
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "Nếu bạn thoát game giữa chừng, toàn bộ dữ liệu của phiên chơi này sẽ bị mất.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initGame() {
      try {
        setLoading(true);
        setLoadingText("Đang tải thông tin màn chơi...");

        const response = await startGame(
          campaignId,
          roundId,
          roundGameConfigId,
          presetId,
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
              const modelUrl = item.imagePresignedUrl || item.imageUrl;
              if (!modelUrl) {
                loadedCount++;
                setLoadingProgress(
                  Math.round((loadedCount / wasteItems.length) * 50),
                );
                resolve({ ...item, preloadedModel: null });
                return;
              }
              loader.load(
                modelUrl,
                (gltf) => {
                  loadedCount++;
                  setLoadingProgress(
                    Math.round((loadedCount / wasteItems.length) * 50),
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
                    Math.round((loadedCount / wasteItems.length) * 50),
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
          sessionId: apiData.sessionId,
          name: apiData.gameTypeName || "",
          difficulty: apiData.resolvedDifficulty?.toLowerCase() || "medium",
          stage1Game: isCollectGame ? "searescue" : "runner",
          scorePerCorrect: apiData.scorePerCorrect || 0,
          runner: {
            itemCount: apiData.itemCount,
            lives: apiData.lives,
          },
          searescue: {
            gameTime:
              apiData.timeLimitSeconds > 0 ? apiData.timeLimitSeconds : 60,
            totalTrash: apiData.itemCount || 12,
            maxHp: apiData.lives || 10,
          },
          sorter: {
            timeLimit: apiData.timeLimitSeconds || 0,
          },
          wasteItems: preloadedItems,
          itemCount: apiData.itemCount,
          lives: apiData.lives,
          wasteCategories: apiData.wasteCategories || [],
        };

        setLevelConfig(finalConfig);
        console.log("Config ready, starting game environment load...");

        if (cancelled || !containerRef.current) return;

        setLoadingText("Đang thiết lập môi trường game...");
        const game = new EcoGame();
        gameRef.current = game;

        // Initialize game with progress tracking (Phase 2: 50% - 100%)
        await game.init(containerRef.current, finalConfig, (prog) => {
          setLoadingProgress(50 + Math.round(prog * 0.5));
          if (prog >= 100) {
            setLoadingText("Chuẩn bị bắt đầu...");
          }
        });

        if (cancelled) return;

        gameStartTimeRef.current = Date.now();
        setGameInstance(game);

        // All done!
        setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, 500);
      } catch (err) {
        const serverMessage =
          err.response?.data?.message || err?.message || "Lỗi không xác định";
        toast.error(serverMessage);
        console.log("Error Message to user:", serverMessage);
        if (!cancelled) {
          setLoading(false);
          setTimeout(() => {
            navigate(-1);
          }, 1500);
        }
      }
    }

    if (campaignId && roundId && roundGameConfigId && levelNumber) {
      deadTimeRef.current = 0;
      pauseStartTimeRef.current = null;
      setLoading(true);
      setLoadingProgress(0);
      initGame();
    }

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
    };
  }, [campaignId, roundId, roundGameConfigId, levelNumber, typeCode, replayKey]);

  const handleReplay = useCallback(() => {
    setReplayKey((prev) => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handlePauseChange = useCallback((isPaused) => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else {
      if (pauseStartTimeRef.current) {
        deadTimeRef.current += Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = null;
      }
    }
  }, []);

  // Submit game result to API
  const handleGameResult = useCallback(
    async (result) => {
      const sessionId = levelConfig?.sessionId;
      if (!sessionId) {
        console.warn("[EcoGamePage] No sessionId, skipping submit");
        return;
      }

      const timeTaken = gameStartTimeRef.current
        ? Math.max(
            0,
            Math.round(
              (Date.now() - gameStartTimeRef.current - deadTimeRef.current) /
                1000,
            ),
          )
        : 0;

      const totalItems =
        (result.sortingScore?.correct || 0) + (result.sortingScore?.wrong || 0);

      const payload = {
        totalItems,
        correctItems: result.sortingScore?.correct || 0,
        incorrectItems: result.sortingScore?.wrong || 0,
        timeTakenSeconds: timeTaken,
      };

      console.log("[EcoGamePage] Submitting game result:", payload);

      try {
        const res = await submitGame(sessionId, payload);
        console.log("[EcoGamePage] Submit result:", res);

        // Refresh sidebar coins
        if (refreshStudentData) {
          refreshStudentData();
        }

        return res?.data; // Return API response back to HUD
      } catch (err) {
        console.error("[EcoGamePage] Failed to submit game result:", err);
        return null;
      }
    },
    [levelConfig, refreshStudentData],
  );

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
                style={{ fontSize: 48, color: "#ffffffff" }}
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
                strokeColor="#ffffff"
                trailColor="rgba(255, 255, 255, 0.2)"
                showInfo={false}
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
            zIndex: 9999,
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <EcoGameHUD
              game={gameInstance}
              onBack={handleBack}
              levelConfig={levelConfig}
              gameType={typeCode}
              onGameResult={handleGameResult}
              onPauseChange={handlePauseChange}
              onReplay={handleReplay}
            />
          </div>
        </div>
      )}
    </div>
  );
}
