import { jsx as _jsx } from "react/jsx-runtime";
import style from '../Header/Header.module.css';
export const Header = () => {
    return (_jsx("div", { className: style.header, children: _jsx("h1", { children: "VK Tech: Test Frontend Project" }) }));
};
