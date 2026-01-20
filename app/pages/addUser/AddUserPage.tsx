import { CreateUser } from "~/features/createUser/createUser"
import s from "./AddUserPage.module.css"

export const AddUserPage = () => {
    return (
        <div className={s.container}>
            <CreateUser/>
        </div>

    )
}