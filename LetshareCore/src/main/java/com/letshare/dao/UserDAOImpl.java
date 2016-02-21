package com.letshare.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.letshare.model.User;
import com.letshare.util.HibernateUtil;

@Repository("userDao")
public class UserDAOImpl implements UserDAO {

private SessionFactory sessionFactory = HibernateUtil.getSessionFactory();

	public User getUserByCredentials(String email, String password) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		User user = (User) session.createCriteria(User.class)
												 .add(Restrictions.eq("email", email))
												 .add(Restrictions.eq("password", password))
												 .uniqueResult();
		session.getTransaction().commit();
		session.close();
		return user;
	}
	
	public User getUserByUserId(int userId) {
		// TODO Auto-generated method stub
		return null;
	}
	
	public int createUser(User user) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		int userId = (int) session.save(user);
		session.getTransaction().commit();
		session.close();
		return userId;
	}

	@Override
	public boolean updateUser(User user) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean deleteUser(User user) {
		// TODO Auto-generated method stub
		return false;
	}

}
