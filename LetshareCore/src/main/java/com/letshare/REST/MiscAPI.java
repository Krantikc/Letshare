package com.letshare.REST;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import com.letshare.dao.CategoriesDao;
import com.letshare.dao.ObjectDAO;
import com.letshare.model.Category;
import com.letshare.model.City;
import com.letshare.model.Location;
import com.letshare.model.Post;
import com.letshare.util.FileUtil;

@Path("misc")
@Component
public class MiscAPI {

	@Autowired
	ObjectDAO objectDao;
	
	@GET
    @Produces("application/json")
	@Path("/serverpath")
	public Response getRelativePath(HttpServletRequest request) {
		Map<String, Object> response = new HashMap<String, Object>();
		try {
			String path = FileUtil.getRelativePath(request);

			response.put("success", true);
			response.put("path", path);
	        return Response.ok(response).build();
	        
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }      
	}
	
	@GET
    @Produces("application/json")
	@Path("/object")
	public Response getObject(@QueryParam("id") int id,
							  @QueryParam("class") String classObj) {
		Map<String, Object> response = new HashMap<String, Object>();
		Object obj = null;
		try {
			
			switch(classObj) {
				case "city":
					obj = new City();
					break;
				case "location":
					obj = new Location();
					break;
				case "category":
					obj = new Category();
					break;
					
				default:
					System.out.println("invalid class");
			}
			Object retrievedObj = objectDao.getObjectById(obj, id);

			response.put("success", true);
			response.put("object", retrievedObj);
	        return Response.ok(response).build();
	        
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }      
	}
	
}
