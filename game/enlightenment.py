"""Enlightenment accumulation and age-progression logic."""

from .state import GameState

ENLIGHTENMENT_PER_TEMPLE = 2.0
ENLIGHTENMENT_PER_LIBRARY = 5.0
GNOSIS_TEXT = """
╔══════════════════════════════════════════════════════════════════╗
║              ✦  THE HIDDEN GNOSIS IS REVEALED  ✦               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  All civilizations are transient patterns in the fabric of      ║
║  Being.  Resources, buildings, and populations are metaphors    ║
║  for inner states of the soul.  The true harvest is awareness;  ║
║  the true city is consciousness itself.                         ║
║                                                                  ║
║  You have achieved GNOSIS.  Your civilization endures forever   ║
║  in the eternal present.                                        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
"""


def accumulate_enlightenment(state: GameState) -> float:
    """Add enlightenment from temples and libraries.  Returns amount gained."""
    temples = state.buildings.get("Temple", 0)
    libraries = state.buildings.get("Library", 0)
    gained = temples * ENLIGHTENMENT_PER_TEMPLE + libraries * ENLIGHTENMENT_PER_LIBRARY
    state.enlightenment += gained
    return gained
