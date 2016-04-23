package com.letshare.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.letshare.model.City;
import com.letshare.model.Post;
import com.letshare.util.HibernateUtil;

/**
 * 
 * @author Kranti K C
 * Implements CityDao, hence all the abstract methods related to City are implemented 
 */
@Repository("cityDao")
public class CityDaoImpl implements CityDao{
	

	SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory


	@Override
	public int addCity(City city) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		int cityId = (Integer) session.save(city);
		session.getTransaction().commit();
		session.close();
		return cityId;
	}

	@Override
	public boolean updateCity(City city) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public List<City> getCities() {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<City> citiesList = session.createCriteria(City.class).list();
		session.getTransaction().commit();
		session.close();
		return citiesList;
	}

	@Override
	public City getCity(int cityId) {
		// TODO Auto-generated method stub
		return null;
	}
	
	@Override
	public List<City> getCitiesByPattern(String pattern) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<City> citiesList = session.createCriteria(City.class)
										.add(Restrictions.like("name", pattern))
										.list();
		session.getTransaction().commit();
		session.close();
		return citiesList;
	}
	
}
