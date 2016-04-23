package com.letshare.dao;

import java.util.List;
import com.letshare.model.City;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to City
 */
public interface CityDao {
	public int addCity(City city);
	public boolean updateCity(City city);
	public List<City> getCities();
	List<City> getCitiesByPattern(String pattern);
	public City getCity(int cityId);
}
