import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        render(_jsx(RecipeList, {}));
        expect(screen.getByText(/Загрузка рецептов/i)).toBeInTheDocument();
    });
    test("renders recipes after API call", async () => {
        mockAxios.onGet(/complexSearch/).reply(200, { results: mockRecipes });
        render(_jsx(RecipeList, {}));
        await waitFor(() => {
            expect(screen.getByText("Recipe 1")).toBeInTheDocument();
            expect(screen.getByText("Recipe 2")).toBeInTheDocument();
        });
    });
    test("handles API errors", async () => {
        mockAxios.onGet(/complexSearch/).reply(500);
        render(_jsx(RecipeList, {}));
        await waitFor(() => {
            expect(screen.getByText(/Ошибка при загрузке рецептов/i)).toBeInTheDocument();
        });
    });
    test("deletes a recipe", async () => {
        mockAxios.onGet(/complexSearch/).reply(200, { results: mockRecipes });
        render(_jsx(RecipeList, {}));
        await waitFor(() => screen.getByText("Recipe 1"));
        const deleteButton = screen.getAllByRole("button", { name: /удалить/i })[0];
        userEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.queryByText("Recipe 1")).not.toBeInTheDocument();
        });
    });
    test("opens and updates a recipe in the modal", async () => {
        mockAxios.onGet(/complexSearch/).reply(200, { results: mockRecipes });
        render(_jsx(RecipeList, {}));
        await waitFor(() => screen.getByText("Recipe 1"));
        const editButton = screen.getAllByRole("button", { name: /редактировать/i })[0];
        userEvent.click(editButton);
        await waitFor(() => {
            expect(screen.getByText("Редактировать рецепт")).toBeInTheDocument();
        });
        const input = screen.getByPlaceholderText(/Введите название/i);
        userEvent.clear(input);
        userEvent.type(input, "Updated Recipe 1");
        const saveButton = screen.getByRole("button", { name: /ок/i });
        userEvent.click(saveButton);
        await waitFor(() => {
            expect(screen.getByText("Updated Recipe 1")).toBeInTheDocument();
        });
    });
    test("loads more recipes on scroll", async () => {
        mockAxios.onGet(/complexSearch/).reply(200, { results: mockRecipes });
        render(_jsx(RecipeList, {}));
        await waitFor(() => screen.getByText("Recipe 1"));
        mockAxios.onGet(/complexSearch/, { params: { offset: 10, number: 10 } }).reply(200, {
            results: [{ id: 3, title: "Recipe 3", image: "image3.jpg" }],
        });
        fireEvent.scroll(window, { target: { scrollY: 1000 } });
        await waitFor(() => {
            expect(screen.getByText("Recipe 3")).toBeInTheDocument();
        });
    });
});
