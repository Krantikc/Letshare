package com.letshare.services;

import java.util.List;

import com.letshare.helper.PostFilter;
import com.letshare.model.Post;

public interface PostService {

	public List<Post> getAllPosts();
	public List<Post> getPosts(String searchTitle, int cityId, int categoryId);
	public List<Post> getPosts(PostFilter postFilter);
	public List<Post> getPostsByUser(int userId, boolean active);
	public Post getPost(int postId);
	public int addPost(Post post);
}
