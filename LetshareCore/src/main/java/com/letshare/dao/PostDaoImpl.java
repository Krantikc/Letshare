package com.letshare.dao;

import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.letshare.model.Post;
import com.letshare.util.HibernateUtil;

/**
 * 
 * @author Kranti K C
 * Implements PostDao, hence all the abstract methods related to Post are implemented 
 */
@Repository("postDao")
public class PostDaoImpl implements PostDao{
	

	SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory

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
	 * Updates post from post obj
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
	
	/**
	 * Fetches posts by searchTitle, category, city
	 * @return List<Post>  List of posts
	 */
	public List<Post> getPosts(String searchTitle, int cityId, int categoryId) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		//Restrictions 
		Criteria postCrit = session.createCriteria(Post.class, "post");
		
		postCrit = postCrit.add(Restrictions.like("post.title", searchTitle.trim()+"%", MatchMode.ANYWHERE));

		if (cityId != 0) {
			System.out.println("city filter");
			postCrit.createAlias("post.postLocation", "postLocation");
			postCrit = postCrit.add(Restrictions.eq("postLocation.city1Id", cityId));
		}
		
		if (categoryId != 0) {
			System.out.println("category filter");
			postCrit = postCrit.add(Restrictions.eq("post.categoryId", categoryId));
		}
			
		List<Post> postsList = postCrit.list();
		session.getTransaction().commit();
		session.close();
		return postsList;
	}

	/**
	 * Fetches post by Post id
	 * @return Post  
	 */
	@Override
	public Post getPost(int postId) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		Post post = (Post) session.createCriteria(Post.class)
							.add(Restrictions.eq("postId", postId))
						    .uniqueResult();
		session.getTransaction().commit();
		session.close();
		return post;
	}
	
}
