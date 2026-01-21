import React, { createContext, useContext, useReducer } from 'react';
import {
  getRandomWordKey,
  getRandomQuestionKey,
  getRandomHintKey,
} from '../data/gameData';

const GameContext = createContext();

const initialState = {
  // Oyun ayarları
  playerCount: 4,
  imposterCount: 1,
  gameMode: 'word',
  selectedCategory: 'food',
  showCategoryToImposter: false,
  showHintToImposter: false,

  // Oyuncu listesi (isimlerle birlikte)
  players: [],

  // Oyun durumu
  isGameStarted: false,
  currentPlayerIndex: 0,
  currentWordKey: null,
  currentQuestionKey: null,
  currentHintKey: null,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: action.payload };

    case 'SET_IMPOSTER_COUNT':
      return { ...state, imposterCount: action.payload };

    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'TOGGLE_SHOW_CATEGORY':
      return {
        ...state,
        showCategoryToImposter: !state.showCategoryToImposter,
      };

    case 'TOGGLE_SHOW_HINT':
      return { ...state, showHintToImposter: !state.showHintToImposter };

    // YENİ: Oyuncuları ayarla (isimlerle birlikte)
    case 'SET_PLAYERS':
      return {
        ...state,
        players: action.payload,
        playerCount: action.payload.length,
      };

    case 'START_GAME': {
      const {
        playerCount,
        imposterCount,
        gameMode,
        selectedCategory,
        players,
      } = state;

      // Eğer oyuncular ayarlanmamışsa varsayılan oluştur
      let gamePlayers =
        players.length > 0
          ? players.map(p => ({ ...p, isImposter: false }))
          : Array.from({ length: playerCount }, (_, i) => ({
              id: i + 1,
              name: `Oyuncu ${i + 1}`,
              isImposter: false,
            }));

      // Rastgele sahtekarları seç
      const imposterIndices = [];
      while (imposterIndices.length < imposterCount) {
        const randomIndex = Math.floor(Math.random() * gamePlayers.length);
        if (!imposterIndices.includes(randomIndex)) {
          imposterIndices.push(randomIndex);
          gamePlayers[randomIndex].isImposter = true;
        }
      }

      // Kelime veya soru key'i seç
      let currentWordKey = null;
      let currentQuestionKey = null;
      let currentHintKey = null;

      if (gameMode === 'word') {
        currentWordKey = getRandomWordKey(selectedCategory);
        currentHintKey = getRandomHintKey(selectedCategory);
      } else {
        currentQuestionKey = getRandomQuestionKey(selectedCategory);
      }

      return {
        ...state,
        isGameStarted: true,
        currentPlayerIndex: 0,
        players: gamePlayers,
        currentWordKey,
        currentQuestionKey,
        currentHintKey,
      };
    }

    case 'NEXT_PLAYER':
      return {
        ...state,
        currentPlayerIndex: state.currentPlayerIndex + 1,
      };

    case 'RESET_GAME':
      return {
        ...initialState,
        playerCount: state.playerCount,
        imposterCount: state.imposterCount,
        gameMode: state.gameMode,
        selectedCategory: state.selectedCategory,
        showCategoryToImposter: state.showCategoryToImposter,
        showHintToImposter: state.showHintToImposter,
        players: state.players.map(p => ({ ...p, isImposter: false })), // İsimleri koru
      };

    case 'FULL_RESET':
      return initialState;

    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = {
    setPlayerCount: count =>
      dispatch({ type: 'SET_PLAYER_COUNT', payload: count }),
    setImposterCount: count =>
      dispatch({ type: 'SET_IMPOSTER_COUNT', payload: count }),
    setGameMode: mode => dispatch({ type: 'SET_GAME_MODE', payload: mode }),
    setCategory: category =>
      dispatch({ type: 'SET_CATEGORY', payload: category }),
    toggleShowCategory: () => dispatch({ type: 'TOGGLE_SHOW_CATEGORY' }),
    toggleShowHint: () => dispatch({ type: 'TOGGLE_SHOW_HINT' }),
    setPlayers: players => dispatch({ type: 'SET_PLAYERS', payload: players }), // YENİ
    startGame: () => dispatch({ type: 'START_GAME' }),
    nextPlayer: () => dispatch({ type: 'NEXT_PLAYER' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    fullReset: () => dispatch({ type: 'FULL_RESET' }),
  };

  return (
    <GameContext.Provider value={{ state, ...actions }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
