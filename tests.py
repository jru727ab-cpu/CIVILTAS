"""Comprehensive test suite for CIVILTAS game engine."""

import pytest
from game.state import GameState, AGES, ENLIGHTENMENT_THRESHOLDS
from game.resources import harvest
from game.buildings import build, can_afford, BUILDING_COSTS
from game.population import consume_food, grow_population
from game.enlightenment import accumulate_enlightenment


class TestGameState:
    """Tests for GameState initialization and properties."""

    def test_initial_state(self):
        """Test default game state initialization."""
        state = GameState()
        assert state.turn == 1
        assert state.population == 10
        assert state.food == 30.0
        assert state.wood == 20.0
        assert state.stone == 10.0
        assert state.gold == 0.0
        assert state.enlightenment == 0.0
        assert state.age_index == 0
        assert state.gnosis_unlocked is False

    def test_age_property(self):
        """Test that age property returns correct age string."""
        state = GameState()
        assert state.age == "Age of Survival"
        state.age_index = 1
        assert state.age == "Age of Society"
        state.age_index = 3
        assert state.age == "Age of Gnosis"

    def test_advance_age_if_ready_no_enlightenment(self):
        """Test that age doesn't advance without sufficient enlightenment."""
        state = GameState()
        state.enlightenment = 25.0  # Below threshold of 50
        advanced = state.advance_age_if_ready()
        assert advanced is False
        assert state.age_index == 0
        assert state.gnosis_unlocked is False

    def test_advance_age_if_ready_single_threshold(self):
        """Test age advancement across single threshold."""
        state = GameState()
        state.enlightenment = 50.0  # First threshold
        advanced = state.advance_age_if_ready()
        assert advanced is True
        assert state.age_index == 1
        assert state.age == "Age of Society"
        assert state.gnosis_unlocked is False

    def test_advance_age_skips_to_highest_eligible_age(self):
        """Test that sufficient enlightenment skips multiple age thresholds."""
        state = GameState()
        state.enlightenment = 150.0  # Threshold for age index 2
        advanced = state.advance_age_if_ready()
        assert advanced is True
        assert state.age_index == 2
        assert state.age == "Age of Reason"
        assert state.gnosis_unlocked is False

    def test_high_enlightenment_from_start_unlocks_gnosis(self):
        """Test that 300+ enlightenment unlocks Gnosis from start."""
        state = GameState()
        state.enlightenment = 300.0
        advanced = state.advance_age_if_ready()
        assert advanced is True
        assert state.age_index == 3
        assert state.age == "Age of Gnosis"
        assert state.gnosis_unlocked is True

    def test_gnosis_only_unlocked_at_final_age(self):
        """Test that Gnosis is only unlocked when reaching age 3."""
        state = GameState()
        state.enlightenment = 150.0
        state.advance_age_if_ready()
        assert state.gnosis_unlocked is False
        state.enlightenment = 300.0
        state.advance_age_if_ready()
        assert state.gnosis_unlocked is True


class TestResourceHarvesting:
    """Tests for resource harvesting mechanics."""

    def test_base_harvest_no_buildings(self):
        """Test resource harvesting with no buildings."""
        state = GameState()
        initial_food = state.food
        gained = harvest(state)
        assert gained["food"] == 10 * 2.0  # 10 population * 2.0 base
        assert gained["wood"] == 10 * 1.5  # 10 population * 1.5 base
        assert gained["stone"] == 10 * 1.0  # 10 population * 1.0 base
        assert gained["gold"] == 10 * 0.5  # 10 population * 0.5 base

    def test_harvest_with_farm(self):
        """Test that farms boost food production."""
        state = GameState()
        state.buildings["Farm"] = 1
        gained = harvest(state)
        expected_food = 10 * 2.0 + 1 * 5.0  # Base + farm bonus
        assert gained["food"] == expected_food

    def test_harvest_with_mine(self):
        """Test that mines boost stone and gold production."""
        state = GameState()
        state.buildings["Mine"] = 1
        gained = harvest(state)
        expected_stone = 10 * 1.0 + 1 * 3.0
        expected_gold = 10 * 0.5 + 1 * 2.0
        assert gained["stone"] == expected_stone
        assert gained["gold"] == expected_gold

    def test_harvest_with_multiple_buildings(self):
        """Test harvesting with multiple building types."""
        state = GameState()
        state.buildings["Farm"] = 2
        state.buildings["Mine"] = 1
        gained = harvest(state)
        assert gained["food"] == 10 * 2.0 + 2 * 5.0
        assert gained["stone"] == 10 * 1.0 + 1 * 3.0

    def test_harvest_minimum_population(self):
        """Test harvesting with zero population uses minimum of 1."""
        state = GameState()
        state.population = 0
        gained = harvest(state)
        assert gained["food"] == 1 * 2.0
        assert gained["wood"] == 1 * 1.5


