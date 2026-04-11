import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import * as THREE from "three";
import {
  PLAYER_CAPACITY,
  PLAYER_MAX_HP,
  TOTAL_TRASH,
  GAME_TIME,
  REQUIRED_PERCENTAGE,
  isMobileDevice,
  initScene,
  initWorld,
  initStorage,
  initPlayer,
  initTrash,
  initObstacles,
  initZones,
  gameTick,
} from "./RecycleGameLogic";

/* ===================== SUB-COMPONENTS ===================== */

function DamageFlash() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle, transparent 30%, rgba(255, 0, 0, 0.6) 100%)",
        pointerEvents: "none",
        zIndex: 100,
        animation: "pulse 0.2s ease-out",
      }}
    />
  );
}

function ZoneIndicator({ currentZone }) {
  if (!currentZone) return null;
  const isSpeed = currentZone === "speed";
  return (
    <div
      style={{
        position: "absolute",
        bottom: 150,
        left: "50%",
        transform: "translateX(-50%)",
        background: isSpeed
          ? "linear-gradient(135deg, rgba(6,182,212,0.9), rgba(34,211,238,0.9))"
          : "linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))",
        color: "white",
        padding: "12px 24px",
        borderRadius: 12,
        fontSize: 18,
        fontWeight: "bold",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        border: "2px solid rgba(255,255,255,0.4)",
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {isSpeed ? (
        <>
          <span style={{ fontSize: 24 }}>⚡</span>
          <span>Tăng tốc!</span>
          <span style={{ fontSize: 14, opacity: 0.9 }}>+80%</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 24 }}>🌩</span>
          <span>Vùng sấm chớp!</span>
          <span style={{ fontSize: 14, opacity: 0.9 }}>-60%</span>
        </>
      )}
    </div>
  );
}

