"""Text-based UI helpers."""

from .state import GameState, AGES, ENLIGHTENMENT_THRESHOLDS
from .buildings import BUILDING_COSTS, BUILDING_DESCRIPTIONS, can_afford


def print_header(state: GameState) -> None:
    print("\n" + "═" * 60)
    print(f"  CIVILTAS  —  Turn {state.turn}  —  {state.age}")
    print("═" * 60)


def print_status(state: GameState) -> None:
    print(f"  Population : {state.population}")
    print(f"  Food       : {state.food:.1f}")
    print(f"  Wood       : {state.wood:.1f}")
    print(f"  Stone      : {state.stone:.1f}")
    print(f"  Gold       : {state.gold:.1f}")
    next_idx = state.age_index + 1
    if next_idx < len(ENLIGHTENMENT_THRESHOLDS):
        needed = ENLIGHTENMENT_THRESHOLDS[next_idx] - state.enlightenment
        print(f"  Enlightenment : {state.enlightenment:.1f}  (next age in {max(0, needed):.1f})")
    else:
        print(f"  Enlightenment : {state.enlightenment:.1f}  (MAX)")
    if state.buildings:
        parts = ", ".join(f"{k}×{v}" for k, v in state.buildings.items())
        print(f"  Buildings  : {parts}")
    else:
        print("  Buildings  : none")


def print_build_menu(state: GameState) -> None:
    print("\n  Available buildings:")
    for i, name in enumerate(BUILDING_COSTS.keys(), start=1):
        w, s, g, f = BUILDING_COSTS[name]
        affordable = "✓" if can_afford(state, name) else "✗"
        print(f"  {i}. {name:<8}  Wood:{w} Stone:{s} Gold:{g}  — {BUILDING_DESCRIPTIONS[name]}  [{affordable}]")
    print("  0. Skip building this turn")


def print_events(events: list) -> None:
    if events:
        print()
        for e in events:
            print(f"  ► {e}")
