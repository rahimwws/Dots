# SelectableText Component (Zeego Edition)

Нативный iOS/Android контекстное меню с использованием [Zeego](https://github.com/nandorojo/zeego) - библиотеки для создания красивых нативных меню.

## 🎉 Возможности

- ✅ **Native iOS UIContextMenu** — настоящее iOS меню (не эмуляция!)
- ✅ **Native Android Menu** — нативное Android меню
- ✅ **Long Press** — зажмите текст для открытия меню
- ✅ **Preview** — iOS-стиль превью с blur эффектом
- ✅ **Haptic Feedback** — тактильная отдача при взаимодействии
- ✅ **Regenerate** — генерация нового мотивационного текста
- ✅ **Copy** — копирование текста в буфер обмена
- ✅ **Share** — поделиться текстом (опционально)
- ✅ **SF Symbols** — нативные iOS иконки
- ✅ **Кросс-платформенность** — работает на iOS, Android, Web

## 📦 Установка

```bash
bun install
# или
npm install
```

Пакеты будут установлены автоматически:

- `zeego` — для нативных меню
- `expo-clipboard` — для копирования текста
- `expo-haptics` — для тактильной отдачи

### Для Expo

Если используете Expo, выполните prebuild:

```bash
expo prebuild --clean
```

## 🚀 Использование

```tsx
import { SelectableText } from "@/shared/ui/SelectableText";

<SelectableText
  text="The magic you've been looking for is in the work you're avoiding."
  style={{
    fontFamily: "is-r",
    fontSize: 32,
    textAlign: "center",
    color: "#000",
  }}
  onRegenerate={() => {
    console.log("Quote regenerated!");
  }}
/>;
```

## Props

| Prop           | Type         | Обязательный | Описание                |
| -------------- | ------------ | ------------ | ----------------------- |
| `text`         | `string`     | ✅           | Текст для отображения   |
| `style`        | `TextStyle`  | ❌           | Стили текста            |
| `onRegenerate` | `() => void` | ❌           | Callback при regenerate |

## 🎨 Как работает

### iOS

1. **Long Press** — пользователь зажимает текст
2. **Preview** — появляется превью текста с blur эффектом фона
3. **Menu** — показывается нативное iOS контекстное меню с:
   - 🔄 **Regenerate** (SF Symbol: arrow.clockwise)
   - 📋 **Copy** (SF Symbol: doc.on.doc)
   - 📤 **Share** (SF Symbol: square.and.arrow.up)

### Android

- Нативное Android меню с теми же опциями
- Material Design иконки

### Web

- Radix UI Context Menu (кросс-браузерная совместимость)

## 🎯 Преимущества Zeego

По сравнению с кастомным решением:

✅ **Настоящие нативные меню** — не эмуляция, а реальные UIContextMenu (iOS) и PopupMenu (Android)

✅ **Меньше кода** — Zeego берет на себя всю сложность

✅ **Лучшая производительность** — нативные компоненты работают быстрее

✅ **Автоматический blur** — iOS автоматически размывает фон

✅ **Поддержка SF Symbols** — доступ ко всем iOS иконкам

✅ **Accessibility** — встроенная поддержка VoiceOver/TalkBack

✅ **Web-совместимость** — использует Radix UI на вебе

## 📝 Кастомизация

### Добавление своих текстов

Отредактируйте массив `motivationalQuotes` в `SelectableTextZeego.tsx`:

```tsx
const motivationalQuotes = [
  "Ваш текст 1",
  "Ваш текст 2",
  // ...
];
```

### Добавление своих пунктов меню

```tsx
<ContextMenu.Item
  key="custom"
  onSelect={() => {
    // Ваш код
  }}
>
  <ContextMenu.ItemIcon
    ios={{
      name: "star.fill", // SF Symbol
      pointSize: 18,
    }}
  />
  <ContextMenu.ItemTitle>Custom Action</ContextMenu.ItemTitle>
</ContextMenu.Item>
```

### SF Symbols

Найдите иконки в [SF Symbols App](https://developer.apple.com/sf-symbols/) (бесплатно для macOS).

Популярные символы:

- `arrow.clockwise` — обновить
- `doc.on.doc` — копировать
- `square.and.arrow.up` — поделиться
- `star.fill` — избранное
- `heart.fill` — лайк
- `bookmark.fill` — закладка
- `trash` — удалить

## 🔥 Продвинутые возможности

### Submenu (вложенное меню)

```tsx
<ContextMenu.Sub>
  <ContextMenu.SubTrigger key="more">
    <ContextMenu.ItemTitle>More...</ContextMenu.ItemTitle>
  </ContextMenu.SubTrigger>
  <ContextMenu.SubContent>
    <ContextMenu.Item key="option1">
      <ContextMenu.ItemTitle>Option 1</ContextMenu.ItemTitle>
    </ContextMenu.Item>
  </ContextMenu.SubContent>
</ContextMenu.Sub>
```

### Checkbox Item

```tsx
<ContextMenu.CheckboxItem
  key="favorite"
  value={isFavorite ? "on" : "off"}
  onValueChange={(value) => setIsFavorite(value === "on")}
>
  <ContextMenu.ItemIndicator />
  <ContextMenu.ItemTitle>Favorite</ContextMenu.ItemTitle>
</ContextMenu.CheckboxItem>
```

### Destructive Action (красная кнопка)

```tsx
<ContextMenu.Item
  key="delete"
  destructive // iOS: красный цвет
  onSelect={() => {
    // Удалить
  }}
>
  <ContextMenu.ItemIcon ios={{ name: "trash", pointSize: 18 }} />
  <ContextMenu.ItemTitle>Delete</ContextMenu.ItemTitle>
</ContextMenu.Item>
```

## 📱 Платформы

| Платформа | Поддержка | Компонент     |
| --------- | --------- | ------------- |
| iOS       | ✅ Полная | UIContextMenu |
| Android   | ✅ Полная | PopupMenu     |
| Web       | ✅ Полная | Radix UI      |
| macOS     | ✅ Полная | NSMenu        |

## 🐛 Troubleshooting

**Меню не появляется?**

```bash
# Выполните prebuild для Expo
expo prebuild --clean

# Или для bare React Native
cd ios && pod install
```

**Нет иконок на iOS?**

- Проверьте название SF Symbol в [SF Symbols App](https://developer.apple.com/sf-symbols/)
- Убедитесь, что используете правильный формат: `{ name: "icon.name" }`

**Ошибка модуля?**

```bash
# Очистите кеш
rm -rf node_modules
bun install

# Пересоберите
expo prebuild --clean
```

## 📚 Документация Zeego

- [Zeego Docs](https://zeego.dev)
- [GitHub Repository](https://github.com/nandorojo/zeego)
- [Context Menu API](https://zeego.dev/context-menu)

## 🎁 Пример в проекте

Компонент используется в `TasksPage.tsx`:

```tsx
<SelectableText
  text="The magic you've been looking for is in the work you're avoiding."
  style={{
    fontFamily: "is-r",
    fontSize: 32,
    textAlign: "center",
    color: "#000",
    marginBottom: 22,
  }}
  onRegenerate={() => {
    console.log("Quote regenerated!");
  }}
/>
```

---

**Powered by [Zeego](https://zeego.dev)** 🚀
