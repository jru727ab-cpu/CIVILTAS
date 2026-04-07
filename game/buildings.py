"""Building definitions and construction."""

from .state import GameState

# (wood_cost, stone_cost, gold_cost, food_cost)
BUILDING_COSTS = {
    "Farm":    (10, 5,  0,  0),
    "Mine":    (15, 10, 0,  0),
    "Temple":  (20, 15, 5,  0),
    "Library": (25, 20, 10, 0),
}

BUILDING_DESCRIPTIONS = {
    "Farm":    "+5 Food/turn per Farm.",
    "Mine":    "+3 Stone/turn and +2 Gold/turn per Mine.",
    "Temple":  "+2 Enlightenment/turn per Temple.",
    "Library": "+5 Enlightenment/turn per Library.",
}


def can_afford(state: GameState, building: str) -> bool:
    if building not in BUILDING_COSTS:
        return False
    w, s, g, f = BUILDING_COSTS[building]
    return state.wood >= w and state.stone >= s and state.gold >= g and state.food >= f


def build(state: GameState, building: str) -> bool:
    """Attempt to construct a building.  Returns True on success."""
    if not can_afford(state, building):
        return False
    w, s, g, f = BUILDING_COSTS[building]
    state.wood -= w
    state.stone -= s
    state.gold -= g
    state.food -= f
    state.buildings[building] = state.buildings.get(building, 0) + 1
    return True


def list_buildings() -> list:
    return list(BUILDING_COSTS.keys())
