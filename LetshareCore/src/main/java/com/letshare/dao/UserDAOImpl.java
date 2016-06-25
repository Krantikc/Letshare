package com.letshare.dao;

import java.math.BigInteger;
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
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		User user = (User) session.get(User.class, userId);
		session.getTransaction().commit();
		session.close();
		return user;
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
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		session.saveOrUpdate(user);
		session.getTransaction().commit();
		session.close();
		return true;
	}

	@Override
	public boolean deleteUser(User user) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public User findUserByEmail(String email) throws Exception{
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		User user = (User) session.createCriteria(User.class)
												 .add(Restrictions.eq("email", email))
												 .uniqueResult();
		session.getTransaction().commit();
		session.close();
		return user;
	}
	
	@Override
	public User findUserByMobile(BigInteger mobile) throws Exception{
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		User user = (User) session.createCriteria(User.class)
												 .add(Restrictions.eq("mobile", mobile))
												 .uniqueResult();
		session.getTransaction().commit();
		session.close();
		return user;
	}

	@Override
	public User getUserByToken(String token) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		User user = (User) session.createCriteria(User.class)
												 .add(Restrictions.eq("authorizationToken", token))
												 .uniqueResult();
		session.getTransaction().commit();
		session.close();
		return user;
	}


}
