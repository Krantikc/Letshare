package com.letshare.dao;

import java.util.List;
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
	public Post getPost(int postId);
}
