# random_anime_pic
Скачивает случайные аниме изображения с nekosapi.com.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

Аргументы командной строки:

| Опция              | Описание                                                   | Возможные значения                              |
|--------------------|------------------------------------------------------------|-------------------------------------------------|
| -t, --total        | Количество изображений для загрузки (default: 100)         | 1                                               |
| -r, --rating       | Рейтинг изображений (default: "safe")                      | safe или suggestive или borderline или explicit |
| -c, --concurrency  | Сколько одновременно загружать изображений (default: 1000) | 1                                               |
| -d, --download-dir | Директория для загрузки (default: "downloads")             | dir                                             |

This project was created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
