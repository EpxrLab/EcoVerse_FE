/**
 * EcoGamePage - React wrapper page for the Three.js EcoGame
 *
 * Full-screen page that renders the game canvas and HUD overlay.
 * Reads levelId from URL search params, fetches config from API,
 * and passes it to the game engine.
 *
 * Route: /student/campaign/:campaignId/game/play?levelId=xxx
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import EcoGame from '../../features/eco-game/EcoGame';
import EcoGameHUD from '../../features/eco-game/EcoGameHUD';
import { fetchGameLevelById } from '../../features/eco-game/services/ecoGame.service';

export default function EcoGamePage() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [gameInstance, setGameInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelConfig, setLevelConfig] = useState(null);
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const levelId = searchParams.get('levelId');

  // Fetch level config from API, then initialize game
  useEffect(() => {
    let cancelled = false;

    async function initGame() {
      try {
        setLoading(true);

        // Fetch the level config from API
        const config = await fetchGameLevelById(levelId);
        if (cancelled) return;

        setLevelConfig(config);
        setLoading(false);

        // Wait for next frame so container is rendered
        requestAnimationFrame(() => {
          if (cancelled || !containerRef.current) return;

          const game = new EcoGame();
          game.init(containerRef.current, config);
          gameRef.current = game;
          setGameInstance(game);
        });
      } catch (err) {
        console.error('[EcoGamePage] Failed to load level config:', err);
        if (!cancelled) setLoading(false);
      }
    }

    initGame();

    return () => {
      cancelled = true;
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
    };
  }, [levelId]);

  const handleBack = useCallback(() => {
    navigate(`/student/campaign/${campaignId}/game`);
  }, [navigate, campaignId]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#000',
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111',
            zIndex: 10,
            gap: '16px',
          }}
        >
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#4caf50' }} spin />} />
          <p style={{ color: '#aaa', fontSize: '16px' }}>
            Đang tải level {levelConfig?.name || ''}...
          </p>
        </div>
      )}

      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* HUD Overlay */}
      {!loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <EcoGameHUD
              game={gameInstance}
              onBack={handleBack}
              levelConfig={levelConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}
