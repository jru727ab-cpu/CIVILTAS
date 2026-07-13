# CIVILTAS Development Roadmap

## 🎯 Project Overview

**CIVILTAS** is a text-based civilization-building strategy game written in Python. Lead a settlement from survival to enlightenment through resource management, population growth, building construction, and age progression.

- **Status**: Core game complete, GitHub Pages live, ready for expansion
- **Language**: Python 3.8+
- **License**: MIT
- **Live Site**: https://jru727ab-cpu.github.io/CIVILTAS/

---

## ✅ Completed (Phase 1)

### Core Game Engine
- ✅ GameState management system
- ✅ Resource harvesting mechanics
- ✅ Building construction and costs
- ✅ Population growth and starvation
- ✅ Enlightenment accumulation
- ✅ Age progression system (4 ages)
- ✅ Gnosis unlock victory condition

### Infrastructure
- ✅ GitHub Pages deployment workflow
- ✅ Live landing page (site/index.html)
- ✅ Basic test suite

### Recent Improvements (Dev Branches)
- ✅ **dev/testing-and-ci**: Expanded comprehensive test suite (50+ tests)
- ✅ **dev/enhanced-landing-page**: Improved landing page with features showcase
- ✅ **dev/improvements**: Development branch for ongoing enhancements

---

## 📋 Pending PRs (Ready to Merge)

### PR #2: Polish CLI quit flow
- Implement graceful quit handling (q, quit, exit commands)
- Handle EOFError for clean stdin closure
- Add quit farewell message
- Improve prompt clarity

### PR #5: Fix multi-threshold age progression
- Fix `advance_age_if_ready()` to skip multiple ages if enlightenment is very high
- Add tests for multi-threshold skipping
- Ensure Gnosis unlocks correctly at age 3

---

## 🚀 Phase 2: Testing & CI/CD (In Progress)

### Comprehensive Test Suite
- **Location**: `tests.py` (expanded on `dev/testing-and-ci`)
- **Coverage**: 50+ tests across 8 test classes
- **Test Classes**:
  - `TestGameState`: State initialization, age advancement, Gnosis unlock
  - `TestResourceHarvesting`: Base harvest, building bonuses, population scaling
  - `TestBuildings`: Construction, affordability, resource deduction
  - `TestPopulation`: Growth, consumption, starvation, minimum population
  - `TestEnlightenment`: Temple/library accumulation, multi-source gains
  - `TestGameBalance`: Integration tests, victory conditions

