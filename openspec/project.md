# Project Context

## Purpose
This is an Electron React Boilerplate project - a foundation for building scalable cross-platform desktop applications using web technologies. It provides a production-ready setup for developing desktop apps that run on macOS, Windows, and Linux while leveraging modern web development practices.

## Tech Stack
- **Electron** (v35.0.2) - Desktop application framework
- **React** (v19.0.0) - UI library with React Router v7 for navigation
- **TypeScript** (v5.8.2) - Primary development language with strict mode enabled
- **Webpack** (v5.98.0) - Module bundler with separate configs for main/renderer processes
- **TailwindCSS** (v4.0+) - Atomic CSS framework with CSS-first configuration
- **shadcn/ui** (v2025+) - Component library with New York style
- **Sass** - CSS preprocessing support
- **Jest** - Testing framework with React Testing Library
- **ESLint + Prettier** - Code linting and formatting
- **React Refresh** - Hot module replacement for development

### Additional Dependencies for Desktop Assistant
- **TailwindCSS v4.0**: `tailwindcss @tailwindcss/postcss postcss postcss-loader`
- **shadcn/ui core**: `class-variance-authority clsx tailwind-merge lucide-react tw-animate-css`
- **Radix UI components**: `cmdk @radix-ui/react-dialog` (auto-installed via CLI)

## Project Conventions

### Code Style
- **ESLint**: Uses 'erb' (Electron React Boilerplate) configuration with TypeScript support
- **Prettier**: Single quotes enabled, with JSON parser for config files
- **TypeScript**: Strict mode enabled, targeting ES2022 with Node16 modules
- **File naming**: camelCase for files, PascalCase for React components
- **Imports**: No file extensions required, webpack resolves automatically

### Architecture Patterns
- **Two-process architecture**: Main process (Electron) and renderer process (React)
- **Preload scripts**: Secure communication between main and renderer
- **Code splitting**: Separate webpack configs for development and production
- **DLL bundling**: Faster development builds through dynamic linked libraries
- **IPC communication**: Electron's inter-process communication for main-renderer data exchange
- **Plugin system**: Extensible architecture for desktop assistant features
- **Path aliases**: `@/*` mapped to `src/*` for cleaner imports

### Testing Strategy
- **Framework**: Jest with jsdom environment for DOM testing
- **Tools**: React Testing Library for component testing
- **Coverage**: TypeScript files transformed via ts-jest
- **Mocking**: File mocks for assets (images, styles) configured
- **Test location**: `src/__tests__/` directory

### Git Workflow
- **Main branch**: 'main' as primary development branch
- **Commits**: Follow conventional commit patterns (implied from boilerplate)
- **Pre-commit**: ESLint checks via postinstall hooks
- **Branch protection**: Standard GitHub flow (based on repository configuration)

### Development Commands
```bash
# Start development
npm start

# Build for production
npm run build

# Package app
npm run package

# Run tests
npm test

# Lint code
npm run lint
npm run lint:fix

# OpenSpec commands
openspec list                    # List all changes
openspec show <id>               # Show change details
openspec apply <id>              # Apply a change
```

## Directory Structure

```
zap/
├── .erb/                          # Electron React Boilerplate configs
├── assets/                        # Application assets
│   └── icon.svg                  # App icon
├── openspec/                     # OpenSpec specifications
│   ├── AGENTS.md                # AI agent guidelines
│   ├── project.md               # Project context (this file)
│   └── changes/
│       └── add-desktop-assistant/  # Desktop assistant feature
│           ├── proposal.md      # What & Why
│           ├── design.md        # Technical decisions
│           └── tasks.md         # Implementation checklist
├── src/                         # Source code
│   ├── __tests__/              # Test files
│   ├── main/                   # Electron main process
│   │   ├── menu.ts            # Application menu
│   │   ├── preload.ts         # Preload script (security bridge)
│   │   └── main.ts            # Main entry point
│   ├── renderer/              # React renderer process
│   │   ├── components/        # React components
│   │   │   └── ui/            # shadcn/ui components
│   │   │       ├── command.tsx   # Command palette
│   │   │       ├── dialog.tsx    # Dialog component
│   │   │       └── input.tsx     # Input component
│   │   ├── App.css            # Global styles with TailwindCSS
│   │   ├── App.tsx            # Root React component
│   │   ├── index.ejs          # HTML template
│   │   └── index.tsx          # React entry point
│   ├── lib/                   # Shared utilities
│   │   └── utils.ts           # cn() utility for shadcn/ui
│   └── hooks/                 # Custom React hooks
└── package.json               # Dependencies and scripts
```

## Configuration Files

### PostCSS Configuration
**File**: `postcss.config.mjs`
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### shadcn/ui Configuration
**File**: `components.json`
```json
{
  "style": "new-york",
  "tailwind": {
    "css": "src/renderer/App.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### TypeScript Configuration
**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Domain Context
This is a boilerplate project designed to be extended into specific desktop applications, now enhanced with a Spotlight-like desktop assistant. It provides:
- Cross-platform desktop app foundation (macOS, Windows, Linux)
- Auto-updater integration ready
- Code signing and notarization setup for macOS
- Modern UI with TailwindCSS v4.0 and shadcn/ui
- Plugin-based architecture for extensibility
- Development tools optimized for Electron + React

## Important Constraints
- **Node version**: >= 14.x required
- **npm version**: >= 7.x required
- **Platform builds**: Requires platform-specific setup for code signing
- **Electron limitations**: Must work within Electron's security model (context isolation, node integration restrictions)
- **Bundle size**: Desktop apps need to consider download size for auto-updates
- **Desktop Assistant**: Must maintain <300ms activation time, <5ms plugin processing

## External Dependencies
- **electron-builder**: For packaging and distribution
- **electron-updater**: Auto-update functionality
- **electron-log**: Logging framework
- **electron-debug**: Development debugging tools
- **GitHub Releases**: Default publishing target for auto-updater
- **TailwindCSS PostCSS**: v4.0+ with CSS-first configuration
- **shadcn/ui CLI**: Component installation and management
