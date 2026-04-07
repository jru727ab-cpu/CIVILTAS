#!/usr/bin/env python3
"""CIVILTAS — main game loop."""

from game.state import GameState
from game.resources import harvest
from game.buildings import build, list_buildings, BUILDING_COSTS
from game.population import consume_food, grow_population
from game.enlightenment import accumulate_enlightenment, GNOSIS_TEXT
from game.display import print_header, print_status, print_build_menu, print_events

MAX_TURNS = 100


class QuitGame(Exception):
    """Raised when the player chooses to leave the game."""


def get_int_input(prompt: str, lo: int, hi: int) -> int:
    while True:
        try:
            raw = input(prompt).strip()
        except EOFError as exc:
            raise QuitGame from exc

        if raw.lower() in {"q", "quit", "exit"}:
            raise QuitGame

        try:
            value = int(raw)
            if lo <= value <= hi:
                return value
            print(f"  Please enter a number between {lo} and {hi}.")
        except ValueError:
            print("  Invalid input — please enter a number or q to quit.")


def play_turn(state: GameState) -> list:
    """Execute one full game turn and return a list of event messages."""
    events = []

    # Harvest resources
    gained = harvest(state)
    events.append(
        f"Harvested  Food+{gained['food']:.1f}  Wood+{gained['wood']:.1f}"
        f"  Stone+{gained['stone']:.1f}  Gold+{gained['gold']:.1f}"
    )

    # Accumulate enlightenment
    ep = accumulate_enlightenment(state)
    if ep > 0:
        events.append(f"Gained {ep:.1f} Enlightenment Points.")

    # Check age advancement
    if state.advance_age_if_ready():
        events.append(f"✦ Your civilization has entered the {state.age}! ✦")

    # Population food consumption
    consumed = consume_food(state)
    events.append(f"Population consumed {consumed:.1f} food.")

    # Population growth / starvation
    delta = grow_population(state)
    if delta > 0:
        events.append(f"Population grew by {delta} (now {state.population}).")
    else:
        events.append(f"Starvation! Population shrank by {abs(delta)} (now {state.population}).")

    return events


def main() -> None:
    print("\nWelcome to CIVILTAS")
    print("Lead your people from humble beginnings to eternal Gnosis.\n")

    state = GameState()
    buildings = list_buildings()

    try:
        for _ in range(MAX_TURNS):
            print_header(state)
            print_status(state)
            print_build_menu(state)

            choice_prompt = f"\n  Your choice (0 to skip, 1-{len(buildings)} to build, q to quit): "
            choice = get_int_input(choice_prompt, 0, len(buildings))
            if choice > 0:
                name = buildings[choice - 1]
                if build(state, name):
                    print(f"  ✓ {name} constructed.")
                else:
                    print(f"  ✗ Not enough resources to build {name}.")

            events = play_turn(state)
            print_events(events)

            state.turn += 1

            if state.gnosis_unlocked:
                print(GNOSIS_TEXT)
                print(f"  You achieved Gnosis on turn {state.turn - 1}!  Congratulations.\n")
                return
    except QuitGame:
        print("\n  Farewell. Your civilization awaits your return.\n")
        return

    print(f"\n  {MAX_TURNS} turns have passed.  Your civilization endures, but Gnosis remains elusive.")
    print(f"  Final Enlightenment: {state.enlightenment:.1f} / 300  —  Age: {state.age}\n")


if __name__ == "__main__":
    main()
