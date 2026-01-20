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
import { CreateUser } from '../createUser/createUser';

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
  const { data: posts = []} = useGetPostsQuery(1,{
    pollingInterval: Infinity,
    skip:false,
    refetchOnMountOrArgChange: false
  })

  return (
    <div>
      <h2>Counter: {count}</h2>
      <h2>Status: {status}</h2>
      <p>Users:{users.map((user) => (
        <li key={user.id}>{user.name}--- Phone:{user.phone}</li>
        ))}
      </p>
      <span>
        Posts: {posts.map((post) => (
          <li key={post.id}>{post.title} --- {post.body}</li>
        ))}
      </span>
      <div>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(decrement())}>-</button>
        <button onClick={() => dispatch(reset())}>Reset</button>
      </div>
      <div>
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

