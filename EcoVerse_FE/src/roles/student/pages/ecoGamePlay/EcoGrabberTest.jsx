import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import EcoGame from "../../features/eco-game/EcoGame";
import EcoGameHUD from "../../features/eco-game/EcoGameHUD";

/**
 * EcoGrabberTest - A dedicated page to test the EcoGrabber game 
 * without needing API/DB setup.
 */
export default function EcoGrabberTest() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function initTest() {
      // Create a mock level config for Grabber
      const mockConfig = {
        id: "test-grabber",
        sessionId: "test-session",
        name: "Test Eco-Grabber",
        difficulty: "medium",
        stage1Game: "grabber",
        scorePerCorrect: 10,
        grabber: {
          gameTime: 120,
          totalTrash: 8,
          requiredPercentage: 50,
        },
        wasteItems: [], // Will use fallback geometric shapes since no models provided
      };

      const game = new EcoGame();
      gameRef.current = game;
      
      await game.init(containerRef.current, mockConfig);
      setGameInstance(game);
    }

    if (containerRef.current) {
      initTest();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 9999 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10000 }}>
        <div style={{ pointerEvents: "auto" }}>
          <EcoGameHUD
            game={gameInstance}
            onBack={() => navigate(-1)}
            levelConfig={gameInstance?.getLevelConfig()}
            onGameResult={async (res) => {
              console.log("Test Game Result:", res);
              return { success: true };
            }}
          />
        </div>
      </div>
    </div>
  );
}
