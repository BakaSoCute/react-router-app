import { useGetPostsQuery } from "~/api/api"

export const About = () => {
      const { data: posts = []} = useGetPostsQuery(1,{
        pollingInterval: Infinity,
        skip:false,
        refetchOnMountOrArgChange: false
      })
    return (
        <span>
            Posts: {posts.map((post) => (
              <li key={post.id}>{post.title} --- {post.body}</li>
            ))}
      </span>
    )
}