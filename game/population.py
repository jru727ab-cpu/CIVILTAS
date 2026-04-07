"""Population growth and food consumption."""

from .state import GameState

FOOD_PER_CITIZEN = 1.5
GROWTH_RATE = 0.10


def consume_food(state: GameState) -> float:
    """Deduct food consumed by the population.  Returns food consumed."""
    consumed = state.population * FOOD_PER_CITIZEN
    state.food = max(0.0, state.food - consumed)
    return consumed


def grow_population(state: GameState) -> int:
    """Grow population if food is plentiful; shrink if starving.

    Returns the net change in population.
    """
    if state.food > 0:
        growth = max(1, int(state.population * GROWTH_RATE))
        state.population += growth
        return growth
    else:
        loss = max(1, int(state.population * 0.05))
        state.population = max(1, state.population - loss)
        return -loss
