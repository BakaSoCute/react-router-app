import { Outlet, useNavigation } from "react-router";
import "./global.css";

import { Provider } from "react-redux";
import { store } from "./store/store";
import { GlobalSpiner } from "./features/globalSpiner";
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

function App() {
  const navigation = useNavigation();
  const isNavigation = Boolean(navigation.location);
  const { isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <AppLoader />;
  }

  return (
    <>
      <Navigation />
      {isNavigation && <GlobalSpiner />}
      <Outlet />
    </>
  );
}
