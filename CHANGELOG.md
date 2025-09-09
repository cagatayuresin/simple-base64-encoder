# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.1.0] - 2025-09-09

### Added
- UTF-8 safe conversions for Base64, Base64URL, Hex, Binary
- Footer logo with light/dark variants centered above social icons
- File result actions: Download and Collapse/Expand
- Clipboard fallback when Clipboard API is unavailable
- Accessibility: aria labels, aria-live alerts, modal roles and focus trap
- Security badge and SECURITY.md policy link in footer

### Changed
- Respect system theme on first load via prefers-color-scheme
- Improve file type heuristic for unknown MIME types

### Fixed
- README UTF-8 character issues
- Removed risky data attributes from file results (XSS hardening)

## [2.0.0] - 2025-09-04

### Added

- CHANGELOG.md file to track project changes
- Migration to Tabler Icons for better consistency and modern look
- Tabler Icons styling and dark mode compatibility
- **Modular JavaScript Architecture**
  - Split monolithic script.js (1250 lines) into focused modules
  - converters.js - Format conversion utilities
  - fileHandler.js - File processing operations
  - visualFeedback.js - UI feedback and notifications
  - errorHandler.js - Error management and modals
  - main.js - Core application logic and initialization
- **Elegant File Upload Results System**
  - Beautiful file result cards with animated reveals
  - Individual copy buttons for each conversion result
  - File type icons and size information display
  - Remove individual results functionality
  - Read-only textareas for converted content
  - Conversion statistics (original vs converted size)
  - Format-specific result display
  - Dark mode compatible styling with gradients
- **Comprehensive Error Handling System**
  - Real-time error notifications with auto-dismiss
  - Success notifications for user feedback
  - Input validation with visual error states
  - Browser compatibility checking
  - Global error and promise rejection handlers
- **Enhanced Copy Functionality**
  - Empty field validation before copying
  - Fallback selection for browsers without clipboard API
  - Visual success feedback for copy operations
- **Robust Data Management**
  - Safe localStorage operations with error recovery
  - Data validation for loaded content
  - Graceful degradation when storage fails
- **Smart Input Validation**
  - Real-time Base64 format checking
  - Debounced error messages to reduce spam
  - Clear visual indicators for invalid data
- **Modern Custom Modal System**
  - Beautiful, animated confirmation dialogs
  - Contextual icons and colors (warning, danger, info)
  - Dark mode compatible styling
  - Keyboard navigation support (ESC to close)
  - Backdrop click to dismiss
  - Smooth animations and transitions
- **Advanced File Support**
  - Binary file support (images, documents, etc.)
  - Drag & drop file upload interface
  - Multiple file processing
  - File type detection and validation
  - File size and metadata display
- **Multiple Format Support**
  - Standard Base64 encoding/decoding
  - URL-Safe Base64 support
  - Hexadecimal conversion
  - Binary representation
  - URL encoding/decoding
  - JSON formatter with validation
- **Enhanced Visual Feedback**
  - Real-time progress bars for file processing
  - Character and byte counters
  - Processing status notifications
  - File information display
  - Visual drag & drop indicators

### Changed

- Project name updated from "Advanced Base64 Converter" to "Simple Base64 Encoder"
- Updated branding throughout HTML, README, and documentation
- Replaced FontAwesome icons with Tabler Icons throughout the application
- **Complete Error Handling Overhaul**
  - All encoding/decoding operations now use safe wrapper functions
  - LocalStorage operations wrapped with try-catch blocks
  - Copy operations enhanced with comprehensive error handling
- **Refined File Upload Experience**
  - Files no longer create editable plaintext rows
  - Direct conversion to beautiful result cards
  - Streamlined workflow for file processing
  - Focus on output presentation rather than editing
- **Improved User Experience**
  - Non-blocking error messages that don't interrupt workflow
  - Visual feedback for all user actions
  - Better handling of edge cases and invalid input
  - Button alignment fixes for consistent UI
- **Enhanced Data Persistence**
  - Validation of saved data structure on load
  - Automatic recovery from corrupted localStorage data
  - Graceful fallback to default state when data loading fails
- **Replaced Native Browser Dialogs**
  - All confirm() calls replaced with custom modal system
  - alert() messages converted to styled notifications
  - Improved user experience with consistent styling
  - Better accessibility and mobile responsiveness

### Deprecated

- FontAwesome dependency removed

### Removed

- FontAwesome CDN and all related icon classes

### Fixed

- Icon display consistency across different themes
- Button icon alignment and spacing
- Plus icon display issue (now shows proper + instead of pipe)
- CSS duplicate selector issues in file results styling
- Copy and clear button alignment issues
- **Modular JavaScript Integration Issues**
  - Fixed theme toggle functionality after code splitting
  - Corrected CSS selector mismatch (body.dark-mode → [data-theme="dark"])
  - Fixed missing button ID references in main.js
  - Resolved file processing functionality
  - Updated HTML element ID mappings for modular scripts
- **Dark Mode UI Issues**
  - Fixed file upload component visibility in dark mode
  - Corrected dropdown menu styling for dark theme
  - Improved file name display readability
  - Enhanced drag & drop area styling for dark mode
- **Initial Setup Improvements**
  - Restored 5 default converter rows on first load
  - Better user experience with pre-populated workspace
- **Critical Error Handling Issues**
  - Silent failures in Base64 encoding/decoding
  - Unhandled clipboard API failures
  - LocalStorage quota exceeded errors
  - Corrupted data loading crashes
  - Browser compatibility issues
- **User Experience Issues**
  - No feedback for failed operations
  - Unclear error messages
  - Data loss without warning
  - Missing validation for edge cases
- **Layout and Alignment Issues**
  - Copy/Clear buttons misalignment with textarea inputs
  - Button height inconsistency across different rows
  - Border radius continuity in button groups
  - Flexbox layout improvements for better responsiveness

### Security

- **Input Validation**: All user input is now properly validated before processing
- **Error Disclosure**: Error messages no longer expose sensitive technical details
- **Safe Fallbacks**: Clipboard access gracefully degrades when permissions are denied

---

## [1.0.0] - 2025-03-25

### Initial Release

- Initial release of Simple Base64 Encoder
- Real-time Base64 encoding and decoding
- Dynamic textarea resizing
- Multiple converter rows support
- Add unlimited rows functionality
- Individual clear and copy buttons for each field
- Dark mode toggle with animated theme icon
- Auto-save to localStorage
- Responsive design with Bulma CSS
- Clean and modern UI
- Mobile-friendly layout
- Theme persistence across sessions
- Logo integration with theme switching

### Features

- ➕ Add new converter rows dynamically
- 🧼 Clear all rows with confirmation
- 📋 Copy to clipboard functionality
- 🌓 Light/Dark mode toggle
- 💾 Automatic data persistence
- 📱 Responsive mobile design
- ⚡ Real-time conversion
- 🎨 Smooth transitions and animations

### Technical

- Built with vanilla JavaScript (no dependencies)
- Utilizes Bulma CSS framework
- FontAwesome icons integration
- LocalStorage for data persistence
- Progressive enhancement approach
- Clean and maintainable code structure

---

## Notes

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Vulnerability fixes
