import { Outlet } from "react-router";


import { Provider } from "react-redux";
import { store } from "./store/store";
import { useNavigation } from "react-router";
import { GlobalSpiner } from "./features/globalSpiner";
import { Layout } from "./Layout";
import { Navigation } from "./Navigate";
import { useAuth } from "./hooks/useAuth";






export function Root() {

  
  return (
    <Provider store={store}>
      <Layout>
        <App/>
      </Layout>
    </Provider>
  );
}
export function App() {
  const navigation = useNavigation();
  const isNavigation = Boolean(navigation.location);
  
  // Инициализация авторизации при загрузке приложения
  // Данные автоматически синхронизируются с Redux через extraReducers
  useAuth();

  return (
    <>
      <Navigation/>
      {isNavigation && <GlobalSpiner />}
      <Outlet />
    </>
  )
}
 
export default Root;