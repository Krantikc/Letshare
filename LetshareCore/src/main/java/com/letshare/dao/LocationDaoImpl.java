package com.letshare.dao;

import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;

import com.letshare.model.City;
import com.letshare.model.Location;
import com.letshare.util.HibernateUtil;

@Repository("locationDao")
public class LocationDaoImpl implements LocationDao{

	SessionFactory sessionFactory = HibernateUtil.getSessionFactory(); // Singleton instance of Session Factory

	@Override
	public List<Location> getLocations() {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<Location> locationsList = session.createCriteria(Location.class).list();
		session.getTransaction().commit();
		session.close();
		return locationsList;
	}

	@Override
	public List<Location> getLocationsByCity(int cityId) {
		Session session = sessionFactory.openSession();
		session.beginTransaction();
		List<Location> locationsList = session.createCriteria(Location.class)
											  .add(Restrictions.eq("cityId", cityId))
											  .list();
		session.getTransaction().commit();
		session.close();
		return locationsList;
	}

}
