import s from "./globalSpiner.module.css"
export const GlobalSpiner = () => {
    return (
        <div className={s.container}><span className={s.spinner}></span></div>
    )
}