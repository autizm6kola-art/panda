import React, { useEffect, useState } from 'react';

function Task({ task, onSaveAnswer, savedAnswer }) {
  const [answer, setAnswer] = useState(
  typeof savedAnswer === 'string' ? savedAnswer : ''
);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (savedAnswer) {
      setIsSaved(true);
      setAnswer(savedAnswer);
    }
  }, [savedAnswer]);

  const handleChange = (e) => {
    setAnswer(e.target.value);
    setIsSaved(false); // если меняем ответ, он считается несохранённым
  };

  const saveAnswer = () => {
    if (answer.trim() === '') return; // не сохраняем пустой ответ
    onSaveAnswer(task.id, answer);
    setIsSaved(true);
  };

  const inputStyle = {
    backgroundColor: isSaved ? '#c8f7c5' : 'white',
    padding: '5px',
    marginRight: '10px',
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <p style={{fontSize: "20px"}}><strong >{task.id}</strong></p>
      <p style={{fontSize: "18px"}}>{task.text}</p>

      <audio controls src={process.env.PUBLIC_URL + task.audio}></audio>

      <div style={{ marginTop: '10px' }}>
        {isSaved && (
          <div style={{ marginBottom: '5px', fontWeight: 'bold', fontFamily: "arial", color: "green"}}>
            {answer}
          </div>
        )}

        <input
          type="text"
          value={answer}
          onChange={handleChange}
          style={inputStyle}
          placeholder="Введите ответ"
          // Не блокируем input — можно менять ответ
        />
        <button onClick={saveAnswer} disabled={typeof answer === 'string' ? answer.trim() === '' : true} 
                style={{ padding: '6px 10px',
                borderRadius: '18px',
                backgroundColor: '#8c8e919a',
                fontSize: "13px",
                fontWeight: "bold",
                fontFamily: "Arial",
                color: '#ffffffff',
                cursor: 'pointer',
                border: 'none'
                }}>
          Сохранить
        </button>
      </div>
    </div>
  );
}

export default Task;

