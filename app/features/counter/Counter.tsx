import { useState } from 'react';
import { useAppDispatch, useAppSelector} from "../../store/hooks"
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
  selectCount,
  selectStatus,
} from './counterSlice';
import { useGetPostsQuery, useGetUsersQuery } from '../../api/api';
import s from "./Counter.module.css"

export const Counter: React.FC = () => {
  const dispatch = useAppDispatch();
  const count = useAppSelector(selectCount);
  const status = useAppSelector(selectStatus)
  const [amount, setAmount] = useState('2');
  const { data: users = []} = useGetUsersQuery(undefined,{
    pollingInterval: Infinity,
    skip:false,
    refetchOnMountOrArgChange: false
  })


  return (
    <div className={s.container}>
      <h2>Counter: {count}</h2>
      <h2>Status: {status}</h2>
      <ul className={s.users}>
        <p>Users:</p>
          {users.map((user) => (
          <li key={user.id}>{user.name}--- Phone:{user.phone}</li>
        ))}
      </ul>
      <div className={s.buttons}>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(decrement())}>-</button>
        <button onClick={() => dispatch(reset())}>Reset</button>
      </div>
      <div className={s.inputByInc}>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button
          onClick={() => dispatch(incrementByAmount(Number(amount) || 0))}
        >
          Add Amount
        </button>
      </div>
    </div>
  );
};