### CI/CD Pipeline
- **Tool**: GitHub Actions (`tests.yml`)
- **Tests**: Run on Python 3.8, 3.9, 3.10, 3.11
- **Linting**: Black, isort, flake8
- **Coverage**: Codecov integration
- **Trigger**: Every push to main/dev/*, all PRs to main

### Project Configuration
- **pyproject.toml**: Package metadata, tool config
- **requirements-dev.txt**: Development dependencies

---

## 🎨 Phase 3: Enhanced Landing Page (In Progress)

### Improvements Deployed
- **Location**: `site/index.html` (on `dev/enhanced-landing-page`)
- **Features**:
  - Responsive multi-section design
  - Quick stats dashboard (4 ages, 4 buildings, 100 turns, ∞ replayability)
  - Comprehensive feature overview with emojis
  - Building details and costs
  - Resource explanation
  - Age progression timeline
  - Better visual hierarchy and hover effects
  - Mobile-optimized layout
  - Zero external dependencies or credits

### Design Elements
- Dark theme with amber accent colors
- Smooth transitions and hover effects
- Grid-based responsive layout
- Semantic HTML structure
- Fast page load (all CSS inline)

---

## 📅 Phase 4: Game Features (Planned)

### Save/Load System
- **Description**: Allow players to save games and resume later
- **Files**: `game/save_load.py`
- **Features**:
  - JSON-based save format
  - Multiple save slots
  - Auto-save on quit
  - Load from command line

### Difficulty Modes
- **Easy**: 1.2x resources, 0.8x enlightenment needed
- **Normal**: 1.0x multiplier (default)
- **Hard**: 0.8x resources, 1.2x enlightenment needed
- **Extreme**: 0.6x resources, 1.5x enlightenment needed

### Random Events
- **Plague**: Population loss
- **Harvest Bonus**: Extra food production
- **Discovery**: Enlightenment boost
- **Disaster**: Resource loss
- **Probability**: 10% per turn

### Additional Buildings
- **Granary**: +10 food storage capacity
- **Market**: +0.5 gold per worker
- **Observatory**: +3 enlightenment per turn
- **Monument**: Unique late-game building

---

## 🔧 Phase 5: Advanced Features (Future)

### Multiplayer Competitive Mode
- Two civilizations racing to Gnosis
- Shared world with trade mechanics
- Victory conditions: First to Gnosis wins

### Procedural Map Generation
- Multiple terrain types affect resources
- Regional bonuses and penalties
- Expansion mechanics

### Mod System
- Lua scripting support
- Custom buildings and ages
- Balance modifiers

### WebAssembly Version
- Browser-based playable version
- PyScript or Pyodide
- Interactive tutorial mode

---

## 📊 Development Guidelines

### Testing
```bash
# Install dev dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest tests.py -v

# Run with coverage
pytest tests.py --cov=game --cov-report=html

# Run specific test class
pytest tests.py::TestGameState -v
```

### Code Quality
```bash
# Format with black
black civiltas.py game/ tests.py

# Check imports with isort
isort civiltas.py game/ tests.py

# Lint with flake8
flake8 civiltas.py game/ tests.py
```

### Branching Strategy
- **main**: Production-ready code, GitHub Pages deployment
- **dev/testing-and-ci**: Testing infrastructure
- **dev/enhanced-landing-page**: Landing page improvements
- **dev/improvements**: General enhancements
- **feature/***: Individual feature branches

### PR Process
1. Create feature branch from `dev/*` or `main`
2. Make changes with tests
3. Ensure all tests pass locally
4. Push and create PR
5. Wait for CI/CD checks
6. Request review
7. Merge to main when approved

---

## 📈 Success Metrics

- [ ] 80%+ code coverage
- [ ] All tests passing on Python 3.8-3.11
- [ ] Zero linting errors
- [ ] Landing page mobile-responsive
- [ ] GitHub Pages live and updated
- [ ] Comprehensive README documentation
- [ ] PyPI package published
- [ ] 100+ GitHub stars

---

## 🎓 Documentation TODOs

- [ ] Complete in-game tutorial mode
- [ ] API documentation (docstrings)
- [ ] Game balance guide
- [ ] Modding guide (for future mod system)
- [ ] Contribution guidelines
- [ ] Architecture documentation

---

## 🔐 Quality Standards

### Code Quality
- Minimum 80% test coverage
- Type hints for all functions
- Clear docstrings
- PEP 8 compliant (via black/flake8)
- No circular imports

### Performance
- Game loop completes in <100ms per turn
- Startup time <1 second
- Memory usage <50MB typical

### Compatibility
- Python 3.8+ support
- Cross-platform (Windows, macOS, Linux)
- Terminal compatibility (standard ANSI colors)

---

## 🚀 Next Actions

1. **Merge pending PRs** (#2, #5) to main
2. **Set up branch protection** on main branch
3. **Create CI/CD workflow** (pending .github/workflows permission)
4. **Promote dev branches** to PRs for review
5. **Implement save/load system** (Phase 4)
6. **Add difficulty modes** (Phase 4)
7. **Publish to PyPI** (Phase 5)

---

## 📞 Contacts & Resources

- **Repository**: https://github.com/jru727ab-cpu/CIVILTAS
- **Issues**: For bug reports and feature requests
- **GitHub Pages**: https://jru727ab-cpu.github.io/CIVILTAS/
- **License**: MIT

---

**Last Updated**: 2026-07-13  
**Maintainer**: Copilot (Lead Developer)  
**Status**: 🟢 Active Development
