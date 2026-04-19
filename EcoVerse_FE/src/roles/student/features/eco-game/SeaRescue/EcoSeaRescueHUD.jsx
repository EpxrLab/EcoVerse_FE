import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";
import {
  PLAYER_CAPACITY,
  isMobileDevice,
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
          ? "linear-gradient(135deg, #FFEB3B, #CDDC39)" // Yellow/Lime for speed
          : "linear-gradient(135deg, #616161, #424242)", // Dark gray for storm/slow
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
  maxHp,
  inventoryCount,
  inventoryFull,
  timeLeft,
  recycledCount,
  totalTrash,
  hudPulse,
}) {
  const progressPercent = (recycledCount / (totalTrash || 12)) * 100;

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
          : "rgba(139, 195, 74, 0.9)", // leaf green (#8BC34A) with opacity
        color: "white",
        padding: "16px 32px",
        borderRadius: 20,
        boxShadow: inventoryFull
          ? "0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)"
          : "0 8px 32px rgba(0,0,0,0.3)",
        border: inventoryFull
          ? "3px solid rgba(255,100,100,0.9)"
          : "3px solid rgba(255,255,255,0.4)",
        backdropFilter: "blur(10px)",
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
          ❤️ {hp}/{maxHp || 5}
        </div>
        <div style={{ color: inventoryFull ? "#fca5a5" : "white" }}>
          {inventoryFull ? "🎒❌" : "🎒"} {inventoryCount}/
          {PLAYER_CAPACITY || 5}
          {inventoryFull && (
            <span style={{ fontSize: 12, marginLeft: 4 }}>ĐẦY!</span>
          )}
        </div>
        <div>⏱️ {timeLeft || 0}s</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 14, marginBottom: 6, opacity: 0.9 }}>
          🗑️ Đã gom vào kho: {recycledCount}/{totalTrash}
        </div>
        <div
          style={{
            width: "100%",
            height: 24,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 12,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #d9f99d, #bef264, #a3e635)",
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

// Removed GameOverScreen as per request

/* ===================== MAIN COMPONENT ===================== */
export function EcoSeaRescueHUD({ game, levelConfig, onComplete }) {
  const navigate = useNavigate();
  const [inventoryCount, setInventoryCount] = useState(0);
  const [recycledCount, setRecycledCount] = useState(0);
  const [hp, setHp] = useState(levelConfig?.searescue?.maxHp);
  const [timeLeft, setTimeLeft] = useState(levelConfig?.searescue?.gameTime);
  const totalTrash = levelConfig?.searescue?.totalTrash;
  const requiredPercentage = levelConfig?.searescue?.requiredPercentage;
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

    console.log(
      "[EcoSeaRescueHUD] Wiring HUD callbacks for logic instance:",
      logic,
    );

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
      // Wait for orchestrator EcoGame to handle transitions and ResultScreen
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
      const x = THREE.MathUtils.clamp(
        (t.clientX - (logic._joyStartX || 0)) / 50,
        -1,
        1,
      );
      const y = THREE.MathUtils.clamp(
        (t.clientY - (logic._joyStartY || 0)) / 50,
        -1,
        1,
      );
      logic.setJoystick(x, y);
    }
  };

  const resetJoystick = () => {
    game?.stage1Game?.resetJoystick();
  };

  // Action functions removed as GameOverScreen was unified

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
          maxHp={levelConfig?.searescue?.maxHp}
          inventoryCount={inventoryCount}
          inventoryFull={inventoryFull}
          timeLeft={timeLeft}
          recycledCount={recycledCount}
          totalTrash={totalTrash}
          hudPulse={hudPulse}
        />

        {isMobile && (
          <MobileJoystick
            onTouchStart={(e) => handleJoystick(e, true)}
            onTouchMove={(e) => handleJoystick(e, false)}
            onTouchEnd={resetJoystick}
          />
        )}
      </div>
    </div>
  );
}
