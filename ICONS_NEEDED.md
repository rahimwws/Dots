# Icons Needed for Task Categories

This document lists all SF Symbols icons used in the TodayTasksOverview component for different task categories.

## Category Icons

### 1. **Today Tasks** (default)
- **SF Symbol**: `checkmark.circle`
- **Usage**: Regular daily tasks
- **Description**: A circle with a checkmark inside
- **Weight**: medium
- **Size**: 20pt
- **Color**: #1F1F1F

### 2. **Workout Tasks**
- **SF Symbol**: `figure.run`
- **Usage**: Exercise and fitness related tasks
- **Description**: Running person figure
- **Weight**: medium
- **Size**: 20pt
- **Color**: #1F1F1F

### 3. **Shadow Work Tasks**
- **SF Symbol**: `moon.stars`
- **Usage**: Self-reflection, journaling, mental health tasks
- **Description**: Moon with stars
- **Weight**: medium
- **Size**: 20pt
- **Color**: #1F1F1F

## Alternative Icons (Optional Suggestions)

If you want to change the icons, here are some alternatives:

### Today Tasks Alternatives:
- `star.circle`
- `app.badge.checkmark`
- `circle.grid.cross`
- `square.and.pencil`

### Workout Alternatives:
- `figure.walk`
- `heart.fill`
- `flame.fill`
- `dumbbell.fill`

### Shadow Work Alternatives:
- `brain.head.profile`
- `leaf.fill`
- `sparkles`
- `heart.text.square`

## How to Add New Categories

To add a new category, update the `CATEGORY_CONFIG` object in `TodayTasksOverview.tsx`:

```typescript
const CATEGORY_CONFIG: Record<TaskCategory, CategoryConfig> = {
  // ... existing categories
  newCategory: {
    icon: "sf.symbol.name", // SF Symbol name
    label: "Category Name",
  },
};
```

## Icon Resources

- Browse all SF Symbols: [SF Symbols App](https://developer.apple.com/sf-symbols/)
- expo-symbols documentation: [Expo Symbols](https://docs.expo.dev/versions/latest/sdk/symbols/)
