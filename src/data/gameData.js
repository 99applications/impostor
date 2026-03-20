// Kategori yapıları - metinler i18n'den gelecek
export const CATEGORIES = {
  christmas: {
    id: 'christmas',
    icon: 'gift-outline',
    isPremium: false,
    wordKeys: [
      'words.christmas.santa',
      'words.christmas.reindeer',
      'words.christmas.snowflake',
      'words.christmas.christmasTree',
      'words.christmas.giftBox',
      'words.christmas.stocking',
      'words.christmas.snowman',
      'words.christmas.sleigh',
      'words.christmas.lights',
      'words.christmas.gingerbread',
    ],
    hintKeys: [
      'hints.christmas.hint1',
      'hints.christmas.hint2',
      'hints.christmas.hint3',
    ],
    questionKeys: [
      'questions.christmas.q1',
      'questions.christmas.q2',
      'questions.christmas.q3',
    ],
  },
  food: {
    id: 'food',
    icon: 'fast-food-outline',
    isPremium: false,
    wordKeys: [
      'words.food.pizza',
      'words.food.hamburger',
      'words.food.doner',
      'words.food.lahmacun',
      'words.food.pide',
      'words.food.kofte',
      'words.food.pasta',
      'words.food.sushi',
      'words.food.kebab',
      'words.food.manti',
      'words.food.borek',
      'words.food.baklava',
    ],
    hintKeys: ['hints.food.hint1', 'hints.food.hint2', 'hints.food.hint3'],
    questionKeys: [
      'questions.food.q1',
      'questions.food.q2',
      'questions.food.q3',
    ],
  },
  animals: {
    id: 'animals',
    icon: 'paw-outline',
    isPremium: false,
    wordKeys: [
      'words.animals.lion',
      'words.animals.tiger',
      'words.animals.elephant',
      'words.animals.giraffe',
      'words.animals.penguin',
      'words.animals.kangaroo',
      'words.animals.koala',
      'words.animals.panda',
      'words.animals.wolf',
      'words.animals.bear',
      'words.animals.crocodile',
      'words.animals.dolphin',
    ],
    hintKeys: [
      'hints.animals.hint1',
      'hints.animals.hint2',
      'hints.animals.hint3',
    ],
    questionKeys: [
      'questions.animals.q1',
      'questions.animals.q2',
      'questions.animals.q3',
    ],
  },
  movies: {
    id: 'movies',
    icon: 'film-outline',
    isPremium: true,
    wordKeys: [
      'words.movies.titanic',
      'words.movies.avatar',
      'words.movies.matrix',
      'words.movies.inception',
      'words.movies.interstellar',
      'words.movies.gladiator',
      'words.movies.forrestGump',
      'words.movies.godfather',
      'words.movies.lordOfRings',
      'words.movies.harryPotter',
      'words.movies.starWars',
      'words.movies.jurassicPark',
    ],
    hintKeys: [
      'hints.movies.hint1',
      'hints.movies.hint2',
      'hints.movies.hint3',
    ],
    questionKeys: [
      'questions.movies.q1',
      'questions.movies.q2',
      'questions.movies.q3',
    ],
  },
  sports: {
    id: 'sports',
    icon: 'football-outline',
    isPremium: false,
    wordKeys: [
      'words.sports.football',
      'words.sports.basketball',
      'words.sports.volleyball',
      'words.sports.tennis',
      'words.sports.swimming',
      'words.sports.boxing',
      'words.sports.wrestling',
      'words.sports.athletics',
      'words.sports.cycling',
      'words.sports.skiing',
      'words.sports.golf',
      'words.sports.baseball',
    ],
    hintKeys: [
      'hints.sports.hint1',
      'hints.sports.hint2',
      'hints.sports.hint3',
    ],
    questionKeys: [
      'questions.sports.q1',
      'questions.sports.q2',
      'questions.sports.q3',
    ],
  },
  countries: {
    id: 'countries',
    icon: 'globe-outline',
    isPremium: true,
    wordKeys: [
      'words.countries.turkey',
      'words.countries.germany',
      'words.countries.france',
      'words.countries.italy',
      'words.countries.spain',
      'words.countries.japan',
      'words.countries.brazil',
      'words.countries.mexico',
      'words.countries.egypt',
      'words.countries.india',
      'words.countries.china',
      'words.countries.russia',
    ],
    hintKeys: [
      'hints.countries.hint1',
      'hints.countries.hint2',
      'hints.countries.hint3',
    ],
    questionKeys: [
      'questions.countries.q1',
      'questions.countries.q2',
      'questions.countries.q3',
    ],
  },
  professions: {
    id: 'professions',
    icon: 'briefcase-outline',
    isPremium: true,
    wordKeys: [
      'words.professions.doctor',
      'words.professions.teacher',
      'words.professions.engineer',
      'words.professions.lawyer',
      'words.professions.pilot',
      'words.professions.chef',
      'words.professions.police',
      'words.professions.firefighter',
      'words.professions.nurse',
      'words.professions.architect',
      'words.professions.accountant',
      'words.professions.waiter',
    ],
    hintKeys: [
      'hints.professions.hint1',
      'hints.professions.hint2',
      'hints.professions.hint3',
    ],
    questionKeys: [
      'questions.professions.q1',
      'questions.professions.q2',
      'questions.professions.q3',
    ],
  },
  technology: {
    id: 'technology',
    icon: 'laptop-outline',
    isPremium: true,
    wordKeys: [
      'words.technology.iPhone',
      'words.technology.laptop',
      'words.technology.tablet',
      'words.technology.smartwatch',
      'words.technology.drone',
      'words.technology.robot',
      'words.technology.ai',
      'words.technology.blockchain',
      'words.technology.metaverse',
      'words.technology.instagram',
      'words.technology.tiktok',
      'words.technology.youtube',
    ],
    hintKeys: [
      'hints.technology.hint1',
      'hints.technology.hint2',
      'hints.technology.hint3',
    ],
    questionKeys: [
      'questions.technology.q1',
      'questions.technology.q2',
      'questions.technology.q3',
    ],
  },
};

