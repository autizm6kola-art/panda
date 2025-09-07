const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'tasks.txt'); // Имя твоего txt файла
const outputFile = path.join(__dirname, 'tasks_for.json'); // Имя итогового JSON

fs.readFile(inputFile, 'utf8', (err, data) => {
  if (err) {
    console.error('Ошибка чтения файла:', err);
    return;
  }

  const lines = data.split('\n').filter(line => line.trim() !== '');

  const tasks = [];
  const errors = [];

  lines.forEach((line, index) => {
    const parts = line.split('|').map(part => part.trim());

    if (parts.length !== 3) {
      errors.push({ line: index + 1, text: line });
      return; // пропускаем эту строку
    }

    const id = Number(parts[0]);
    if (isNaN(id)) {
      errors.push({ line: index + 1, text: line });
      return; // пропускаем эту строку
    }

    tasks.push({
      id,
      audio: parts[1],
      text: parts[2],
    });
  });

  fs.writeFile(outputFile, JSON.stringify(tasks, null, 2), err => {
    if (err) {
      console.error('Ошибка записи JSON:', err);
    } else {
      console.log('JSON файл успешно создан:', outputFile);
      if (errors.length > 0) {
        console.warn(`Обнаружены ошибки в ${errors.length} строках:`);
        errors.forEach(e => {
          console.warn(`  Строка ${e.line}: ${e.text}`);
        });
      }
    }
  });
});
