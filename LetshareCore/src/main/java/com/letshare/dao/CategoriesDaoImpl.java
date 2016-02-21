package com.letshare.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import com.letshare.model.Category;
import com.letshare.model.Post;
import com.letshare.util.HibernateUtil;

/**
 * 
 * @author Kranti K C
 * Implements CategoriesDao, hence all the abstract methods related to Category are implemented 
 */
@Repository("categoriesDao")
public class CategoriesDaoImpl implements CategoriesDao {

	SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory

	@Override
	public int addCategory(Category category) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		int categoryId = (Integer) session.save(category);
		session.getTransaction().commit();
		session.close();
		return categoryId;
	}

	@Override
	public boolean updateCategory(Category category) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		session.saveOrUpdate(category);
		session.getTransaction().commit();
		session.close();
		return true;
	}

	@Override
	public List<Category> getCategories() {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<Category> categoriesList = session.createCriteria(Category.class).list();
		session.getTransaction().commit();
		session.close();
		return categoriesList;
	}

}
