package com.letshare.dao;

import java.util.List;

import com.letshare.model.City;
import com.letshare.model.Location;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to Location
 */
public interface LocationDao {
	public List<Location> getLocations();
	List<Location> getLocationsByCity(int cityId);
	
}
