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

import com.letshare.dao.LocationDao;
import com.letshare.model.Location;
import com.letshare.model.Post;
import com.letshare.services.PostService;

@Path("location")
@Component
public class LocationAPI {

	@Autowired
	LocationDao locationDao;

	
	@GET
    @Produces("application/json")
	public Response getAllLocations() {
		Map<String, Object> response = new HashMap<String, Object>();
		List<Location> locationsList = locationDao.getLocations();
		response.put("locations", locationsList);
        return Response.ok(response).build();
	}
	
	@GET
    @Produces("application/json")
	@Path("/{cityId}")
	public Response getLocationsByCity(@PathParam("cityId") int cityId) {
		Map<String, Object> response = new HashMap<String, Object>();
		try {
			List<Location> locationsList = locationDao.getLocationsByCity(cityId);
			response.put("locations", locationsList);
            return Response.ok(response).build();

        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }      
	}
}
