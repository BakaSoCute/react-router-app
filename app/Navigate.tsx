import { NavLink } from "react-router"
import { useAppSelector } from "./store/hooks";
import { selectLogin } from "./features/account/accountSlice";
import s from "./app.module.css"

export const Navigation = () => {
    const isLoggedIn = useAppSelector(selectLogin);
    return (
        <header className={s.header}>
            <NavLink className={s.nav} to={"/"}>HomePage</NavLink>
            <NavLink className={s.nav} to={"/add-bot"}>Add-Bot</NavLink>
            <NavLink className={s.nav} to={"/context/posts"}>Posts</NavLink>
            {isLoggedIn ? 
            <NavLink className={s.nav} to={"/logout"}>Выйти из аккаунта</NavLink>
            :
            <NavLink className={s.nav} to={"/login"}>Войти в аккаунт</NavLink>          
          }
        </header>
    )
}