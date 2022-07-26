import {
  deleteDataApi,
  getDataApi,
  patchDataApi,
  postDataApi,
} from "../../api/userApi";

const { createSlice, createAsyncThunk } = require("@reduxjs/toolkit");

const updateData = (oldState, data) => {
  const newState = oldState.map((a) => {
    if (data._id === a._id) {
      return data;
    }
    return a;
  });
  return newState;
};

const deleteData = (oldState, data) => {
  const newState = oldState.filter((a) => {
    return data._id !== a._id;
  });
  return newState;
};

export const getPosts = createAsyncThunk(
  "getPosts",
  async (token, { rejectWithValue }) => {
    try {
      const res = await getDataApi("posts", token);
      return res?.data;
    } catch (error) {
      return rejectWithValue(error.response.data?.msg);
    }
  }
);

export const likePost = createAsyncThunk(
  "likePost",
  async ({ auth, post, socket, handleUpdatePost }, { rejectWithValue }) => {
    try {
      const newPost = { ...post, likes: [...post.likes, auth.profile] };
      handleUpdatePost && handleUpdatePost(newPost);
      await patchDataApi(`posts/${post._id}/like`, {}, auth.token);
      socket.emit("likePost", newPost);
      return newPost;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const unLikePost = createAsyncThunk(
  "unLikePost",
  async ({ auth, post, socket, handleUpdatePost }, { rejectWithValue }) => {
    try {
      const newLikes = post.likes?.filter(
        (like) => like._id !== auth.profile._id
      );
      const newPost = { ...post, likes: [...newLikes] };
      handleUpdatePost && handleUpdatePost(newPost);
      await patchDataApi(`posts/${post._id}/unlike`, {}, auth.token);
      socket.emit("unLikePost", newPost);
      return newPost;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const createComment = createAsyncThunk(
  "createComment",
  async ({ auth, post, newComment, socket }, { rejectWithValue }) => {
    try {
      const data = {
        ...newComment,
        postId: post._id,
        postUserId: post.user._id,
      };
      const res = await postDataApi("comment", data, auth.token);

      const newData = { ...res.data.newComment, user: auth.profile };
      const newPost = { ...post, comments: [...post.comments, newData] };

      socket.emit("createComment", newPost);
      return { newPost, newData };
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const updateComment = createAsyncThunk(
  "updateComment",
  async ({ post, content, comment, auth }, { rejectWithValue }) => {
    try {
      const newComment = post.comments.map((c) => {
        return c._id === comment._id ? { ...comment, content } : c;
      });
      const newPost = { ...post, comments: newComment };
      await patchDataApi(`comment/${comment._id}`, { content }, auth.token);
      return newPost;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const removeComment = createAsyncThunk(
  "removeComment",
  async ({ post, comment, auth, socket }, { rejectWithValue }) => {
    try {
      const deleteArr = [
        ...post.comments.filter((r) => r.reply === comment._id),
        comment,
      ];

      const newComment = post.comments.filter((c) => {
        return !deleteArr.find((da) => c._id === da._id);
      });
      const newPost = { ...post, comments: newComment };
      await Promise.all(
        deleteArr.map(async (c) => {
          await deleteDataApi(`comment/${c._id}`, auth.token);
          const msg = {
            id: c._id,
            text: comment.reply
              ? "đã trả lời bình luận của bạn"
              : "đã bình luận bài viết của bạn",
            recipients: comment.reply ? [comment.tag._id] : [post.user._id],
            url: `/post/${post._id}`,
          };
          socket.emit("deleteNotify", msg);
        })
      );

      socket.emit("deleteComment", newPost);
      return newPost;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const likeComment = createAsyncThunk(
  "likeComment",
  async ({ post, comment, auth }, { rejectWithValue }) => {
    try {
      const newComment = {
        ...comment,
        likes: [...comment.likes, auth.profile],
      };
      const newComments = post.comments.map((c) => {
        return c._id === comment._id ? newComment : c;
      });
      await patchDataApi(`comment/${comment._id}/like`, {}, auth.token);
      const newPost = { ...post, comments: newComments };
      return newPost;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);
export const unLikeComment = createAsyncThunk(
  "unLikeComment",
  async ({ post, comment, auth }, { rejectWithValue }) => {
    try {
      const newComment = {
        ...comment,
        likes: [
          ...comment.likes.filter((like) => like._id !== auth.profile._id),
        ],
      };
      const newComments = post.comments.map((c) => {
        return c._id === comment._id ? newComment : c;
      });
      await patchDataApi(`comment/${comment._id}/unlike`, {}, auth.token);

      const newPost = { ...post, comments: newComments };
      return newPost;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const deletePost = createAsyncThunk(
  "deletePost",
  async ({ auth, post }) => {
    try {
      await deleteDataApi(`posts/${post._id}`, auth.token);
      return post;
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

export const savePost = createAsyncThunk("savePost", async ({ auth, post }) => {
  try {
    await patchDataApi(`save-post/${post._id}`, null, auth.token);
  } catch (error) {
    throw new Error(error.response.data?.msg);
  }
});

export const unSavePost = createAsyncThunk(
  "unSavePost",
  async ({ auth, post }) => {
    try {
      await patchDataApi(`unsave-post/${post._id}`, null, auth.token);
    } catch (error) {
      throw new Error(error.response.data?.msg);
    }
  }
);

const postSlide = createSlice({
  name: "homePosts",
  initialState: {
    posts: [],
    result: 0,
    page: 2,
    loading: false,
  },
  reducers: {
    createPost(state, action) {
      const oldState = state.posts;
      state.posts = [action.payload, ...oldState];
    },
    updatePost(state, action) {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    loadMorePosts(state, action) {
      state.posts = action.payload.posts;
      state.page = state.page + 1;
      state.result = action.payload.result;
    },
  },
  extraReducers: {
    [getPosts.fulfilled]: (state, action) => {
      if (action.payload) {
        state.posts = [...action.payload.posts];
        state.result = action.payload.result;
      }
      state.loading = false;
    },
    [getPosts.pending]: (state, action) => {
      state.loading = true;
    },
    [getPosts.rejected]: (state, action) => {
      state.loading = false;
    },
    [likePost.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    [unLikePost.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    [createComment.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload.newPost);
      state.posts = newState;
    },
    [updateComment.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    [likeComment.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    [unLikeComment.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    [removeComment.fulfilled]: (state, action) => {
      const oldState = state.posts;
      const newState = updateData(oldState, action.payload);
      state.posts = newState;
    },
    [deletePost.fulfilled]: (state, action) => {
      const newState = deleteData(state.posts, action.payload);
      state.posts = newState;
      state.result = state.result - 1;
    },
    [savePost.fulfilled]: (state, action) => {
      console.log(action);
    },
  },
});

export default postSlide;
