package com.letshare.REST;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.letshare.dao.CityDao;
import com.letshare.dao.LocationDao;
import com.letshare.model.City;
import com.letshare.model.Location;
import com.letshare.model.Post;
import com.letshare.services.PostService;

@Path("city")
@Component
public class CityAPI {

	@Autowired
	CityDao cityDao;

	
	@GET
    @Produces("application/json")
	public Response getAllLocations() {
		Map<String, Object> response = new HashMap<String, Object>();
		List<City> citiesList = cityDao.getCities();
		response.put("cities", citiesList);
        return Response.ok(response).build();
	}
	
}
