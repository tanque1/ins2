import React, { useEffect, useState } from "react";
import { ImSpinner3 } from "react-icons/im";
import { getDataApi } from "../../api/userApi";
import LoadMoreBtn from "../LoadMoreBtn";
import PostThumb from "../PostThumb";

export default function Post({ auth, id, dispatch, profile, data = {} }) {
  const [posts, setPosts] = useState([]);
  const [result, setResult] = useState(9);
  const [page, setPage] = useState(2);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    setPosts([...data?.posts]);
    setResult(data?.result);
    return () => setPosts([]);
  }, [data, id]);
  const handleLoadMore = async () => {
    try {
      setLoad(true);
      const res = await getDataApi(
        `user_posts/${id}?limit=${page * 9}`,
        auth.token
      );
      setPosts([...res.data?.posts]);
      setResult(res.data.result);
      setPage((pre) => pre + 1);
      setLoad(false);
    } catch (error) {
      setLoad(false);
    }
  };
  return (
    <div className="">
      {load ? (
        <ImSpinner3
          size={40}
          className="animate-spin dark:text-white text-primary block mx-auto my-3"
        />
      ) : (
        <>
          <PostThumb posts={posts} result={result} />
        </>
      )}
      {posts.length !== 0 && (
        <LoadMoreBtn
          result={result}
          page={page}
          handleLoadMore={handleLoadMore}
          load={load}
        />
      )}
    </div>
  );
}
