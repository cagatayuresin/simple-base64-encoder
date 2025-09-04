# Contributing to Simple Base64 Encoder 🤝

Thank you for your interest in contributing to the Simple Base64 Encoder! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or suggesting enhancements.

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [How to Contribute](#how-to-contribute)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)
- [Code Guidelines](#-code-guidelines)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Development Workflow](#-development-workflow)

## 🤝 Code of Conduct

This project follows a simple code of conduct:

- **Be respectful** and considerate in all interactions
- **Be collaborative** and help others learn and grow
- **Be constructive** when providing feedback
- **Be inclusive** and welcoming to contributors of all backgrounds

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/simple-base64-encoder.git
   cd simple-base64-encoder
   ```

3. **Create a branch** for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 💻 Development Setup

This project uses vanilla HTML, CSS, and JavaScript with no build process required!

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A code editor (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Local Development

1. **Open the project** in your preferred editor
2. **Serve the files** using any HTTP server:

   ```bash
   # Python 3
   python -m http.server 8080
   
   # Node.js
   npx serve .
   
   # VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"
   ```

3. **Open** `http://localhost:8080` in your browser

### Project Structure

```plaintext
src/
├── css/
│   └── style.css          # Custom styles and dark mode
├── js/                    # Modular JavaScript
│   ├── main.js            # Core application logic
│   ├── converters.js      # Format conversion utilities
│   ├── fileHandler.js     # File processing operations
│   ├── visualFeedback.js  # UI feedback systems
│   └── errorHandler.js    # Error management & modals
└── img/                   # Images and assets
```

## How to Contribute

### 🐛 Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating a new issue
3. **Include detailed information**:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Console errors (if any)

### 💡 Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Create a detailed feature request** including:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach
   - Any relevant mockups or examples

### 🔧 Code Contributions

#### Types of Contributions We Welcome

- **Bug fixes** - Help us squash those pesky bugs
- **New format support** - Add more conversion formats
- **UI/UX improvements** - Make the interface even better
- **Performance optimizations** - Make it faster and more efficient
- **Accessibility improvements** - Make it usable for everyone
- **Documentation** - Help others understand the project
- **Tests** - Help ensure code quality
- **Translations** - Make it available in more languages

#### Before You Start

- **Open an issue** to discuss major changes
- **Keep changes focused** - one feature/fix per PR
- **Follow existing patterns** and coding style
- **Test your changes** thoroughly

## 📝 Code Guidelines

### JavaScript Style

```javascript
// Use const/let instead of var
const element = document.getElementById('myElement');
let counter = 0;

// Use descriptive variable names
const fileUploadArea = document.getElementById('fileUploadArea');
const conversionResult = processBase64(inputText);

// Add comments for complex logic
// Process file and convert to base64 with progress tracking
function processFileWithProgress(file) {
  // Implementation...
}

// Use modern JavaScript features
const files = Array.from(fileInput.files);
const results = files.map(file => processFile(file));
```

### CSS Style

```css
/* Use meaningful class names */
.converter-row {
  margin-bottom: 1rem;
}

/* Group related styles */
.file-upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

/* Use CSS custom properties for theming */
[data-theme="dark"] .converter-row {
  background-color: var(--dark-background);
  color: var(--dark-text);
}
```

### HTML Structure

```html
<!-- Use semantic HTML -->
<section class="converter-section">
  <h2 class="section-title">Format Converter</h2>
  <!-- Content -->
</section>

<!-- Include accessibility attributes -->
<button class="copy-button" aria-label="Copy to clipboard" title="Copy text">
  <svg><!-- icon --></svg>
</button>

<!-- Use meaningful IDs and classes -->
<div class="file-upload-area" id="fileUploadArea">
  <!-- Upload interface -->
</div>
```

## 📝 Commit Guidelines

### Commit Message Format

```plaintext
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(converter): add URL encoding/decoding support

fix(theme): resolve dark mode toggle issue on mobile

docs(readme): update installation instructions

style(css): improve button hover animations

refactor(js): split main.js into modular components
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main:

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Test your changes**:
   - Manual testing in multiple browsers
   - Check console for errors
   - Verify responsive design
   - Test dark/light mode

3. **Update documentation** if needed:
   - README.md for new features
   - Code comments for complex functions
   - CHANGELOG.md for notable changes

### Submitting Your PR

1. **Create a clear PR title** following commit message format
2. **Fill out the PR template** completely
3. **Link related issues** using keywords like "Fixes #123"
4. **Add screenshots** for UI changes
5. **Request review** from maintainers

### PR Review Process

- Maintainers will review within 48-72 hours
- Address feedback promptly and professionally
- Keep discussions focused on the code
- Be open to suggestions and improvements

## 🔄 Development Workflow

### For New Features

1. **Discuss the feature** in an issue first
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/url-encoding-support
   ```

3. **Implement the feature** following our guidelines
4. **Test thoroughly** across different browsers
5. **Update documentation** as needed
6. **Submit a pull request**

### For Bug Fixes

1. **Reproduce the bug** and understand the issue
2. **Create a fix branch**:

   ```bash
   git checkout -b fix/dark-mode-toggle-issue
   ```

3. **Fix the bug** with minimal changes
4. **Test the fix** and ensure no regressions
5. **Submit a pull request** with detailed description

### For Documentation

1. **Create a docs branch**:

   ```bash
   git checkout -b docs/improve-contributing-guide
   ```

2. **Make your improvements**
3. **Preview changes** (for markdown files)
4. **Submit a pull request**

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] All conversion formats work correctly
- [ ] File upload and drag-drop function properly
- [ ] Copy buttons work across browsers
- [ ] Dark/light mode toggle works
- [ ] Responsive design looks good
- [ ] No console errors
- [ ] LocalStorage saves/loads correctly

### Browser Testing

Test your changes in:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎯 Areas Where We Need Help

- **🌍 Internationalization** - Adding multi-language support
- **♿ Accessibility** - Improving keyboard navigation and screen reader support
- **📱 Mobile UX** - Enhancing mobile user experience
- **🚀 Performance** - Optimizing file processing for large files
- **🧪 Testing** - Adding automated tests
- **📖 Documentation** - Improving guides and examples

## 🤔 Questions?

- **General questions**: Open a discussion in GitHub Discussions
- **Bug reports**: Use GitHub Issues
- **Feature requests**: Use GitHub Issues with the "feature request" label
- **Direct contact**: Email <cagatayuresin@gmail.com>

## 🙏 Recognition

Contributors will be:

- Listed in our README.md
- Mentioned in release notes for significant contributions
- Given credit in the project documentation

Thank you for helping make Simple Base64 Encoder better for everyone! 🎉

---

### Happy contributing! 🚀
