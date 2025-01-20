import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Table, Button, Modal, Input, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from './RecipeList.module.css';

interface Recipe {
    id: number;
    title: string;
    image: string;
}

export const RecipeList: React.FC = () => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const ITEMS_PER_PAGE = 10;
    const currentPage = useRef<number>(1);

    useEffect(() => {
        fetchRecipes(1);
    }, []);

    useEffect(() => {
        localStorage.setItem("recipes", JSON.stringify(recipes));
    }, [recipes]);

    const fetchRecipes = async (page: number) => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get("https://api.spoonacular.com/recipes/complexSearch", {
                params: {
                    offset: (page - 1) * ITEMS_PER_PAGE,
                    number: ITEMS_PER_PAGE,
                    apiKey: "001d97fb96ae4b0095950674513925c5",
                },
            });

            const newRecipes = response.data.results;
            setRecipes((prev) => [...prev, ...newRecipes]);

            if (newRecipes.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
        } catch (err) {
            setError("Ошибка при загрузке рецептов: " + (err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRecipe = (id: number) => {
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
        message.success("Рецепт удален");
    };

    const editRecipe = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setIsModalVisible(true);
    };

    const saveRecipe = () => {
        if (editingRecipe) {
            setRecipes((prev) =>
                prev.map((recipe) =>
                    recipe.id === editingRecipe.id ? editingRecipe : recipe
                )
            );
            message.success("Рецепт обновлен");
        }
        setIsModalVisible(false);
        setEditingRecipe(null);
    };

    const debounce = (callback: () => void, delay: number) => {
        const timeoutRef = useRef<number | null>(null);

        const debouncedCallback = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(callback, delay);
        };

        useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        return debouncedCallback;
    };

    // Дебаунс обработчик прокрутки
    const handleScroll = debounce(() => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 100 &&
            hasMore &&
            !isLoading
        ) {
            currentPage.current += 1;
            fetchRecipes(currentPage.current);
        }
    }, 200);

    useEffect(() => {
        const onScroll = () => handleScroll();

        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [handleScroll]);

    const columns = [
        {
            title: "Изображение",
            dataIndex: "image",
            key: "image",
            render: (text: string) => (
                <img src={text} alt="recipe" style={{ width: "80px", borderRadius: "8px" }} />
            ),
        },
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Действия",
            key: "actions",
            render: (_: unknown, record: Recipe) => (
                <>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => editRecipe(record)}
                        style={{ marginRight: 8 }}
                    >
                        Редактировать
                    </Button>
                    <Button
                        icon={<DeleteOutlined />}
                        onClick={() => deleteRecipe(record.id)}
                        danger
                    >
                        Удалить
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <h1>Список рецептов</h1>
            {isLoading && currentPage.current === 1 ? (
                <p className={styles.loadingText}>Загрузка рецептов...</p>
            ) : error ? (
                <p className={styles.errorText}>{error}</p>
            ) : (
                <Table
                    dataSource={recipes.map((recipe, index) => ({
                        ...recipe,
                        key: `${recipe.id}-${index}`,
                    }))}
                    columns={columns}
                    pagination={false}
                    bordered
                />
            )}

            <Modal
                title="Редактировать рецепт"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={saveRecipe}
            >
                {editingRecipe && (
                    <div>
                        <label>Название:</label>
                        <Input
                            value={editingRecipe.title}
                            onChange={(e) =>
                                setEditingRecipe({ ...editingRecipe, title: e.target.value })
                            }
                            placeholder="Введите название"
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};
