# Zustand State Management for Dart Tournament Scheduler

This directory contains Zustand stores for managing application state in a more maintainable way.

## Store Structure

### `settingsStore.ts`
Manages tournament configuration settings:
- Number of teams, boards, and groups
- Match duration and start time
- Teams advancing per group
- Active tab and view settings

### `tournamentStore.ts`
Handles tournament data and match operations:
- Tournament creation and generation
- Match management and scoring
- Knockout bracket creation and updating

### `teamsStore.ts` 
Controls team-related state:
- Team names and colors
- Team name editing
- Color generation and assignment

### `dialogStore.ts`
Manages UI dialog state:
- Score entry dialog
- Team name editing dialog

## Usage Example

```tsx
import { useSettingsStore, useTournamentStore } from '../stores';

function MyComponent() {
  // Access settings from the store
  const { numTeams, setNumTeams } = useSettingsStore();
  
  // Access tournament functions
  const { tournament, generateTournament } = useTournamentStore();
  
  return (
    <div>
      <h1>Teams: {numTeams}</h1>
      <button onClick={() => setNumTeams(numTeams + 1)}>Add Team</button>
      <button onClick={generateTournament}>Generate Tournament</button>
    </div>
  );
}
```

## Benefits

1. **Reduced Component Complexity** - Main components no longer need to manage complex state
2. **Persistent State** - All stores use Zustand's persist middleware to save state to localStorage
3. **Improved Type Safety** - TypeScript interfaces ensure proper state access and modification
4. **Better Testing** - Isolated stores are easier to test
5. **Enhanced Developer Experience** - State logic is centralized and easier to understand

## Implementation Notes

To fully migrate the application to use Zustand:

1. Replace useState/useEffect in main components with store hooks
2. Update tab components to use appropriate stores
3. Remove unused state management code from page.tsx
4. Test thoroughly to ensure all functionality works as expected 