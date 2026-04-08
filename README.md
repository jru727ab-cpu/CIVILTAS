# CIVILTAS

> *Gain enlightenment, harvest, work for resources, build civilization, gain esoteric hidden Gnosis.*

CIVILTAS (from Latin *civitas* — city, civilization) is a text-based civilization-building game where you lead a fledgling settlement from humble origins to an enlightened society. Gather resources, cultivate your people, erect wonders, and unlock hidden esoteric knowledge on the path to true Gnosis.

## Features

- **Resource Harvesting** — Collect Wood, Stone, Food, and Gold each turn.
- **Population Growth** — Your citizens consume food and multiply when well-fed.
- **Buildings** — Construct Farms, Mines, Temples, and Libraries to boost production and unlock new capabilities.
- **Enlightenment System** — Accumulate Enlightenment Points through Temples and Libraries to advance through four ages:
  - Age of Survival
  - Age of Society
  - Age of Reason
  - Age of Gnosis
- **Esoteric Gnosis** — Reach the final age to reveal hidden knowledge and win the game.

## Getting Started

Requires **Python 3.8+**.

```bash
python civiltas.py
```

Follow the on-screen prompts each turn to decide what to build or how to manage your civilization. Enter `q` at any prompt to leave the game cleanly.

## Project Structure

```
civiltas.py        # Main entry point and game loop
game/
  __init__.py
  state.py         # GameState dataclass
  resources.py     # Resource harvesting logic
  buildings.py     # Building definitions and construction
  population.py    # Population growth and consumption
  enlightenment.py # Enlightenment and age progression
  display.py       # Text-based UI helpers
```

## License

MIT
