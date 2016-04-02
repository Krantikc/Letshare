package com.letshare.services;

import java.util.List;

import com.letshare.model.Post;

public interface PostService {

	public List<Post> getAllPosts();
	public Post getPost(int postId);
	public int addPost(Post post);
}
