import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Table, Button, Modal, Input, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import styles from "./RecipeList.module.css";
export const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;
    const currentPage = useRef(1);
    useEffect(() => {
        fetchRecipes(1);
    }, []);
    useEffect(() => {
        localStorage.setItem("recipes", JSON.stringify(recipes));
    }, [recipes]);
    const fetchRecipes = async (page) => {
        if (isLoading || !hasMore)
            return;
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
        }
        catch (err) {
            setError("Ошибка при загрузке рецептов: " + err.message);
        }
        finally {
            setIsLoading(false);
        }
    };
    const deleteRecipe = (id) => {
        setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
        message.success("Рецепт удален");
    };
    const editRecipe = (recipe) => {
        setEditingRecipe(recipe);
        setIsModalVisible(true);
    };
    const saveRecipe = () => {
        if (editingRecipe) {
            setRecipes((prev) => prev.map((recipe) => recipe.id === editingRecipe.id ? editingRecipe : recipe));
            message.success("Рецепт обновлен");
        }
        setIsModalVisible(false);
        setEditingRecipe(null);
    };
    const debounce = (callback, delay) => {
        const timeoutRef = useRef(null);
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
        if (window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 100 &&
            hasMore &&
            !isLoading) {
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
            render: (text) => (_jsx("img", { src: text, alt: "recipe", style: { width: "80px", borderRadius: "8px" } })),
        },
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Действия",
            key: "actions",
            render: (_, record) => (_jsxs(_Fragment, { children: [_jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => editRecipe(record), style: { marginRight: 8 }, children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" }), _jsx(Button, { icon: _jsx(DeleteOutlined, {}), onClick: () => deleteRecipe(record.id), danger: true, children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })),
        },
    ];
    return (_jsxs("div", { className: styles.container, children: [_jsx("h1", { children: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0432" }), isLoading && currentPage.current === 1 ? (_jsx("p", { className: styles.loadingText, children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0440\u0435\u0446\u0435\u043F\u0442\u043E\u0432..." })) : error ? (_jsx("p", { className: styles.errorText, children: error })) : (_jsx(Table, { dataSource: recipes.map((recipe, index) => ({
                    ...recipe,
                    key: `${recipe.id}-${index}`,
                })), columns: columns, pagination: false, bordered: true })), _jsx(Modal, { title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0440\u0435\u0446\u0435\u043F\u0442", open: isModalVisible, onCancel: () => setIsModalVisible(false), onOk: saveRecipe, children: editingRecipe && (_jsxs("div", { children: [_jsx("label", { children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435:" }), _jsx(Input, { value: editingRecipe.title, onChange: (e) => setEditingRecipe({ ...editingRecipe, title: e.target.value }), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" })] })) })] }));
};
