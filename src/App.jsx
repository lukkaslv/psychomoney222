import React, { useState, useEffect } from 'react';
import { Brain, Award, Clock, TrendingUp, AlertCircle } from 'lucide-react';

// ============================================
// КОНСТАНТЫ И ДАННЫЕ
// ============================================

const BELIEFS = [
  { id: 'ban', name: 'Запрет иметь много денег', color: 'bg-red-500', emoji: '🚫' },
  { id: 'fear', name: 'Страх иметь много денег', color: 'bg-orange-500', emoji: '😰' },
  { id: 'shame', name: 'Стыдно выделяться', color: 'bg-yellow-500', emoji: '😳' },
  { id: 'guilt', name: 'Чувство вины за желание больше', color: 'bg-purple-500', emoji: '😔' },
  { id: 'corrupt', name: 'Деньги портят людей', color: 'bg-blue-500', emoji: '💰' },
  { id: 'impostor', name: 'Синдром самозванца', color: 'bg-pink-500', emoji: '🎭' }
];

const EMOTIONS = [
  'Тревога', 'Стыд', 'Вина', 'Страх', 'Злость', 'Зависть', 
  'Грусть', 'Растерянность', 'Спокойствие', 'Интерес'
];

// Демо-сценарии (5 из 20 для примера)
const DEMO_SCENARIOS = [
  {
    id: 1,
    text: "Ваш коллега хвастается новой дорогой машиной и спрашивает, что вы думаете.",
    beliefs: ['shame', 'guilt', 'corrupt'],
    reframes: {
      shame: "Каждый имеет право на свои достижения. Радоваться за других не значит предавать свою скромность.",
      guilt: "Успех других не делает ваши желания неправильными. Это не игра с нулевой суммой.",
      corrupt: "Машина - это просто вещь. Характер человека определяют поступки, а не покупки."
    }
  },
  {
    id: 2,
    text: "Клиент просит большую скидку, намекая: 'Вы же и так хорошо зарабатываете'.",
    beliefs: ['guilt', 'shame', 'ban'],
    reframes: {
      guilt: "Называть свою цену - это уважение к своему труду, а не жадность.",
      shame: "Профессионалы имеют право на достойную оплату. Это норма, а не исключение.",
      ban: "Ваши навыки имеют ценность. Получать за них деньги - естественно."
    }
  },
  {
    id: 4,
    text: "Вам предложили повышение с зарплатой вдвое больше. Первая мысль - 'Я не достоин этого'.",
    beliefs: ['impostor', 'ban', 'fear'],
    reframes: {
      impostor: "Если вам предложили - значит видят вашу ценность. Ваша задача не быть идеальным, а расти.",
      ban: "Больше денег = больше возможностей помогать себе и другим. Это ресурс, а не преступление.",
      fear: "Страх изменений нормален. Но новый уровень дохода - это новые возможности учиться."
    }
  },
  {
    id: 7,
    text: "Друзья планируют дорогой отпуск и зовут вас. Вы можете себе позволить, но чувствуете дискомфорт.",
    beliefs: ['shame', 'guilt', 'fear'],
    reframes: {
      shame: "Тратить деньги на качественный отдых - это забота о себе, а не хвастовство.",
      guilt: "У вас есть право наслаждаться плодами своего труда. Это не делает вас плохим человеком.",
      fear: "Страх осуждения реален, но ваше право на отдых не зависит от чужого мнения."
    }
  },
  {
    id: 14,
    text: "Вы успешно завершили год и хотите премировать себя дорогой покупкой. Но голос в голове говорит: 'Рано'.",
    beliefs: ['ban', 'impostor', 'guilt'],
    reframes: {
      ban: "Награждать себя за достижения - здоровая практика. Вы это заработали.",
      impostor: "'Рано' не существует. Если результат есть, признание заслужено.",
      guilt: "Наслаждение плодами труда не делает вас плохим. Это мотивация продолжать."
    }
  }
];

// ============================================
// УТИЛИТЫ ДЛЯ TELEGRAM
// ============================================

const useTelegram = () => {
  const tg = window.Telegram?.WebApp;
  
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  return {
    tg,
    user: tg?.initDataUnsafe?.user,
    isSupported: !!tg
  };
};

// ============================================
// API ФУНКЦИИ (пока моки, потом заменим на реальные)
// ============================================

