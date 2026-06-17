import { useState } from "react";
import { NavLink } from "react-router";
import { useAppSelector } from "./store/hooks";
import { selectLogin } from "./features/account/accountSlice";
import { useGetAdminMeQuery } from "./api/api";
import {
  IconBot,
  IconClose,
  IconHome,
  IconLogin,
  IconLogout,
  IconMenu,
  IconShield,
  IconSparkle,
  IconUser,
} from "./components/icons";
import s from "./Navigate.module.css";

function navClass(isActive: boolean): string {
  return isActive ? `${s.nav} ${s.navActive}` : s.nav;
}

export const Navigation = () => {
  const isLoggedIn = useAppSelector(selectLogin);
  const { data: adminMe } = useGetAdminMeQuery(undefined, { skip: !isLoggedIn });
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={s.header}>
      <NavLink to="/" className={s.brand} onClick={closeMenu}>
        <IconSparkle className={s.brandIcon} size={20} />
        <span>TsundereChanAI</span>
      </NavLink>

      <button
        type="button"
        className={s.menuBtn}
        aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
      </button>

      <nav className={menuOpen ? `${s.navWrap} ${s.navWrapOpen}` : s.navWrap} aria-label="Основная навигация">
        <NavLink className={({ isActive }) => navClass(isActive)} to="/" onClick={closeMenu}>
          <IconHome size={16} />
          Главная
        </NavLink>
        <NavLink className={({ isActive }) => navClass(isActive)} to="/channels" onClick={closeMenu}>
          <IconBot size={16} />
          Каналы и бот
        </NavLink>
        {adminMe?.isAdmin ? (
          <NavLink className={({ isActive }) => navClass(isActive)} to="/admin" onClick={closeMenu}>
            <IconShield size={16} />
            Админ
          </NavLink>
        ) : null}
        <NavLink className={({ isActive }) => navClass(isActive)} to="/profile" onClick={closeMenu}>
          <IconUser size={16} />
          Профиль
        </NavLink>
        {isLoggedIn ? (
          <NavLink className={`${s.nav} ${s.navLogout}`} to="/logout" onClick={closeMenu}>
            <IconLogout size={16} />
            Выйти
          </NavLink>
        ) : (
          <NavLink className={({ isActive }) => `${navClass(isActive)} ${s.navLogin}`} to="/login" onClick={closeMenu}>
            <IconLogin size={16} />
            Войти
          </NavLink>
        )}
      </nav>
    </header>
  );
};
