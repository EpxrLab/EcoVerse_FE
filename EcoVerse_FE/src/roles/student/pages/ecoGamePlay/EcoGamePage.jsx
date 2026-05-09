import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
  const [tutorialSlide, setTutorialSlide] = useState(0);
  const gameStartTimeRef = useRef(null);
  const deadTimeRef = useRef(0);
  const pauseStartTimeRef = useRef(null);
  const navigate = useNavigate();
  const { campaignId, roundId, roundGameConfigId } = useParams();
  const location = useLocation();
  const levelNumber = location.state?.levelNumber;
  const presetId = location.state?.presetId;
  const typeCode = location.state?.typeCode;

  // Derive stage1 game type from typeCode
  const stage1Game = useMemo(() => {
    if (typeCode === "COLLECT_SORTING") return "searescue";
    if (typeCode === "GRABBER_SORTING") return "grabber";
    return "runner";
  }, [typeCode]);

  // Tutorial content per game type
  const TUTORIAL_CONTENT = useMemo(() => {
    const stage1Map = {
      runner: {
        icon: "🏃",
        title: "Game Đua Chạy - Thu Gom Rác",
        steps: [
          { icon: "←→", label: "Dùng phím mũi tên \u2190 \u2192 để di chuyển trái / phải" },
          { icon: "↑", label: "Nhấn \u2191 hoặc SPACE để nhảy qua chướng ngại vật" },
          { icon: "🗑️", label: "Tiếp xúc với rác để tự động thu gom" },
          { icon: "❤️", label: "Va chạm chướng ngại vật sẽ mất mạng, khi hết mạng game kết thúc" },
          { icon: "🎯", label: "Thu đủ số rác yêu cầu để tiến sang Stage 2" },
        ],
      },
      searescue: {
        icon: "🐳",
        title: "Sea Rescue - Cứu Hộ Biển",
        steps: [
          { icon: "←→↑↓", label: "Dùng phím mũi tên hoặc WASD để điều khiển" },
          { icon: "🗑️", label: "Bơi đến các vật phẩm rác để thu gom" },
          { icon: "⏳", label: "Hoàn thành trước khi hết thời gian" },
          { icon: "❤️", label: "Tránh vật cản, mỗi lần va chạm mất 1 điểm máu" },
          { icon: "🎯", label: "Thu đủ tỷ lệ rác yêu cầu để tiến sang Stage 2" },
        ],
      },
      grabber: {
        icon: "🧲",
        title: "Grabber - Khóa & Bắt Rác",
        steps: [
          { icon: "🖥️", label: "Di chuyển chuột để điều chỉnh hướng cầu nâng" },
          { icon: "💥", label: "Click chuột để thả cầu nâng xuống bắt rác" },
          { icon: "⏳", label: "Hoàn thành trong thời gian quy định" },
          { icon: "🎯", label: "Bắt đủ ≥ 80% số rác để tiến sang Stage 2" },
        ],
      },
    };
    return stage1Map[stage1Game] || stage1Map["runner"];
  }, [stage1Game]);

  const STAGE2_TUTORIAL = {
    icon: "♻️",
    title: "Stage 2 - Phân Loại Rác",
    steps: [
      { icon: "📱", label: "Rác sẽ lần lượt xuất hiện trên màn hình 3D" },
      { icon: "✋", label: "Nhấp giữ và kéo (Drag & Drop) từng vật vào thùng phân loại đúng" },
      { icon: "🗑️", label: "Các loại thùng: Hữu cơ, Tái chế, Nước, Thông thường" },
      { icon: "✅", label: "Phân loại đúng được cộng điểm, phân loại sai bị trừ điểm" },
      { icon: "⏳", label: "Hoàn thành trước khi hết thời gian để đạt kết quả tốt nhất" },
    ],
  };

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

        // Helper to determine stage 1 game engine
        const getStage1Type = (code) => {
          if (code === "COLLECT_SORTING") return "searescue";
          if (code === "GRABBER_SORTING") return "grabber";
          return "runner"; // Default to runner
        };

        const stage1Game = getStage1Type(typeCode);

        // Build the final config for EcoGame
        const finalConfig = {
          id: apiData.roundGameConfigId,
          sessionId: apiData.sessionId,
          name: apiData.gameTypeName || "",
          difficulty: apiData.resolvedDifficulty?.toLowerCase() || "medium",
          campaignType:
            apiData.campaignType ||
            apiData.campaign?.campaignType ||
            location.state?.campaignType,
          stage1Game,
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
          grabber: {
            gameTime:
              apiData.timeLimitSeconds > 0 ? apiData.timeLimitSeconds : 90,
            totalTrash: apiData.itemCount || 10,
            requiredPercentage: 80,
          },
          sorter: {
            timeLimit: Math.max(apiData.timeLimitSeconds || 0, 60),
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

        // No longer resetting timer here to include Stage 1 duration in total result
        game.onStageChange((newStage) => {
          if (newStage === "STAGE_2") {
            console.log("[EcoGamePage] Stage 2 started. Total time continues...");
          }
        });

        // Register loading listener for Stage 2
        game.onStageLoading((isLoading, progress, text) => {
          if (isLoading) {
            // "Freeze" the game timer during loading transitions to be fair to the student
            if (!pauseStartTimeRef.current) {
              pauseStartTimeRef.current = Date.now();
            }
          } else {
            // Resume timer by adding the "loading time" to deadTimeRef
            if (pauseStartTimeRef.current) {
              deadTimeRef.current += Date.now() - pauseStartTimeRef.current;
              pauseStartTimeRef.current = null;
            }
          }

          setLoading(isLoading);
          setLoadingProgress(Math.round(progress * 100));
          if (text) setLoadingText(text);
        });

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
  }, [
    campaignId,
    roundId,
    roundGameConfigId,
    levelNumber,
    typeCode,
    replayKey,
  ]);

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
      // If Stage 1 failure, do not submit to backend as it only handles sorting results
      // and we want to preserve the local Stage 1 metrics in the result modal.
      if (result.failedAtStage === 1) {
        return null;
      }

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

      const correctItems = Math.max(
        0,
        (result.sortingScore?.correct || 0) - (result.sortingScore?.wrong || 0),
      );

      const payload = {
        totalItems: Math.max(
          0,
          correctItems + (result.sortingScore?.wrong || 0),
        ),
        correctItems,
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
            zIndex: 100000,
            gap: "16px",
            padding: "24px",
          }}
        >
          {/* Tutorial Hero Card */}
          <div
            style={{
              width: "100%",
              maxWidth: "540px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "16px",
              padding: "24px 28px",
              marginBottom: "8px",
            }}
          >
            {/* Slide header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "28px" }}>
                  {tutorialSlide === 0 ? TUTORIAL_CONTENT.icon : STAGE2_TUTORIAL.icon}
                </span>
                <div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                    {tutorialSlide === 0 ? "Stage 1" : "Stage 2"} • Hướng dẫn chơi
                  </p>
                  <p style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: 0 }}>
                    {tutorialSlide === 0 ? TUTORIAL_CONTENT.title : STAGE2_TUTORIAL.title}
                  </p>
                </div>
              </div>
              {/* Slide dots */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[0, 1].map((i) => (
                  <button
                    key={i}
                    onClick={() => setTutorialSlide(i)}
                    style={{
                      width: i === tutorialSlide ? "20px" : "8px",
                      height: "8px",
                      borderRadius: "999px",
                      background: i === tutorialSlide ? "#fff" : "rgba(255,255,255,0.25)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {(tutorialSlide === 0 ? TUTORIAL_CONTENT.steps : STAGE2_TUTORIAL.steps).map((step, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  >
                    {step.icon}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", margin: 0, lineHeight: 1.5 }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Next / Prev button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
              {tutorialSlide === 0 ? (
                <button
                  onClick={() => setTutorialSlide(1)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "7px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Xem tiếp Stage 2 →
                </button>
              ) : (
                <button
                  onClick={() => setTutorialSlide(0)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    padding: "7px 16px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ← Xem lại Stage 1
                </button>
              )}
            </div>
          </div>

          {/* Spinner & Progress */}
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 36, color: "#ffffffff" }}
                spin
              />
            }
          />
          <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>{loadingText}</p>
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
      <div
        style={{
          display: loading ? "none" : "block",
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
            key={replayKey}
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
    </div>
  );
}
