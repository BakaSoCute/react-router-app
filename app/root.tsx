import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
} from "react-router";

import s from "./app.module.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useNavigation } from "react-router";
import { GlobalSpiner } from "./features/globalSpiner";



export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className={s.header}>
          <NavLink className={s.nav} to={"/"}>HomePage</NavLink>
          <NavLink className={s.nav} to={"/addUser"}>AddUser</NavLink>
          <NavLink className={s.nav} to={"/context/posts"}>Posts</NavLink>
        </header>

        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation()
  const isNavgation = Boolean(navigation.location)
  return (
  <Provider store={store}>
    {isNavgation && <GlobalSpiner />}
    <Outlet />
  </Provider>
  )
}