class TestBuildings:
    """Tests for building construction mechanics."""

    def test_can_afford_initial_resources(self):
        """Test affordability check with initial resources."""
        state = GameState()
        # Farm costs: 10 wood, 5 stone, 0 gold, 0 food
        assert can_afford(state, "Farm") is True
        # Mine costs: 15 wood, 10 stone
        assert can_afford(state, "Mine") is True
        # Temple costs: 20 wood, 15 stone, 5 gold
        assert can_afford(state, "Temple") is False  # No gold

    def test_build_farm_success(self):
        """Test successful farm construction."""
        state = GameState()
        initial_wood = state.wood
        initial_stone = state.stone
        success = build(state, "Farm")
        assert success is True
        assert state.buildings["Farm"] == 1
        assert state.wood == initial_wood - 10
        assert state.stone == initial_stone - 5

    def test_build_insufficient_resources(self):
        """Test that build fails without sufficient resources."""
        state = GameState()
        state.gold = 0
        success = build(state, "Temple")  # Needs 5 gold
        assert success is False
        assert "Temple" not in state.buildings

    def test_build_multiple_same_building(self):
        """Test building multiple of the same building type."""
        state = GameState()
        build(state, "Farm")
        build(state, "Farm")
        assert state.buildings["Farm"] == 2

    def test_invalid_building_name(self):
        """Test that invalid building names fail safely."""
        state = GameState()
        success = build(state, "InvalidBuilding")
        assert success is False


class TestPopulation:
    """Tests for population mechanics."""

    def test_consume_food_normal(self):
        """Test food consumption during normal conditions."""
        state = GameState()
        initial_food = state.food
        consumed = consume_food(state)
        expected_consumed = 10 * 1.5  # 10 pop * 1.5 food per citizen
        assert consumed == expected_consumed
        assert state.food == initial_food - expected_consumed

    def test_consume_food_clamps_to_zero(self):
        """Test that food consumption doesn't go negative."""
        state = GameState()
        state.food = 5.0
        state.population = 10  # Needs 15 food
        consumed = consume_food(state)
        assert state.food == 0.0
        assert consumed == 5.0

    def test_grow_population_with_food(self):
        """Test population growth when well-fed."""
        state = GameState()
        state.food = 100.0  # Plenty of food
        delta = grow_population(state)
        expected_growth = max(1, int(10 * 0.10))  # 10% growth
        assert delta == expected_growth
        assert state.population == 10 + expected_growth

    def test_shrink_population_starvation(self):
        """Test population shrinks when starving."""
        state = GameState()
        state.food = 0.0
        initial_pop = state.population
        delta = grow_population(state)
        expected_loss = max(1, int(10 * 0.05))  # 5% loss
        assert delta == -expected_loss
        assert state.population == initial_pop - expected_loss

    def test_population_minimum_one(self):
        """Test population never drops below 1."""
        state = GameState()
        state.population = 1
        state.food = 0.0
        delta = grow_population(state)
        assert state.population >= 1


class TestEnlightenment:
    """Tests for enlightenment mechanics."""

    def test_no_enlightenment_without_buildings(self):
        """Test no enlightenment without temples or libraries."""
        state = GameState()
        gained = accumulate_enlightenment(state)
        assert gained == 0.0
        assert state.enlightenment == 0.0

    def test_enlightenment_from_temple(self):
        """Test enlightenment accumulation from temples."""
        state = GameState()
        state.buildings["Temple"] = 1
        gained = accumulate_enlightenment(state)
        assert gained == 2.0  # 1 temple * 2.0 per temple
        assert state.enlightenment == 2.0

    def test_enlightenment_from_library(self):
        """Test enlightenment accumulation from libraries."""
        state = GameState()
        state.buildings["Library"] = 1
        gained = accumulate_enlightenment(state)
        assert gained == 5.0  # 1 library * 5.0 per library
        assert state.enlightenment == 5.0

    def test_enlightenment_from_multiple_buildings(self):
        """Test enlightenment from both temples and libraries."""
        state = GameState()
        state.buildings["Temple"] = 2
        state.buildings["Library"] = 1
        gained = accumulate_enlightenment(state)
        expected = 2 * 2.0 + 1 * 5.0  # 4 + 5 = 9
        assert gained == expected
        assert state.enlightenment == expected

    def test_enlightenment_accumulates(self):
        """Test that enlightenment accumulates over multiple turns."""
        state = GameState()
        state.buildings["Temple"] = 1
        accumulate_enlightenment(state)
        assert state.enlightenment == 2.0
        accumulate_enlightenment(state)
        assert state.enlightenment == 4.0


class TestGameBalance:
    """Integration tests for game balance and progression."""

    def test_early_game_path_to_first_age(self):
        """Test viable path to reach Age of Society."""
        state = GameState()
        # Build temples to accumulate enlightenment
        for _ in range(25):  # Build 25 temples
            build(state, "Temple")
            harvest(state)
            consume_food(state)
            grow_population(state)
            accumulate_enlightenment(state)
            if state.enlightenment >= 50:
                break
        state.advance_age_if_ready()
        assert state.age_index >= 1

    def test_gnosis_victory_condition(self):
        """Test that Gnosis can be achieved through gameplay."""
        state = GameState()
        # Simulate building libraries for enlightenment
        for turn in range(100):
            # Harvest and consume resources
            harvest(state)
            consume_food(state)
            grow_population(state)
            
            # Build libraries when affordable
            if can_afford(state, "Library"):
                build(state, "Library")
            
            # Accumulate enlightenment
            accumulate_enlightenment(state)
            state.advance_age_if_ready()
            state.turn += 1
            
            if state.gnosis_unlocked:
                break
        
        assert state.gnosis_unlocked is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
