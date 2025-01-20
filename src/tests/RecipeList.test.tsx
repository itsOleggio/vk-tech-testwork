import React from 'react';
import { render, screen } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { RecipeList } from '../components';
import "@testing-library/jest-dom";

const mockAxios = new MockAdapter(axios);

const mockRecipes = [
    { id: 1, title: "Recipe 1", image: "image1.jpg" },
    { id: 2, title: "Recipe 2", image: "image2.jpg" },
];
describe("RecipeList Component", () => {
    beforeEach(() => {
        mockAxios.reset();
    });

    test("renders loading state", () => {
        mockAxios.onGet(/complexSearch/).reply(200, { results: mockRecipes });
        render(<RecipeList />);
        expect(screen.getByText(/Загрузка рецептов/i)).toBeInTheDocument();
    });

    test("displays recipes when loaded", async () => {
        mockAxios.onGet(/complexSearch/).reply(200, { results: mockRecipes });
        render(<RecipeList />);

        const recipeItems = await screen.findAllByRole('listitem');
        expect(recipeItems).toHaveLength(mockRecipes.length);
    });

    test("handles error state correctly", async () => {
        mockAxios.onGet(/complexSearch/).reply(500);
        render(<RecipeList />);

        expect(screen.getByText(/Ошибка загрузки рецептов/i)).toBeInTheDocument();
    });
});
