import React, { createContext, useContext, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '../data/gameData';

const GameContext = createContext();

const CUSTOM_CATEGORIES_KEY = '@custom_categories';

const getRandomItem = array => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomWordKey = (categories, customCategories = {}) => {
  const randomCategoryId = getRandomItem(categories);

  // Önce custom kategorilerde ara
  if (customCategories[randomCategoryId]) {
    const words = customCategories[randomCategoryId].words || [];
    return words.length > 0
      ? `custom:${randomCategoryId}:${getRandomItem(words)}`
      : null;
  }

  // Sonra normal kategorilerde ara
  const category = CATEGORIES[randomCategoryId];
  if (!category || !category.wordKeys) return null;
  return getRandomItem(category.wordKeys);
};

const getRandomQuestionKey = (categories, customCategories = {}) => {
  const randomCategoryId = getRandomItem(categories);

  if (customCategories[randomCategoryId]) {
    const questions = customCategories[randomCategoryId].questions || [];
    return questions.length > 0
      ? `custom:${randomCategoryId}:${getRandomItem(questions)}`
      : null;
  }

  const category = CATEGORIES[randomCategoryId];
  if (!category || !category.questionKeys) return null;
  return getRandomItem(category.questionKeys);
};

const getRandomHintKey = (categories, customCategories = {}) => {
  const randomCategoryId = getRandomItem(categories);

  if (customCategories[randomCategoryId]) {
    const hints = customCategories[randomCategoryId].hints || [];
    return hints.length > 0
      ? `custom:${randomCategoryId}:${getRandomItem(hints)}`
      : null;
  }

  const category = CATEGORIES[randomCategoryId];
  if (!category || !category.hintKeys) return null;
  return getRandomItem(category.hintKeys);
};

const initialState = {
  playerCount: 4,
  imposterCount: 1,
  gameMode: 'word',
  selectedCategories: ['food'],
  showCategoryToImposter: false,
  showHintToImposter: false,
  gameDuration: 180,
  trollModeEnabled: true, // Trol modu açık/kapalı
  trollModeChance: 7, // %7 ihtimal (5-10 arası)

  // Özel kategoriler
  customCategories: {},

  // Oyuncu listesi
  players: [],

  // Oyun durumu
  isGameStarted: false,
  isTrollRound: false, // Bu tur trol turu mu?
  currentPlayerIndex: 0,
  currentWordKey: null,
  currentQuestionKey: null,
  currentHintKey: null,
  currentCategory: null,
  currentWord: null, // Custom kategoriler için direkt kelime
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_COUNT':
      return { ...state, playerCount: action.payload };

    case 'SET_IMPOSTER_COUNT':
      return { ...state, imposterCount: action.payload };

    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };

    case 'SET_SELECTED_CATEGORIES':
      return { ...state, selectedCategories: action.payload };

    case 'TOGGLE_SHOW_CATEGORY':
      return {
        ...state,
        showCategoryToImposter: !state.showCategoryToImposter,
      };

    case 'TOGGLE_SHOW_HINT':
      return { ...state, showHintToImposter: !state.showHintToImposter };

    case 'SET_GAME_DURATION':
      return { ...state, gameDuration: action.payload };

    case 'TOGGLE_TROLL_MODE':
      return { ...state, trollModeEnabled: !state.trollModeEnabled };

    case 'SET_TROLL_CHANCE':
      return { ...state, trollModeChance: action.payload };

    case 'SET_PLAYERS':
      return {
        ...state,
        players: action.payload,
        playerCount: action.payload.length,
      };

    case 'SET_CUSTOM_CATEGORIES':
      return { ...state, customCategories: action.payload };

    case 'ADD_CUSTOM_CATEGORY': {
      const newCustomCategories = {
        ...state.customCategories,
        [action.payload.id]: action.payload,
      };
      return { ...state, customCategories: newCustomCategories };
    }

    case 'DELETE_CUSTOM_CATEGORY': {
      const { [action.payload]: deleted, ...remainingCategories } =
        state.customCategories;
      // Seçili kategorilerden de kaldır
      const updatedSelectedCategories = state.selectedCategories.filter(
        id => id !== action.payload,
      );
      return {
        ...state,
        customCategories: remainingCategories,
        selectedCategories:
          updatedSelectedCategories.length > 0
            ? updatedSelectedCategories
            : ['food'],
      };
    }

    case 'UPDATE_CUSTOM_CATEGORY': {
      const updatedCustomCategories = {
        ...state.customCategories,
        [action.payload.id]: action.payload,
      };
      return { ...state, customCategories: updatedCustomCategories };
    }

    case 'START_GAME': {
      const {
        playerCount,
        imposterCount,
        gameMode,
        selectedCategories,
        players,
        trollModeEnabled,
        trollModeChance,
        customCategories,
      } = state;

      // Trol modu kontrolü
      const isTrollRound =
        trollModeEnabled && Math.random() * 100 < trollModeChance;

      let gamePlayers =
        players.length > 0
          ? players.map(p => ({ ...p, isImposter: false }))
          : Array.from({ length: playerCount }, (_, i) => ({
              id: i + 1,
              name: `Oyuncu ${i + 1}`,
              isImposter: false,
            }));

      if (isTrollRound) {
        // TROL MODU: Herkes sahtekar!
        gamePlayers = gamePlayers.map(p => ({ ...p, isImposter: true }));
      } else {
        // Normal mod: Rastgele sahtekarları seç
        const imposterIndices = [];
        while (imposterIndices.length < imposterCount) {
          const randomIndex = Math.floor(Math.random() * gamePlayers.length);
          if (!imposterIndices.includes(randomIndex)) {
            imposterIndices.push(randomIndex);
            gamePlayers[randomIndex].isImposter = true;
          }
        }
      }

      const currentCategory = getRandomItem(selectedCategories);

      let currentWordKey = null;
      let currentQuestionKey = null;
      let currentHintKey = null;
      let currentWord = null;

      if (gameMode === 'word') {
        const wordResult = getRandomWordKey(
          selectedCategories,
          customCategories,
        );
        if (wordResult && wordResult.startsWith('custom:')) {
          // Custom kategori kelimesi
          currentWord = wordResult.split(':')[2];
        } else {
          currentWordKey = wordResult;
        }

        const hintResult = getRandomHintKey(
          selectedCategories,
          customCategories,
        );
        if (hintResult && hintResult.startsWith('custom:')) {
          // Custom hint - şimdilik null bırak
          currentHintKey = null;
        } else {
          currentHintKey = hintResult;
        }
      } else {
        const questionResult = getRandomQuestionKey(
          selectedCategories,
          customCategories,
        );
        if (questionResult && questionResult.startsWith('custom:')) {
          currentWord = questionResult.split(':')[2];
        } else {
          currentQuestionKey = questionResult;
        }
      }

      return {
        ...state,
        isGameStarted: true,
        isTrollRound,
        currentPlayerIndex: 0,
        players: gamePlayers,
        currentWordKey,
        currentQuestionKey,
        currentHintKey,
        currentCategory,
        currentWord,
      };
    }

    case 'NEXT_PLAYER':
      return {
        ...state,
        currentPlayerIndex: state.currentPlayerIndex + 1,
      };

    case 'RESET_GAME': {
      const {
        playerCount,
        imposterCount,
        gameMode,
        selectedCategories,
        players,
        showCategoryToImposter,
        showHintToImposter,
        gameDuration,
        trollModeEnabled,
        trollModeChance,
        customCategories,
      } = state;

      // Trol modu kontrolü
      const isTrollRound =
        trollModeEnabled && Math.random() * 100 < trollModeChance;

      let gamePlayers =
        players.length > 0
          ? players.map(p => ({ ...p, isImposter: false }))
          : Array.from({ length: playerCount }, (_, i) => ({
              id: i + 1,
              name: `Oyuncu ${i + 1}`,
              isImposter: false,
            }));

      if (isTrollRound) {
        gamePlayers = gamePlayers.map(p => ({ ...p, isImposter: true }));
      } else {
        const imposterIndices = [];
        while (imposterIndices.length < imposterCount) {
          const randomIndex = Math.floor(Math.random() * gamePlayers.length);
          if (!imposterIndices.includes(randomIndex)) {
            imposterIndices.push(randomIndex);
            gamePlayers[randomIndex].isImposter = true;
          }
        }
      }

      const currentCategory = getRandomItem(selectedCategories);

      let currentWordKey = null;
      let currentQuestionKey = null;
      let currentHintKey = null;
      let currentWord = null;

      if (gameMode === 'word') {
        const wordResult = getRandomWordKey(
          selectedCategories,
          customCategories,
        );
        if (wordResult && wordResult.startsWith('custom:')) {
          currentWord = wordResult.split(':')[2];
        } else {
          currentWordKey = wordResult;
        }

        const hintResult = getRandomHintKey(
          selectedCategories,
          customCategories,
        );
        if (hintResult && !hintResult.startsWith('custom:')) {
          currentHintKey = hintResult;
        }
      } else {
        const questionResult = getRandomQuestionKey(
          selectedCategories,
          customCategories,
        );
        if (questionResult && questionResult.startsWith('custom:')) {
          currentWord = questionResult.split(':')[2];
        } else {
          currentQuestionKey = questionResult;
        }
      }

      return {
        ...initialState,
        playerCount,
        imposterCount,
        gameMode,
        selectedCategories,
        showCategoryToImposter,
        showHintToImposter,
        gameDuration,
        trollModeEnabled,
        trollModeChance,
        customCategories,
        players: gamePlayers,
        isGameStarted: true,
        isTrollRound,
        currentPlayerIndex: 0,
        currentWordKey,
        currentQuestionKey,
        currentHintKey,
        currentCategory,
        currentWord,
      };
    }

    case 'FULL_RESET':
      return {
        ...initialState,
        customCategories: state.customCategories, // Custom kategorileri koru
      };

    default:
      return state;
  }
};

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Custom kategorileri yükle
  React.useEffect(() => {
    loadCustomCategories();
  }, []);

  // Custom kategorileri AsyncStorage'dan yükle
  const loadCustomCategories = async () => {
    try {
      const saved = await AsyncStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (saved) {
        dispatch({ type: 'SET_CUSTOM_CATEGORIES', payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.log('Error loading custom categories:', error);
    }
  };

  // Custom kategorileri kaydet
  const saveCustomCategories = async categories => {
    try {
      await AsyncStorage.setItem(
        CUSTOM_CATEGORIES_KEY,
        JSON.stringify(categories),
      );
    } catch (error) {
      console.log('Error saving custom categories:', error);
    }
  };

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
    setGameDuration: duration =>
      dispatch({ type: 'SET_GAME_DURATION', payload: duration }),
    toggleTrollMode: () => dispatch({ type: 'TOGGLE_TROLL_MODE' }),
    setTrollChance: chance =>
      dispatch({ type: 'SET_TROLL_CHANCE', payload: chance }),
    setPlayers: players => dispatch({ type: 'SET_PLAYERS', payload: players }),

    // Custom kategori işlemleri
    addCustomCategory: async category => {
      dispatch({ type: 'ADD_CUSTOM_CATEGORY', payload: category });
      const newCategories = {
        ...state.customCategories,
        [category.id]: category,
      };
      await saveCustomCategories(newCategories);
    },
    deleteCustomCategory: async categoryId => {
      dispatch({ type: 'DELETE_CUSTOM_CATEGORY', payload: categoryId });
      const { [categoryId]: deleted, ...remaining } = state.customCategories;
      await saveCustomCategories(remaining);
    },
    updateCustomCategory: async category => {
      dispatch({ type: 'UPDATE_CUSTOM_CATEGORY', payload: category });
      const updatedCategories = {
        ...state.customCategories,
        [category.id]: category,
      };
      await saveCustomCategories(updatedCategories);
    },

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
