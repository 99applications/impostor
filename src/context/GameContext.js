import React, { createContext, useContext, useReducer } from 'react';
import { CATEGORIES } from '../data/gameData';

const GameContext = createContext();

// Rastgele seçim yardımcı fonksiyonları
const getRandomItem = array => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomWordKey = categories => {
  // Seçili kategorilerden rastgele birini seç
  const randomCategory = getRandomItem(categories);
  const category = CATEGORIES[randomCategory];
  if (!category || !category.wordKeys) return null;
  return getRandomItem(category.wordKeys);
};

const getRandomQuestionKey = categories => {
  const randomCategory = getRandomItem(categories);
  const category = CATEGORIES[randomCategory];
  if (!category || !category.questionKeys) return null;
  return getRandomItem(category.questionKeys);
};

const getRandomHintKey = categories => {
  const randomCategory = getRandomItem(categories);
  const category = CATEGORIES[randomCategory];
  if (!category || !category.hintKeys) return null;
  return getRandomItem(category.hintKeys);
};

const initialState = {
  // Oyun ayarları
  playerCount: 4,
  imposterCount: 1,
  gameMode: 'word',
  selectedCategories: ['food'], // Çoklu kategori desteği
  showCategoryToImposter: false,
  showHintToImposter: false,

  // Oyuncu listesi
  players: [],

  // Oyun durumu
  isGameStarted: false,
  currentPlayerIndex: 0,
  currentWordKey: null,
  currentQuestionKey: null,
  currentHintKey: null,
  currentCategory: null, // Hangi kategoriden seçildi
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: action.payload };

    case 'SET_IMPOSTER_COUNT':
      return { ...state, imposterCount: action.payload };

    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };

    // Çoklu kategori desteği
    case 'SET_SELECTED_CATEGORIES':
      return { ...state, selectedCategories: action.payload };

    case 'TOGGLE_SHOW_CATEGORY':
      return {
        ...state,
        showCategoryToImposter: !state.showCategoryToImposter,
      };

    case 'TOGGLE_SHOW_HINT':
      return { ...state, showHintToImposter: !state.showHintToImposter };

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
        selectedCategories,
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

      // Rastgele kategori seç (seçililerden)
      const currentCategory = getRandomItem(selectedCategories);

      // Kelime veya soru key'i seç
      let currentWordKey = null;
      let currentQuestionKey = null;
      let currentHintKey = null;

      if (gameMode === 'word') {
        currentWordKey = getRandomWordKey(selectedCategories);
        currentHintKey = getRandomHintKey(selectedCategories);
      } else {
        currentQuestionKey = getRandomQuestionKey(selectedCategories);
      }

      return {
        ...state,
        isGameStarted: true,
        currentPlayerIndex: 0,
        players: gamePlayers,
        currentWordKey,
        currentQuestionKey,
        currentHintKey,
        currentCategory,
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
        selectedCategories: state.selectedCategories,
        showCategoryToImposter: state.showCategoryToImposter,
        showHintToImposter: state.showHintToImposter,
        players: state.players.map(p => ({ ...p, isImposter: false })),
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
    setSelectedCategories: categories =>
      dispatch({ type: 'SET_SELECTED_CATEGORIES', payload: categories }),
    toggleShowCategory: () => dispatch({ type: 'TOGGLE_SHOW_CATEGORY' }),
    toggleShowHint: () => dispatch({ type: 'TOGGLE_SHOW_HINT' }),
    setPlayers: players => dispatch({ type: 'SET_PLAYERS', payload: players }),
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