const API = {
  async saveSession(userId, sessionData) {
    // TODO: заменить на реальный API вызов
    const key = `user_${userId}_sessions`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(sessionData);
    localStorage.setItem(key, JSON.stringify(existing));
    return { success: true };
  },

  async getProgress(userId) {
    // TODO: заменить на реальный API вызов
    const key = `user_${userId}_sessions`;
    const sessions = JSON.parse(localStorage.getItem(key) || '[]');
    return { sessions };
  },

  async getDailyScenarios(userId) {
    // TODO: добавить логику смены сценариев каждый день
    return DEMO_SCENARIOS;
  }
};

// ============================================
// КОМПОНЕНТЫ
// ============================================

const TelegramTheme = ({ children }) => {
  const { tg } = useTelegram();
  const bgColor = tg?.themeParams?.bg_color || '#ffffff';
  const textColor = tg?.themeParams?.text_color || '#000000';
  
  return (
    <div style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh' }}>
      {children}
    </div>
  );
};

const ScenarioCard = ({ scenario, onSubmit }) => {
  const [thought, setThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [selectedBelief, setSelectedBelief] = useState(null);
  
  const isValid = thought.trim().length >= 20 && emotion && selectedBelief;
  const thoughtLength = thought.trim().length;

  return (
    <div className="p-4 space-y-4">
      {/* Сценарий */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
        <p className="text-gray-800 leading-relaxed">{scenario.text}</p>
      </div>

      {/* Автоматическая мысль */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Что первым пришло в голову? (автоматическая мысль)
        </label>
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
          rows="3"
          placeholder="Например: 'Я никогда не смогу себе это позволить...'"
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">Минимум 20 символов для осознанности</span>
          <span className={`text-xs font-semibold ${thoughtLength >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
            {thoughtLength} / 20
          </span>
        </div>
      </div>

      {/* Эмоции */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Что вы чувствуете?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {EMOTIONS.map(em => (
            <button
              key={em}
              onClick={() => setEmotion(em)}
              className={`px-3 py-2 rounded-lg border-2 transition text-sm ${
                emotion === em 
                  ? 'bg-indigo-500 text-white border-indigo-500' 
                  : 'bg-white border-gray-300 hover:border-indigo-300'
              }`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Убеждения */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Какое убеждение за этим стоит?
        </label>
        <div className="space-y-2">
          {BELIEFS.filter(b => scenario.beliefs.includes(b.id)).map(belief => (
            <button
              key={belief.id}
              onClick={() => setSelectedBelief(belief.id)}
              className={`w-full px-3 py-2 rounded-lg border-2 transition text-left flex items-center text-sm ${
                selectedBelief === belief.id
                  ? 'bg-indigo-50 border-indigo-500'
                  : 'bg-white border-gray-300 hover:border-indigo-300'
              }`}
            >
              <span className="mr-2">{belief.emoji}</span>
              {belief.name}
            </button>
          ))}
        </div>
      </div>

      {/* Кнопка отправки */}
      <button
        onClick={() => onSubmit({ thought, emotion, belief: selectedBelief })}
        disabled={!isValid}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {!isValid && thoughtLength > 0 && thoughtLength < 20
          ? `Ещё ${20 - thoughtLength} символов`
          : 'Получить инсайт'}
      </button>
    </div>
  );
};

const ReflectionTimer = ({ onComplete }) => {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [seconds, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Clock className="w-16 h-16 text-purple-600 mb-6 animate-pulse" />
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Момент рефлексии</h2>
      <p className="text-gray-600 mb-8 text-center">
        Подумайте о том, что вы только что записали.<br/>
        Откуда эта реакция? Когда вы её впервые почувствовали?
      </p>
      
      <div className="bg-indigo-50 rounded-full w-32 h-32 flex items-center justify-center mb-6">
        <span className="text-5xl font-bold text-indigo-600">{seconds}</span>
      </div>
      
      <p className="text-sm text-gray-500">
        Инсайт появится через {seconds} секунд...
      </p>
    </div>
  );
};

const ReframeView = ({ scenario, selectedBelief, onNext }) => {
  const belief = BELIEFS.find(b => b.id === selectedBelief);
  const reframe = scenario.reframes[selectedBelief];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-green-100 rounded-full p-4 mr-4">
          <Award className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">+10 монет!</h2>
          <p className="text-gray-600">Отличная работа с осознанностью</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-700 mb-2">Вы обнаружили:</h3>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{belief.emoji}</span>
          <span className="text-lg text-gray-800">{belief.name}</span>
        </div>
      </div>

      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-900 mb-3">Альтернативная перспектива:</h3>
        <p className="text-gray-700 leading-relaxed">{reframe}</p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Продолжить
      </button>
    </div>
  );
};

const ProgressView = ({ sessions, onNewDay }) => {
  const stats = BELIEFS.reduce((acc, belief) => {
    acc[belief.id] = sessions.filter(s => s.belief === belief.id).length;
    return acc;
  }, {});

  const totalCoins = sessions.length * 10;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Ваш прогресс</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4">
          <Award className="w-6 h-6 text-indigo-600 mb-2" />
          <p className="text-2xl font-bold text-indigo-600">{totalCoins}</p>
          <p className="text-sm text-gray-600">Монет собрано</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-green-600">{sessions.length}</p>
          <p className="text-sm text-gray-600">Всего сессий</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ваши паттерны убеждений</h3>
        <div className="space-y-3">
          {BELIEFS.map(belief => {
            const count = stats[belief.id] || 0;
            const percentage = sessions.length > 0 ? (count / sessions.length) * 100 : 0;
            
            return (
              <div key={belief.id}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <span className="mr-2">{belief.emoji}</span>
                    <span className="text-sm font-medium text-gray-700">{belief.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{count} раз</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${belief.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNewDay}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        Начать новый день
      </button>
    </div>
  );
};

// ============================================
// ГЛАВНОЕ ПРИЛОЖЕНИЕ
// ============================================

export default function MoneyMindsetApp() {
  const { user, isSupported } = useTelegram();
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [view, setView] = useState('loading'); // loading, game, reflection, reframe, progress
  const [sessions, setSessions] = useState([]);
  const [currentResponse, setCurrentResponse] = useState(null);

  useEffect(() => {
    initApp();
  }, [user]);

  const initApp = async () => {
    if (!user) {
      setView('error');
      return;
    }

    try {
      const dailyScenarios = await API.getDailyScenarios(user.id);
      const progress = await API.getProgress(user.id);
      
      setScenarios(dailyScenarios);
      setSessions(progress.sessions || []);
      setView('game');
    } catch (error) {
      console.error('Init error:', error);
      setView('error');
    }
  };

  const handleSubmitScenario = async (response) => {
    setCurrentResponse(response);
    setView('reflection');
  };

  const handleReflectionComplete = () => {
    setView('reframe');
  };

  const handleNextScenario = async () => {
    const sessionData = {
      scenarioId: scenarios[currentIndex].id,
      ...currentResponse,
      timestamp: new Date().toISOString()
    };

    await API.saveSession(user.id, sessionData);
    setSessions([...sessions, sessionData]);

    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentResponse(null);
      setView('game');
    } else {
      setView('progress');
    }
  };

  const handleNewDay = () => {
    setCurrentIndex(0);
    setCurrentResponse(null);
    setView('game');
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-red-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ошибка</h2>
          <p className="text-gray-600">Это приложение работает только в Telegram</p>
        </div>
      </div>
    );
  }

  if (view === 'loading') {
    return (
      <TelegramTheme>
        <div className="flex items-center justify-center min-h-screen">
          <Brain className="w-16 h-16 text-indigo-600 animate-pulse" />
        </div>
      </TelegramTheme>
    );
  }

  if (view === 'error') {
    return (
      <TelegramTheme>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Ошибка загрузки</h2>
            <p className="text-gray-600">Попробуйте перезапустить приложение</p>
          </div>
        </div>
      </TelegramTheme>
    );
  }

  return (
    <TelegramTheme>
      <div className="max-w-2xl mx-auto">
        {/* Шапка */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-6 h-6 text-indigo-600 mr-2" />
              <h1 className="text-lg font-bold text-gray-800">Money Mindset</h1>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-semibold text-gray-700">{sessions.length * 10}</span>
            </div>
          </div>
          {view === 'game' && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Сценарий {currentIndex + 1} из {scenarios.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Контент */}
        {view === 'game' && scenarios[currentIndex] && (
          <ScenarioCard 
            scenario={scenarios[currentIndex]} 
            onSubmit={handleSubmitScenario}
          />
        )}

        {view === 'reflection' && (
          <ReflectionTimer onComplete={handleReflectionComplete} />
        )}

        {view === 'reframe' && (
          <ReframeView 
            scenario={scenarios[currentIndex]}
            selectedBelief={currentResponse.belief}
            onNext={handleNextScenario}
          />
        )}

        {view === 'progress' && (
          <ProgressView 
            sessions={sessions}
            onNewDay={handleNewDay}
          />
        )}
      </div>
    </TelegramTheme>
  );
}
