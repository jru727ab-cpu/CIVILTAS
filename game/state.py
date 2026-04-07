"""GameState: central data class holding all mutable game data."""

from dataclasses import dataclass, field
from typing import Dict


AGES = [
    "Age of Survival",
    "Age of Society",
    "Age of Reason",
    "Age of Gnosis",
]

ENLIGHTENMENT_THRESHOLDS = [0, 50, 150, 300]


@dataclass
class GameState:
    turn: int = 1
    population: int = 10
    food: float = 30.0
    wood: float = 20.0
    stone: float = 10.0
    gold: float = 0.0
    enlightenment: float = 0.0
    buildings: Dict[str, int] = field(default_factory=dict)
    age_index: int = 0
    gnosis_unlocked: bool = False

    @property
    def age(self) -> str:
        return AGES[self.age_index]

    def advance_age_if_ready(self) -> bool:
        """Return True if the civilization advanced to a new age."""
        advanced = False
        while self.age_index + 1 < len(ENLIGHTENMENT_THRESHOLDS):
            next_index = self.age_index + 1
            if self.enlightenment < ENLIGHTENMENT_THRESHOLDS[next_index]:
                break
            self.age_index = next_index
            advanced = True

        if self.age_index == len(AGES) - 1:
            self.gnosis_unlocked = True

        return advanced
