import {
  Outlet,
  redirect
} from "react-router";


import { Provider } from "react-redux";
import { store } from "./store/store";
import { useNavigation } from "react-router";
import { GlobalSpiner } from "./features/globalSpiner";
import { Layout } from "./Layout";
import { Navigation } from "./Navigate";
import { useRefreshTokenQuery, useValidUserQuery } from "./api/api";






export function Root() {

  
  return (
    <Provider store={store}>
      <Layout>
        <App/>
      </Layout>
    </Provider>
  );
}
function refresh () {
  const { data } = useRefreshTokenQuery(undefined,{
    pollingInterval: Infinity,
    skip: false,
    refetchOnMountOrArgChange: false
  })
  console.log(data)
}
export function App () {
  const navigation = useNavigation();
  const isNavgation = Boolean(navigation.location);
  const { data } = useValidUserQuery(undefined,{
      pollingInterval: 15* 60 * 1000,
      skip:false,
      refetchOnMountOrArgChange: false
    })
    console.log(data)
    if (!data) {
       refresh()
    }
  return (
    <>
      <Navigation/>
      {isNavgation && <GlobalSpiner />}
      <Outlet />
    </>
  )
}
 
export default Root;