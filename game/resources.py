"""Resource harvesting logic."""

from .state import GameState


BASE_FOOD_PER_WORKER = 2.0
BASE_WOOD_PER_WORKER = 1.5
BASE_STONE_PER_WORKER = 1.0
BASE_GOLD_PER_WORKER = 0.5


def harvest(state: GameState) -> dict:
    """Compute and apply one turn of resource gathering.

    Returns a dict with the amounts gained this turn.
    """
    farms = state.buildings.get("Farm", 0)
    mines = state.buildings.get("Mine", 0)
    workers = max(1, state.population)

    food_gained = workers * BASE_FOOD_PER_WORKER + farms * 5.0
    wood_gained = workers * BASE_WOOD_PER_WORKER
    stone_gained = workers * BASE_STONE_PER_WORKER + mines * 3.0
    gold_gained = workers * BASE_GOLD_PER_WORKER + mines * 2.0

    state.food += food_gained
    state.wood += wood_gained
    state.stone += stone_gained
    state.gold += gold_gained

    return {
        "food": food_gained,
        "wood": wood_gained,
        "stone": stone_gained,
        "gold": gold_gained,
    }
