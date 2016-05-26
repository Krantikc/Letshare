package com.letshare.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.letshare.dao.PostDao;
import com.letshare.model.Post;

@Service("postService")
public class PostServiceImpl implements PostService{

	@Autowired
	PostDao postDao;
	
	public List<Post> getAllPosts() {
		// TODO Auto-generated method stub
		return postDao.getPosts();
	}

	@Override
	public Post getPost(int postId) {
		// TODO Auto-generated method stub
		return postDao.getPost(postId);
	}

	@Override
	public int addPost(Post post) {
		return postDao.addPost(post);
	}

	@Override
	public List<Post> getPosts(String searchTitle, int cityId, int categoryId) {
		// TODO Auto-generated method stub
		return postDao.getPosts(searchTitle, cityId, categoryId);
	}

}
