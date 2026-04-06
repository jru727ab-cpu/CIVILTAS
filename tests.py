"""Basic tests for CIVILTAS game logic."""

import pytest
from game.state import GameState, AGES
from game.resources import harvest
from game.buildings import build, can_afford
from game.population import consume_food, grow_population
from game.enlightenment import accumulate_enlightenment


# ---------------------------------------------------------------------------
# GameState
# ---------------------------------------------------------------------------

def test_initial_state():
    s = GameState()
    assert s.turn == 1
    assert s.population == 10
    assert s.age == AGES[0]
    assert not s.gnosis_unlocked


def test_age_advancement():
    s = GameState()
    s.enlightenment = 50
    advanced = s.advance_age_if_ready()
    assert advanced
    assert s.age_index == 1
    assert s.age == AGES[1]


def test_no_age_advancement_below_threshold():
    s = GameState()
    s.enlightenment = 49
    assert not s.advance_age_if_ready()
    assert s.age_index == 0


def test_gnosis_unlocked_at_final_age():
    s = GameState()
    s.age_index = 2
    s.enlightenment = 300
    s.advance_age_if_ready()
    assert s.age_index == 3
    assert s.gnosis_unlocked


# ---------------------------------------------------------------------------
# Resources
# ---------------------------------------------------------------------------

def test_harvest_increases_resources():
    s = GameState()
    before_food = s.food
    before_wood = s.wood
    gained = harvest(s)
    assert s.food > before_food
    assert s.wood > before_wood
    assert gained["food"] > 0
    assert gained["wood"] > 0


def test_farm_boosts_food():
    s1 = GameState()
    s2 = GameState()
    s2.buildings["Farm"] = 2
    harvest(s1)
    harvest(s2)
    assert s2.food > s1.food


# ---------------------------------------------------------------------------
# Buildings
# ---------------------------------------------------------------------------

def test_cannot_afford_when_broke():
    s = GameState()
    s.wood = 0
    s.stone = 0
    s.gold = 0
    assert not can_afford(s, "Farm")


def test_build_deducts_resources():
    s = GameState()
    s.wood = 100
    s.stone = 100
    s.gold = 100
    result = build(s, "Farm")
    assert result
    assert s.buildings.get("Farm") == 1
    assert s.wood < 100


def test_build_fails_if_insufficient():
    s = GameState()
    s.wood = 0
    assert not build(s, "Farm")
    assert "Farm" not in s.buildings


# ---------------------------------------------------------------------------
# Population
# ---------------------------------------------------------------------------

def test_consume_food_reduces_food():
    s = GameState()
    s.food = 100.0
    consumed = consume_food(s)
    assert consumed > 0
    assert s.food < 100.0


def test_grow_population_with_food():
    s = GameState()
    s.food = 100.0
    delta = grow_population(s)
    assert delta > 0
    assert s.population > 10


def test_starvation_shrinks_population():
    s = GameState()
    s.food = 0.0
    delta = grow_population(s)
    assert delta < 0
    assert s.population < 10


def test_population_never_below_one():
    s = GameState()
    s.population = 1
    s.food = 0.0
    grow_population(s)
    assert s.population >= 1


# ---------------------------------------------------------------------------
# Enlightenment
# ---------------------------------------------------------------------------

def test_no_enlightenment_without_buildings():
    s = GameState()
    gained = accumulate_enlightenment(s)
    assert gained == 0.0
    assert s.enlightenment == 0.0


def test_temple_adds_enlightenment():
    s = GameState()
    s.buildings["Temple"] = 1
    gained = accumulate_enlightenment(s)
    assert gained == 2.0


def test_library_adds_enlightenment():
    s = GameState()
    s.buildings["Library"] = 1
    gained = accumulate_enlightenment(s)
    assert gained == 5.0


def test_combined_enlightenment():
    s = GameState()
    s.buildings["Temple"] = 2
    s.buildings["Library"] = 3
    gained = accumulate_enlightenment(s)
    assert gained == 2 * 2.0 + 3 * 5.0  # 4 + 15 = 19
