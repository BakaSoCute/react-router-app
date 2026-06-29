import { Outlet, useLocation, useNavigation } from "react-router";
import "./global.css";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { Navigation } from "./Navigate";
import { useAuth } from "./hooks/useAuth";
import { AppLoader } from "./components/AppLoader";
import { HydrateFallback } from "./components/HydrateFallback";

export { Layout } from "./Layout";
export { HydrateFallback };

export default function Root() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

function isAuthProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/channels") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/logout")
  );
}

function App() {
  const navigation = useNavigation();
  const location = useLocation();
  const isNavigation = Boolean(navigation.location);
  const { isBootstrapping } = useAuth();

  const authProtected = isAuthProtectedPath(location.pathname);
  const showAuthLoader = authProtected && isBootstrapping;

  return (
    <>
      <Navigation isNavigating={isNavigation} />
      {showAuthLoader ? <AppLoader /> : <Outlet />}
    </>
  );
}
