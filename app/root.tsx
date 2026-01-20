import {
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import s from "./app.module.css";
import { Provider } from "react-redux";
import { store } from "./store/store";



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
          <Link to={"/"}>HomePage</Link>
          <Link to={"/addUser"}>AddUser</Link>
          <Link to={"/context/about"}>About</Link>
        </header>

        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
  <Provider store={store}>
    <Outlet />
  </Provider>
  )
}
