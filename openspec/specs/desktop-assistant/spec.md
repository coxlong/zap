# desktop-assistant Specification

## Purpose
TBD - created by archiving change add-desktop-assistant. Update Purpose after archive.
## Requirements
### Requirement: Global Hotkey Activation
The desktop assistant SHALL provide a global hotkey to show/hide the search window.

#### Scenario: Show search window with hotkey
- **GIVEN** the application is running
- **WHEN** the user presses Cmd/Ctrl+Shift+Space
- **THEN** the search window becomes visible and focused
- **AND** the window is centered on the active screen

#### Scenario: Hide search window with same hotkey
- **GIVEN** the search window is visible
- **WHEN** the user presses Cmd/Ctrl+Shift+Space again
- **THEN** the search window is hidden

#### Scenario: Hide with Escape key
- **GIVEN** the search window is visible
- **WHEN** the user presses the Escape key
- **THEN** the search window is hidden

### Requirement: Search Input Interface
The desktop assistant SHALL provide an input field for users to type queries.

#### Scenario: Auto-focus on window show
- **GIVEN** the search window is shown
- **WHEN** the window is fully rendered
- **THEN** the input field is automatically focused
- **AND** any existing text is selected

#### Scenario: Real-time query processing
- **GIVEN** the user types in the input field
- **WHEN** the user stops typing for 300ms
- **THEN** the system triggers plugin candidate generation

### Requirement: Plugin Candidate Generation
The desktop assistant SHALL generate candidate actions from registered plugins based on user input.

#### Scenario: Parallel plugin processing
- **GIVEN** multiple plugins are registered
- **WHEN** the user types a query
- **THEN** all plugins generate candidates in parallel within 5ms
- **AND** each plugin returns one candidate or null

#### Scenario: Timestamp plugin generates candidate
- **GIVEN** the user enters "1704067200"
- **WHEN** plugin processing completes
- **THEN** the timestamp plugin returns a candidate with local time conversion
- **AND** the description contains the converted time string

#### Scenario: URL plugin handles complete URL
- **GIVEN** the user enters "https://github.com"
- **WHEN** plugin processing completes
- **THEN** the URL plugin returns a candidate for opening the URL
- **AND** the action type is 'open-url'

#### Scenario: URL plugin handles search query
- **GIVEN** the user enters "electron react boilerplate"
- **WHEN** plugin processing completes
- **THEN** the URL plugin returns a candidate for Google search
- **AND** the action payload is a Google search URL

#### Scenario: AI plugin provides candidate
- **GIVEN** the user enters any text (3+ characters)
- **WHEN** plugin processing completes
- **THEN** the AI chat plugin returns a candidate for AI conversation
- **AND** the title previews the user's input

### Requirement: Deterministic Candidate Ranking
The desktop assistant SHALL use a hard-coded scoring function to rank all plugin candidates by relevance.

#### Scenario: Sort candidates by score
- **GIVEN** 10-15 candidates are generated from all plugins
- **WHEN** the deterministic sort function is called
- **THEN** the function returns the top 8 candidates ordered by relevance score
- **AND** the sorting completes within 1ms

#### Scenario: Sort by fixed plugin order
- **GIVEN** candidates are generated from multiple plugins
- **WHEN** the sort function is called
- **THEN** timestamp plugin candidates appear first
- **AND** url plugin candidates appear second
- **AND** ai-chat plugin candidates appear last

### Requirement: Results Display with Navigation
The desktop assistant SHALL display ranked candidates and support keyboard navigation.

#### Scenario: Display top 5-8 results
- **GIVEN** LLM ranking has completed
- **WHEN** results are displayed
- **THEN** the top 5-8 candidates are shown in a vertical list
- **AND** each item shows icon, title, and description

#### Scenario: Navigate with arrow keys
- **GIVEN** results are displayed with an item selected
- **WHEN** the user presses the Down arrow key
- **THEN** the selection moves to the next item
- **WHEN** the user presses the Up arrow key
- **THEN** the selection moves to the previous item

#### Scenario: Select with Enter key
- **GIVEN** a result item is selected
- **WHEN** the user presses Enter
- **THEN** the associated action is executed
- **AND** the search window is hidden

