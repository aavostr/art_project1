// Загружаем переменные окружения из .env файла
require('dotenv').config();

const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');  // Для обслуживания статических файлов

const app = express();
const port = 3000;

// Создаем подключение к PostgreSQL используя строку подключения из переменной окружения
const client = new Client({
  connectionString: process.env.DATABASE_URL,  // Используем DATABASE_URL из .env
});

// Подключаемся к базе данных
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });

// Используем body-parser для обработки JSON запросов
app.use(bodyParser.json());

// Обслуживаем статические файлы из папки 'public' - рандомный фронт сгенерил
app.use(express.static(path.join(__dirname, 'public')));

// Получить все задачи
app.get('/wishes', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM wishes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error retrieving wishes:', err);
    res.status(500).send('Error retrieving wishes');
  }
});

// Добавить новое желание | сделать заголовок и примечание
app.post('/wishes', async (req, res) => {
  const { title, description } = req.body;

  // Логируем данные для проверки
  console.log('Received data:', { title, description });

  // Проверяем, что title и description не пустые
  if (!title || !description) {
    return res.status(400).send('Title and description are required');
  }

  try {
    const result = await client.query(
      'INSERT INTO wishes (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding wish:', err);  // Подробный вывод ошибки
    res.status(500).send('Error adding wish');
  }
});

// Обновить желание (пометить как выполненное)
app.put('/wishes/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const result = await client.query(
      'UPDATE wishes SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).send('Wish not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating wish:', err);
    res.status(500).send('Error updating wish');
  }
});

// Удалить желание
app.delete('/wishes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('DELETE FROM wishes WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Wish not found');
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting wish:', err);
    res.status(500).send('Error deleting wish');
  }
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});