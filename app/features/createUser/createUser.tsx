import React, { useState } from "react"
import { useAddUserMutation, useCreateUserMutation, useGetUsersQuery } from "../../api/api"
import s from "./createUser.module.css"


export const CreateUser: React.FC = () => {
    const [createUser, {isError,isLoading,isSuccess,error} ] = useCreateUserMutation()
    const [ addUser] = useAddUserMutation()
    const [formData, setFormData] = useState({name: "",email: "" })
    const [id, setId] = useState({channelId: ""})
    const {data: users= []} = useGetUsersQuery()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.length === 0 || formData.email.length === 0) {
            return console.error("заполните поля ")
        }
        try {
            await createUser(formData).unwrap()
            setFormData({name: "", email: ""})
        } catch (err) {
            console.error("error create user:", err)
        }
    }
    const handleSubmitTo = async (e:React.FormEvent) => {
        e.preventDefault()
        try {
            await addUser(id).unwrap()
            setId({channelId:""})
        } catch (err) {
            console.error("error add user:", err)
        }
    }
    

    return(
        <div>
            <h3>Создать пользователя</h3>
            <p>{users[0]?.name}</p>
            <form onSubmit={handleSubmit}className={s.container}>
                <input type="text"
                className={s.input}
                placeholder="Имя"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                 />
                <input type="email"
                placeholder="Email"
                className={s.input}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                 />
                <button type="submit" disabled={isLoading} className={s.button}>
                    {isLoading? "Создание..." : "Создать"}
                </button>
            </form>
            <form className={s.container} onSubmit={handleSubmitTo}>
                <input type="text"
                className={s.input}
                placeholder="Id"
                value={id.channelId}
                onChange={(e) => setId({...id, channelId: e.target.value})}
                 />
                 <button>Добавить</button>
            </form>

            {isSuccess && <div>Пользователь создан</div>}
            {isError && <div>Ошибка: {error.toString()}</div>}
        </div>
    )
}