-- Таблица пользователей (users)
-- PK: id   Связи: 1:M с posts, 1:M с comments
CREATE TABLE IF NOT EXISTS users (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    username   TEXT     UNIQUE NOT NULL,
    password   TEXT     NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица постов (posts)
-- PK: id   FK: user_id → users(id)   Связь: M:1 с users, 1:M с comments
CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    title      TEXT     NOT NULL,
    content    TEXT     NOT NULL,
    user_id    INTEGER  NOT NULL,
    username   TEXT     NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица комментариев (comments)
-- PK: id   FK: post_id → posts(id), user_id → users(id)   Связь: M:1 с posts и users
CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER  PRIMARY KEY AUTOINCREMENT,
    post_id    INTEGER  NOT NULL,
    user_id    INTEGER  NOT NULL,
    username   TEXT     NOT NULL,
    content    TEXT     NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Пользователи
INSERT INTO users (username, password) VALUES
    ('alice',   '$2b$10$examplehash1'),
    ('bob',     '$2b$10$examplehash2'),
    ('charlie', '$2b$10$examplehash3');

-- Посты
INSERT INTO posts (title, content, user_id, username) VALUES
    ('Привет всем!',      'Первый пост на форуме.',          1, 'alice'),
    ('Вопрос по SQL',     'Как написать JOIN правильно?',    2, 'bob'),
    ('Лучшие практики',   'Делюсь опытом работы с SQLite.',  1, 'alice'),
    ('Тема про React',    'React или Vue — что выбрать?',    3, 'charlie');

-- Комментарии
INSERT INTO comments (post_id, user_id, username, content) VALUES
    (1, 2, 'bob',     'Добро пожаловать!'),
    (1, 3, 'charlie', 'Привет, alice!'),
    (2, 1, 'alice',   'Смотри документацию на sql-tutorial.ru'),
    (2, 3, 'charlie', 'JOIN — это просто!'),
    (3, 2, 'bob',     'Спасибо за полезный пост.');


-- Запрос 1: SELECT с условием WHERE
-- Получить все посты пользователя alice
SELECT p.id, p.title, p.content, p.created_at
FROM posts p
WHERE p.username = 'alice';

-- Запрос 2: INSERT
-- Добавить нового пользователя
INSERT INTO users (username, password)
VALUES ('dave', '$2b$10$examplehash4');

-- Запрос 3: UPDATE
-- Обновить содержимое поста с id = 2
UPDATE posts
SET content = 'JOIN объединяет строки из двух таблиц по общему полю.'
WHERE id = 2;

-- Запрос 4: DELETE
-- Удалить комментарий с id = 5
DELETE FROM comments
WHERE id = 5;

-- Запрос 5: SELECT с JOIN
-- Получить все посты вместе с количеством комментариев к каждому
SELECT
    p.id          AS post_id,
    p.title,
    p.username    AS author,
    COUNT(c.id)   AS comment_count
FROM posts p
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id, p.title, p.username
ORDER BY comment_count DESC;

-- Дополнительный запрос: SELECT с JOIN (полный список комментариев с данными поста)
SELECT
    c.id          AS comment_id,
    p.title       AS post_title,
    c.username    AS commenter,
    c.content,
    c.created_at
FROM comments c
INNER JOIN posts p ON p.id = c.post_id
ORDER BY c.created_at;