function HUD({
  hp,
  inventoryCount,
  inventoryFull,
  timeLeft,
  recycledCount,
  hudPulse,
}) {
  const progressPercent = (recycledCount / (TOTAL_TRASH || 12)) * 100;

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: `translateX(-50%) ${hudPulse ? "scale(1.08)" : "scale(1)"}`,
        transition: "transform 0.15s ease",
        background: inventoryFull
          ? "linear-gradient(135deg, rgba(185,28,28,0.95), rgba(239,68,68,0.95))"
          : "linear-gradient(135deg, rgba(20,83,45,0.95), rgba(34,197,94,0.95))",
        color: "white",
        padding: "16px 32px",
        borderRadius: 20,
        boxShadow: inventoryFull
          ? "0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)"
          : "0 8px 32px rgba(0,0,0,0.3)",
        border: inventoryFull
          ? "3px solid rgba(255,100,100,0.9)"
          : "3px solid rgba(255,255,255,0.3)",
        minWidth: 320,
        textAlign: "center",
        zIndex: 99999,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 12,
          fontSize: 18,
          fontWeight: "bold",
        }}
      >
        <div>
          ❤️ {hp}/{(PLAYER_MAX_HP || 5)}
        </div>
        <div style={{ color: inventoryFull ? "#fca5a5" : "white" }}>
          {inventoryFull ? "🎒❌" : "🎒"} {inventoryCount}/{(PLAYER_CAPACITY || 5)}
          {inventoryFull && (
            <span style={{ fontSize: 12, marginLeft: 4 }}>ĐẦY!</span>
          )}
        </div>
        <div>⏱️ {timeLeft || 0}s</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 14, marginBottom: 6, opacity: 0.9 }}>
          🗑️ Đã gom vào kho: {recycledCount}/{TOTAL_TRASH}
        </div>
        <div
          style={{
            width: "100%",
            height: 24,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.4)",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #fbbf24, #facc15, #fde047)",
              transition: "width 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "bold",
              color: "#000",
            }}
          >
            {progressPercent > 15 && `${Math.round(progressPercent)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileJoystick({ onTouchStart, onTouchMove, onTouchEnd }) {
  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        position: "absolute",
        bottom: 30,
        left: 30,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        border: "3px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.6)",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

function GameOverScreen({ message, recycledCount, onAction }) {
  const requiredTrash = Math.ceil(((REQUIRED_PERCENTAGE || 80) / 100) * (TOTAL_TRASH || 12));
  const canProceed = recycledCount >= requiredTrash;
  const isWin = message.includes("Hoàn thành") || canProceed;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        color: "white",
        padding: 20,
      }}
    >
      <h1
        style={{
          fontSize: 48,
          marginBottom: 20,
          textShadow: "0 4px 16px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        {message}
      </h1>

      {!message.includes("Hoàn thành") && (
        <div
          style={{
            background: canProceed
              ? "rgba(34,197,94,0.2)"
              : "rgba(239,68,68,0.2)",
            border: canProceed ? "2px solid #22c55e" : "2px solid #ef4444",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            maxWidth: 500,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 12, fontWeight: "bold" }}>
            {canProceed ? "✅ Đủ điều kiện qua màn!" : "❌ Chưa đủ điều kiện"}
          </div>
          <div style={{ fontSize: 16, opacity: 0.9 }}>
            Cần thu gom ít nhất{" "}
            <span style={{ fontWeight: "bold", color: "#fbbf24" }}>
              {requiredTrash}/{TOTAL_TRASH}
            </span>{" "}
            rác vào kho (≥{REQUIRED_PERCENTAGE}%)
          </div>
          <div style={{ fontSize: 16, marginTop: 8 }}>
            Bạn đã gom vào kho:{" "}
            <span
              style={{
                fontWeight: "bold",
                color: canProceed ? "#22c55e" : "#ef4444",
              }}
            >
              {recycledCount}/{TOTAL_TRASH}
            </span>{" "}
            rác
          </div>
        </div>
      )}

      <button
        onClick={onAction}
        style={{
          padding: "16px 48px",
          fontSize: 24,
          background: isWin
            ? "linear-gradient(135deg, #22c55e, #16a34a)"
            : "linear-gradient(135deg, #ef4444, #dc2626)",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          fontWeight: "bold",
        }}
      >
        {isWin ? "➡️ Sang màn phân loại" : "🔁 Chơi lại"}
      </button>
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */
export function EcoSeaRescueHUD({ game, onComplete }) {
  const navigate = useNavigate();
  const [inventoryCount, setInventoryCount] = useState(0);
  const [recycledCount, setRecycledCount] = useState(0);
  const [hp, setHp] = useState(PLAYER_MAX_HP);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [hudPulse, setHudPulse] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
  const [inventoryFull, setInventoryFull] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);

  // Sync state from the logic layer (EcoSeaRescue.js)
  useEffect(() => {
    setIsMobile(isMobileDevice());
    
    // stage1Game is our EcoSeaRescue instance
    const logic = game?.stage1Game;
    if (!logic) return;

    console.log("[EcoSeaRescueHUD] Wiring HUD callbacks for logic instance:", logic);

    logic.setHudCallbacks({
      setInventoryCount: (count) => {
        setInventoryCount(count);
      },
      setRecycledCount: (count) => {
        setRecycledCount(count);
      },
      setHp: (newHp) => {
        setHp(newHp);
      },
      setTimeLeft: (time) => {
        setTimeLeft(time);
      },
      setCurrentZone,
      setInventoryFull,
      setHudPulse,
      setDamageFlash,
      setScreenShake,
    });

    logic.setEndGameCallback((reason, count) => {
      console.log("[EcoSeaRescueHUD] Game ended:", reason, count);
      setGameOver(true);
      if (reason === "win") setMessage("🎉 Hoàn thành! Đã thu gom hết rác!");
      else if (reason === "timeout")
        setMessage(`⏰ Hết giờ! Đã gom được ${count}/${TOTAL_TRASH} rác vào kho`);
      else setMessage("💀 Va chạm vật cản – Hết mạng!");
    });

    return () => {
      console.log("[EcoSeaRescueHUD] Cleaning up HUD callbacks");
      logic.setHudCallbacks({});
    };
  }, [game, game?.stage1Game]);

  /* ===================== JOYSTICK ===================== */
  const handleJoystick = (e, isStart) => {
    if (!e.touches) return;
    const t = e.touches[0];
    const logic = game?.stage1Game;
    if (!logic) return;

    if (isStart) {
      logic._joyStartX = t.clientX;
      logic._joyStartY = t.clientY;
    } else {
      const x = THREE.MathUtils.clamp((t.clientX - (logic._joyStartX || 0)) / 50, -1, 1);
      const y = THREE.MathUtils.clamp((t.clientY - (logic._joyStartY || 0)) / 50, -1, 1);
      logic.setJoystick(x, y);
    }
  };

  const resetJoystick = () => {
    game?.stage1Game?.resetJoystick();
  };

  const handleGameOverAction = () => {
    const requiredTrash = Math.ceil((REQUIRED_PERCENTAGE / 100) * TOTAL_TRASH);
    if (message.includes("Hoàn thành") || recycledCount >= requiredTrash) {
      onComplete?.();
    } else {
      // Replay is handled by the orchestrator
      game?.restart();
      setGameOver(false);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        pointerEvents: "none", // HUD background transparent to clicks
      }}
    >
      <div style={{ pointerEvents: "auto", width: "100%", height: "100%" }}>
        {damageFlash && <DamageFlash />}
        <ZoneIndicator currentZone={currentZone} />

        <HUD
          hp={hp}
          inventoryCount={inventoryCount}
          inventoryFull={inventoryFull}
          timeLeft={timeLeft}
          recycledCount={recycledCount}
          hudPulse={hudPulse}
        />

        {isMobile && (
          <MobileJoystick
            onTouchStart={(e) => handleJoystick(e, true)}
            onTouchMove={(e) => handleJoystick(e, false)}
            onTouchEnd={resetJoystick}
          />
        )}

        {gameOver && (
          <GameOverScreen
            message={message}
            recycledCount={recycledCount}
            onAction={handleGameOverAction}
          />
        )}
      </div>
    </div>
  );
}
