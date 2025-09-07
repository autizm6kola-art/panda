import './App.css';
import React, { useState, useEffect } from 'react';

// --- СТАТИКА: визуальный компонент прогресс-бара ---
function ProgressBar({ correct, total }) {
  const percent = total === 0 ? 0 : (correct / total) * 100;

  const containerStyle = {
    width: '100%',
    height: '20px',
    backgroundColor: '#ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '20px',
  };

  const fillerStyle = {
    height: '100%',
    width: `${percent}%`,
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease-in-out',
  };

  return (
    <div style={containerStyle} aria-label={`Прогресс: ${percent.toFixed(0)}%`}>
      <div style={fillerStyle} />
    </div>
  );
}

// --- СТАТИКА: кнопка назад, ссылка ---
function BackButton() {
  return (
    <a href="https://autizm6kola-art.github.io/svet/" className="back-link">
      ← Назад
    </a>
  );
}

function App() {
  // --- СТАТИКА: состояние, базовая логика ---
  const [selectedRange, setSelectedRange] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredTasks, setAnsweredTasks] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [ranges, setRanges] = useState([]);
  const [progressByRange, setProgressByRange] = useState({});
  const [loading, setLoading] = useState(false);

  // --- СТАТИКА: общий прогресс ---
  const [totalCorrect, setTotalCorrect] = useState(0);

  // --- СТАТИКА: ключ для localStorage ---
  const getStorageKey = (range) => `progress_${range.start}_${range.end}`;

  // --- ДИНАМИКА: загрузка и формирование заданий ---
  useEffect(() => {
    setLoading(true);
    fetch(process.env.PUBLIC_URL + '/tasks_for.json')
      .then((res) => res.json())
      .then((data) => {
        setAllTasks(data);
        setLoading(false);

        // --- ДИНАМИКА: формируем диапазоны из данных ---
        const sorted = [...data].sort((a, b) => a.id - b.id);
        const dynamicRanges = [];

        for (let i = 0; i < sorted.length; i += 10) {
          const chunk = sorted.slice(i, i + 10);
          if (chunk.length > 0) {
            dynamicRanges.push({
              start: chunk[0].id,
              end: chunk[chunk.length - 1].id,
            });
          }
        }

        setRanges(dynamicRanges);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке JSON:', err);
        setLoading(false);
      });
  }, []);

  // --- СТАТИКА: загрузка прогресса по диапазонам из localStorage ---
  useEffect(() => {
    const progress = {};

    ranges.forEach((range) => {
      const key = getStorageKey(range);
      const saved = localStorage.getItem(key);
      const totalInRange = allTasks.filter(
        (t) => t.id >= range.start && t.id <= range.end
      ).length;

      if (saved && totalInRange > 0) {
        const parsed = JSON.parse(saved);
        const percent = (parsed.correctCount / totalInRange) * 100;
        progress[key] = percent;
      } else {
        progress[key] = 0;
      }
    });

    setProgressByRange(progress);
  }, [ranges, allTasks]);

  // --- СТАТИКА: подсчет общего количества решённых задач ---
  useEffect(() => {
    if (ranges.length === 0) {
      setTotalCorrect(0);
      return;
    }

    let sum = 0;

    ranges.forEach((range) => {
      const key = getStorageKey(range);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        sum += parsed.correctCount || 0;
      }
    });

    setTotalCorrect(sum);
  }, [ranges]);

  // --- СТАТИКА: загрузка прогресса выбранного диапазона ---
  useEffect(() => {
    if (selectedRange) {
      const key = getStorageKey(selectedRange);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCorrectCount(parsed.correctCount);
        setAnsweredTasks(parsed.answeredTasks);
      } else {
        setCorrectCount(0);
        setAnsweredTasks({});
      }
    }
  }, [selectedRange]);

  // --- СТАТИКА: обработка правильного ответа ---
  const handleCorrectAnswer = (taskId) => {
    if (!answeredTasks[taskId]) {
      const updatedTasks = { ...answeredTasks, [taskId]: true };
      const newCount = correctCount + 1;

      setAnsweredTasks(updatedTasks);
      setCorrectCount(newCount);

      const key = getStorageKey(selectedRange);
      localStorage.setItem(
        key,
        JSON.stringify({
          correctCount: newCount,
          answeredTasks: updatedTasks,
        })
      );
    }
  };

  if (loading) return <div>Загрузка заданий...</div>;

  if (selectedRange) {
    // --- ДИНАМИКА: выборка задач из выбранного диапазона ---
    const tasks = allTasks.filter(
      (t) => t.id >= selectedRange.start && t.id <= selectedRange.end
    );

    return (
      <div
        style={{
          maxWidth: 700,
          margin: 'auto',
          padding: '80px 20px 20px',
          position: 'relative',
        }}
      >
        <BackButton />

        <h1 style={{ margin: '45px 20px 8px 220px' }}>
          Задачи {selectedRange.start}–{selectedRange.end}
        </h1>

        <button
          onClick={() => setSelectedRange(null)}
          className="back-link"
          style={{ top: '77px', position: 'absolute', left: '540px' }}
        >
          ← Назад к выбору
        </button>

        <ProgressBar correct={correctCount} total={tasks.length} />

        <p>
          <strong>
            Правильных ответов: {correctCount} из {tasks.length}
          </strong>
        </p>
        <hr />

        <div className="task-grid">
          {tasks.map((task) => (
            <div className="task-item" key={task.id}>
              {/* --- ДИНАМИКА: отображение отдельной задачи --- */}
              <Task
                task={task}
                onCorrect={handleCorrectAnswer}
                alreadyCorrect={answeredTasks[task.id]}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- СТАТИКА: главная страница (меню выбора диапазонов) ---
  return (
    <div
      style={{
        maxWidth: 600,
        margin: 'auto',
        padding: '60px 20px 20px 20px',
        position: 'relative',
      }}
    >
      <BackButton />

      <h1 style={{ margin: '0 0 10px 230px' }}>ЗАДАЧИ</h1>

      {/* Общий прогресс под заголовком */}
      <div style={{ marginBottom: '30px' }}>
        <ProgressBar correct={totalCorrect} total={allTasks.length} />
        <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
          Решено {totalCorrect} задач из {allTasks.length}
        </p>
      </div>

      {/* --- ДИНАМИКА: кнопки выбора диапазонов --- */}
      {ranges.map((range, index) => {
        const key = getStorageKey(range);
        const progress = progressByRange[key] || 0;

        let buttonClass = 'range-button';
        if (progress === 100) {
          buttonClass += ' completed';
        } else if (progress > 0) {
          buttonClass += ' partial';
        }

        // const label = `${range.start}–${range.end} (${Math.round(progress)}%)`;
        const label = `${range.start}–${range.end}`; // <--- без процентов
        return (
          <button
            key={index}
            onClick={() => setSelectedRange(range)}
            className={buttonClass}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// --- ДИНАМИКА: компонент одной задачи с логикой проверки ---
function Task({ task, onCorrect, alreadyCorrect }) {
  const [answer, setAnswer] = React.useState('');
  const [isCorrect, setIsCorrect] = React.useState(null);

  useEffect(() => {
    if (alreadyCorrect) {
      setIsCorrect(true);
    }
  }, [alreadyCorrect]);

  const handleChange = (e) => {
    setAnswer(e.target.value);
    setIsCorrect(null);
  };

  // --- ДИНАМИКА: проверка правильности ответа ---
  const checkAnswer = () => {
    if (answer.trim().toLowerCase() === task.correctAnswer.toLowerCase()) {
      if (!isCorrect) {
        setIsCorrect(true);
        onCorrect(task.id);
      }
    } else {
      setIsCorrect(false);
    }
  };

  const inputStyle = {
    backgroundColor:
      isCorrect === null ? 'white' : isCorrect ? '#c8f7c5' : '#f7c5c5',
    padding: '5px',
    marginRight: '10px',
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <p>
        <strong>Задача {task.id}</strong>
      </p>
      <p>{task.text}</p>

      <input
        type="text"
        value={answer}
        onChange={handleChange}
        style={inputStyle}
        placeholder="Введите ответ"
        disabled={isCorrect === true}
      />
      <button onClick={checkAnswer} disabled={isCorrect === true}>
        Проверить
      </button>
    </div>
  );
}

export default App;