#### Scenario: Select with mouse click
- **GIVEN** results are displayed
- **WHEN** the user clicks on a result item
- **THEN** the associated action is executed
- **AND** the search window is hidden

### Requirement: Timestamp Conversion Plugin
The desktop assistant SHALL provide a timestamp conversion plugin.

#### Scenario: Match and convert 10-digit timestamp (seconds)
- **GIVEN** the user enters a 10-digit number
- **WHEN** the plugin generate method is called
- **THEN** the plugin returns a candidate with local time conversion
- **AND** the description shows the converted time

#### Scenario: Match and convert 13-digit timestamp (milliseconds)
- **GIVEN** the user enters a 13-digit number
- **WHEN** the plugin generate method is called
- **THEN** the plugin returns a candidate with local time conversion
- **AND** the description shows the converted time

#### Scenario: Copy converted time
- **GIVEN** a timestamp candidate is selected
- **WHEN** the action executes
- **THEN** the converted time string is copied to clipboard

### Requirement: URL Handling Plugin
The desktop assistant SHALL provide a URL handling plugin.

#### Scenario: Match and open complete URL
- **GIVEN** the user enters "https://github.com"
- **WHEN** the URL plugin generate method is called
- **THEN** the plugin returns a candidate for opening the URL in browser
- **AND** the action payload is "https://github.com"

#### Scenario: Match and open domain without protocol
- **GIVEN** the user enters "github.com"
- **WHEN** the URL plugin generate method is called
- **THEN** the plugin returns a candidate for opening the URL in browser
- **AND** the action payload is "https://github.com"

#### Scenario: Search query when not a URL
- **GIVEN** the user enters "electron react boilerplate"
- **WHEN** the URL plugin generate method is called
- **THEN** the plugin returns a candidate for Google search
- **AND** the action payload is "https://www.google.com/search?q=electron+react+boilerplate"

#### Scenario: Open action executes
- **GIVEN** a URL candidate is selected
- **WHEN** the action executes
- **THEN** the URL is opened in the default browser

#### Scenario: Search action executes
- **GIVEN** a Google search candidate is selected
- **WHEN** the action executes
- **THEN** the search results page is opened in the default browser

### Requirement: AI Chat Plugin
The desktop assistant SHALL provide an AI chat plugin.

#### Scenario: Match any natural language input
- **GIVEN** the user enters 3 or more characters
- **WHEN** the plugin patterns are evaluated
- **THEN** the plugin always matches with confidence 0.5

#### Scenario: Open chat window
- **GIVEN** the user selects "AI 对话"
- **WHEN** the action executes
- **THEN** a new dialog window opens with the chat interface
- **AND** the user's query is pre-filled in the chat input

### Requirement: Plugin Registration System
The desktop assistant SHALL provide a static plugin registry.

#### Scenario: Static plugin imports
- **GIVEN** the application is launching
- **WHEN** the plugin module is loaded
- **THEN** all three plugins (timestamp, URL, AI) are statically imported
- **AND** the allPlugins array contains the plugin instances

#### Scenario: Plugin process input independently
- **GIVEN** plugins are registered
- **WHEN** the user types a query
- **THEN** each plugin's generate method is called with the full input
- **AND** each plugin independently decides whether to return a candidate or null

### Requirement: UI Component Library Integration
The desktop assistant SHALL use the shadcn/ui component library.

#### Scenario: Install command component
- **GIVEN** shadcn/ui is initialized
- **WHEN** the command component is added
- **THEN** the component files are created in src/components/ui/

#### Scenario: Use command component for search
- **GIVEN** the search UI is implemented
- **WHEN** the user interacts with the interface
- **THEN** Command, CommandInput, CommandList, and CommandItem components are used
- **AND** keyboard navigation works out of the box

### Requirement: Styling Framework Integration
The desktop assistant SHALL use TailwindCSS for styling.

#### Scenario: Configure TailwindCSS
- **GIVEN** the project setup is complete
- **WHEN** TailwindCSS is configured
- **THEN** postcss and autoprefixer are added to webpack config
- **AND** tailwind.config.js defines the design tokens

#### Scenario: Apply glassmorphism effect
- **GIVEN** the search window is styled
- **WHEN** Tailwind classes are applied
- **THEN** the window has a semi-transparent background with blur effect
- **AND** the window has proper rounded corners and shadow