// Kategori listesini al
export const getCategoryList = () => Object.keys(CATEGORIES);

// Ücretsiz kategorileri al
export const getFreeCategories = () => {
  return Object.keys(CATEGORIES).filter(id => !CATEGORIES[id].isPremium);
};

// Premium kategorileri al
export const getPremiumCategories = () => {
  return Object.keys(CATEGORIES).filter(id => CATEGORIES[id].isPremium);
};

// Oyuncu sayısına göre maksimum sahtekar sayısı
export const getMaxImposters = playerCount => {
  if (playerCount <= 4) return 1;
  if (playerCount <= 6) return 2;
  if (playerCount <= 9) return 3;
  return Math.floor(playerCount / 3);
};

// Rastgele item seç
const getRandomItem = array => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

// Rastgele kelime key'i seç (birden fazla kategoriden)
export const getRandomWordKey = categories => {
  if (!categories || categories.length === 0) return null;

  const randomCategoryId = getRandomItem(categories);
  const category = CATEGORIES[randomCategoryId];

  if (!category || !category.wordKeys) return null;
  return getRandomItem(category.wordKeys);
};

// Rastgele soru key'i seç (birden fazla kategoriden)
export const getRandomQuestionKey = categories => {
  if (!categories || categories.length === 0) return null;

  const randomCategoryId = getRandomItem(categories);
  const category = CATEGORIES[randomCategoryId];

  if (!category || !category.questionKeys) return null;
  return getRandomItem(category.questionKeys);
};

// Rastgele ipucu key'i seç (birden fazla kategoriden)
export const getRandomHintKey = categories => {
  if (!categories || categories.length === 0) return null;

  const randomCategoryId = getRandomItem(categories);
  const category = CATEGORIES[randomCategoryId];

  if (!category || !category.hintKeys) return null;
  return getRandomItem(category.hintKeys);
};

// Kategorinin toplam içerik sayısını al
export const getCategoryContentCount = categoryId => {
  const category = CATEGORIES[categoryId];
  if (!category) return { words: 0, questions: 0 };

  return {
    words: category.wordKeys?.length || 0,
    questions: category.questionKeys?.length || 0,
  };
};

// Seçili kategorilerin toplam içerik sayısını al
export const getTotalContentCount = categoryIds => {
  let totalWords = 0;
  let totalQuestions = 0;

  categoryIds.forEach(categoryId => {
    const count = getCategoryContentCount(categoryId);
    totalWords += count.words;
    totalQuestions += count.questions;
  });

  return { words: totalWords, questions: totalQuestions };
};
