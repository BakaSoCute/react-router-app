import { NavLink } from "react-router";
import { useAppSelector } from "./store/hooks";
import { selectLogin } from "./features/account/accountSlice";
import { useGetAdminMeQuery } from "./api/api";
import s from "./Navigate.module.css";

function navClass(isActive: boolean): string {
  return isActive ? `${s.nav} ${s.navActive}` : s.nav;
}

export const Navigation = () => {
  const isLoggedIn = useAppSelector(selectLogin);
  const { data: adminMe } = useGetAdminMeQuery(undefined, { skip: !isLoggedIn });
  return (
    <header className={s.header}>
      <span className={s.brand}>TsundereChanAI</span>
      <NavLink className={({ isActive }) => navClass(isActive)} to="/">
        Главная
      </NavLink>
      <NavLink className={({ isActive }) => navClass(isActive)} to="/channels">
        Каналы и бот
      </NavLink>
      {adminMe?.isAdmin ? (
        <NavLink className={({ isActive }) => navClass(isActive)} to="/admin">
          Админ
        </NavLink>
      ) : null}
      {/* <NavLink className={({ isActive }) => navClass(isActive)} to="/context/posts">
        Посты
      </NavLink> */}
      <NavLink className={({ isActive }) => navClass(isActive)} to="/profile">
        Профиль
      </NavLink>
      {isLoggedIn ? (
        <NavLink className={({ isActive }) => navClass(isActive)} to="/logout">
          Выйти
        </NavLink>
      ) : (
        <NavLink className={({ isActive }) => navClass(isActive)} to="/login">
          Войти
        </NavLink>
      )}
    </header>
  );
};