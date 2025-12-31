# Project Context

## Purpose
This is an Electron React Boilerplate project - a foundation for building scalable cross-platform desktop applications using web technologies. It provides a production-ready setup for developing desktop apps that run on macOS, Windows, and Linux while leveraging modern web development practices.

## Tech Stack
- **Electron** (v35.0.2) - Desktop application framework
- **React** (v19.0.0) - UI library with React Router v7 for navigation
- **TypeScript** (v5.8.2) - Primary development language with strict mode enabled
- **Webpack** (v5.98.0) - Module bundler with separate configs for main/renderer processes
- **Sass** - CSS preprocessing support
- **Jest** - Testing framework with React Testing Library
- **ESLint + Prettier** - Code linting and formatting
- **React Refresh** - Hot module replacement for development

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

## Domain Context
This is a boilerplate project designed to be extended into specific desktop applications. It provides:
- Cross-platform desktop app foundation
- Auto-updater integration ready
- Code signing and notarization setup for macOS
- Multi-platform build support (macOS, Windows, Linux)
- Development tools optimized for Electron + React development

## Important Constraints
- **Node version**: >= 14.x required
- **npm version**: >= 7.x required
- **Platform builds**: Requires platform-specific setup for code signing
- **Electron limitations**: Must work within Electron's security model (context isolation, node integration restrictions)
- **Bundle size**: Desktop apps need to consider download size for auto-updates

## External Dependencies
- **electron-builder**: For packaging and distribution
- **electron-updater**: Auto-update functionality
- **electron-log**: Logging framework
- **electron-debug**: Development debugging tools
- **GitHub Releases**: Default publishing target for auto-updater
