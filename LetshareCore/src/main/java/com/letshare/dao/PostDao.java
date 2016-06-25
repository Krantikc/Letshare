package com.letshare.dao;

import java.util.List;

import com.letshare.helper.PostFilter;
import com.letshare.model.Post;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to Post
 */
public interface PostDao {
	public int addPost(Post post);
	public boolean updatePost(Post post);
	public List<Post> getPosts();
	public List<Post> getPosts(String searchTitle, int cityId, int categoryId);
	public List<Post> getPosts(PostFilter postFilter);
	public List<Post> getPostsByUser( int userId, boolean active);
	public Post getPost(int postId);
}
