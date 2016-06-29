package com.letshare.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import com.letshare.model.Location;
import com.letshare.util.HibernateUtil;

@Repository("objectDao")
public class ObjectDAOImpl implements ObjectDAO {
	
	SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory

	@Override
	public Object getObjectById(Object object, int id) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		Object newObject = session.get(object.getClass(), id);
		session.getTransaction().commit();
		session.close();
		return newObject;
	}

}
