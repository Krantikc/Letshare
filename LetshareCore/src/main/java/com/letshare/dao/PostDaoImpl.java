package com.letshare.dao;

import java.util.List;

import org.hibernate.SessionFactory;
import org.hibernate.classic.Session;

import com.letshare.model.Post;
import com.letshare.util.HibernateUtil;

/**
 * 
 * @author Kranti K C
 * Implements PostDao, hence all the abstract methods related to Post are implemented 
 */
public class PostDaoImpl implements PostDao{
	static SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory

	/**
	 * Adds new post from post obj
	 * @return int   Returns postId of newly added post
	 */
	public int addPost(Post post) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		int postId = (Integer) session.save(post);
		session.getTransaction().commit();
		session.close();
		return postId;
	}

	/**
	 * Adds new post from post obj
	 * @return boolean   Returns true if update is successfull
	 */
	public boolean updatePost(Post post) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		session.saveOrUpdate(post);
		session.getTransaction().commit();
		session.close();
		return true;
	}

	/**
	 * Fetches all added posts
	 * @return List<Post>  All list of posts
	 */
	public List<Post> getPosts() {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<Post> postsList = session.createCriteria(Post.class).list();
		session.getTransaction().commit();
		session.close();
		return postsList;
	}
	
}
