package com.letshare.dao;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.List;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.MatchMode;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.letshare.helper.PostFilter;
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

	@Override
	public List<Post> getPostsByUser(int userId, boolean active) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<Post> postsList = session.createCriteria(Post.class).
								add(Restrictions.eq("userId", userId)).
								add(Restrictions.eq("active", active)).list();
		session.getTransaction().commit();
		session.close();
		return postsList;
	}

	@Override
	public List<Post> getPosts(PostFilter postFilter) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		//Restrictions 
		Criteria postCrit = session.createCriteria(Post.class, "post");

		postCrit = postCrit.add(Restrictions.eq("post.active", postFilter.isActive()));
		
		if (postFilter.getTitle() != null) {
			postCrit = postCrit.add(Restrictions.like("post.title", "%" + postFilter.getTitle().trim() + "%", MatchMode.ANYWHERE));	
		}
		
		if (postFilter.getPostType() != null && !postFilter.getPostType().equals("")) {
			System.out.println("post type filter");
			postCrit = postCrit.add(Restrictions.eq("post.postType", postFilter.getPostType()));
		}
		
		
		if (postFilter.getCategoryId() != 0) {
			System.out.println("category filter");
			postCrit = postCrit.add(Restrictions.eq("post.categoryId", postFilter.getCategoryId()));
		}
		
		postCrit.createAlias("post.postLocation", "postLocation");
		
		if (postFilter.getCity1Id() != 0) {
			System.out.println("city1 filter");
			postCrit = postCrit.add(Restrictions.eq("postLocation.city1Id", postFilter.getCity1Id()));
		}
		
		if (postFilter.getLocation1Id() != 0) {
			System.out.println("location1 filter");
			postCrit = postCrit.add(Restrictions.eq("postLocation.location1Id", postFilter.getLocation1Id()));
		}
		
		if (postFilter.getCity2Id() != 0) {
			System.out.println("city2 filter");
			postCrit = postCrit.add(Restrictions.eq("postLocation.city2Id", postFilter.getCity2Id()));
		}
		
		if (postFilter.getLocation2Id() != 0) {
			System.out.println("location2 filter");
			postCrit = postCrit.add(Restrictions.eq("postLocation.location2Id", postFilter.getLocation2Id()));
		}
		
		if (postFilter.getProcessDate() != null) {
			System.out.println("location2 filter");
			DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
			String journeyDtStr = dateFormat.format(postFilter.getProcessDate());
			postCrit = postCrit.add(Restrictions.eq("post.processDate", postFilter.getProcessDate()));
		}
		
		
		
		postCrit.setFirstResult(postFilter.getStart());
		postCrit.setMaxResults(postFilter.getSize());
			
		List<Post> postsList = postCrit.list();
		session.getTransaction().commit();
		session.close();
		return postsList;
	}
	
}
