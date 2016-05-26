package com.letshare.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;

import com.letshare.model.Category;
import com.letshare.model.CategoryField;
import com.letshare.model.Post;
import com.letshare.util.HibernateUtil;

/**
 * 
 * @author Kranti K C
 * Implements CategoriesDao, hence all the abstract methods related to CategoryField are implemented 
 */
@Repository("categoryFieldsDao")
public class CategoryFieldsDaoImpl implements CategoryFieldsDao{


	SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory

	@Override
	public int addCategoryField(CategoryField categoryField) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public boolean updateCategoryField(CategoryField categoryField) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public List<CategoryField> getCategoryFieldsByCategoryId(int categoryId) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<CategoryField> categoryFields = session.createCriteria(CategoryField.class)
							.add(Restrictions.eq("categoryId", categoryId))
						    .list();
		session.getTransaction().commit();
		session.close();
		return categoryFields;
	}
	

}
