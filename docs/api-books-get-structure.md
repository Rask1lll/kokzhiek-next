# GET /api/v1/books/:id — структура ответа

Эндпоинт уже используется на фронте (страница книги, печать, хедер главы). Ниже — ожидаемая структура `response.data` (объект книги).

## Типы (фронт)

```ts
// app/types/chapter.ts
type Chapter = {
  id: number;
  title: string;
  order: number;
  section_id?: number | null;  // у глав в разделе = id раздела; у standalone = null
};

type Section = {
  id: number;
  title: string;
  order: number;
  chapters: Chapter[];  // только главы этого раздела, отсортированы по order
};

// app/types/book.ts — поля книги
type Book = {
  id: number;
  title: string;
  language: string;
  status?: BookStatus;
  // ... остальные поля книги ...
  sections?: Section[];
  chapters?: Chapter[];  // только главы БЕЗ раздела (section_id === null)
};
```

## Формат ответа

Ответ API: `{ success: true, data: Book }` (или аналог). Важно содержимое `data`:

| Поле        | Тип        | Описание |
|------------|------------|----------|
| `data`     | `Book`     | Объект книги (id, title, language, status, subject, grade, description, cover_image_url, settings, publication, created_at, updated_at, created_by, updated_by, collaborators и т.д.) |
| `data.sections` | `Section[]` | Разделы книги. Каждый раздел содержит вложенный массив глав. |
| `data.chapters` | `Chapter[]` | Главы **без раздела** (standalone). У каждой `section_id === null` или поле отсутствует. |

### Структура раздела (Section)

- `id` — id раздела  
- `title` — название  
- `order` — порядок раздела в книге  
- `chapters` — массив глав **этого** раздела (у каждой главы `section_id === id` этого раздела). Порядок по полю `order` внутри массива.

### Структура главы (Chapter)

- `id`, `title`, `order` — обязательно  
- `section_id` — у глав из `sections[].chapters` равен `id` раздела; у глав из `data.chapters` — `null` или отсутствует.

## Как это используется на фронте

1. **BookPageClient** (страница книги):  
   `setSections(res.data?.sections ?? [])`, `setChapters(res.data?.chapters ?? [])`, `setBook(res.data)`.

2. **ChaptersContainer**:  
   Рисует сначала разделы (каждый со своими `section.chapters`), затем отдельно список `chapters` из стора (standalone). Перетаскивание и реордер опираются на то, что «главы в разделах» лежат в `sections[].chapters`, а «главные главы» — в `chapters`.

3. **Печать** (BookPrintClient):  
   Берёт `book.chapters` как плоский список глав для печати; при необходимости порядок «разделы + standalone» собирается из `sections` и `chapters`.

4. **Стор** (chaptersStore):  
   `setSections` ожидает массив с вложенными `chapters` в каждом разделе; `setChapters` — плоский массив standalone-глав. Сортировка по `order` делается на фронте, но бэкенду лучше отдавать уже в нужном порядке.

## Итог для бэкенда

- `GET /api/v1/books/:id` должен возвращать в `data`:
  - все поля книги;
  - `data.sections` — массив разделов, у каждого раздел `chapters: Chapter[]` (только главы с `section_id === section.id`), отсортированные по `order`;
  - `data.chapters` — массив глав с `section_id === null` (без раздела), отсортированные по `order`.

Если бэк уже отдаёт такую структуру — дополнительных изменений не нужно. Если отдаётся один плоский список глав — нужно на бэке собирать `sections[].chapters` и отдельно список standalone в `chapters`.
