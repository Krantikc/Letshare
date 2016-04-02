package com.letshare.REST;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.CookieParam;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.letshare.dao.CategoriesDao;
import com.letshare.dao.CategoriesDaoImpl;
import com.letshare.model.Category;
import com.letshare.model.Post;

@Component
@Path("category")
public class CategoryAPI {

	@Autowired
	CategoriesDao categoriesDao;
	
	@GET
	@Path("/all")
    @Produces("application/json")
	
	public Response getAllCategories(@CookieParam("auth_token") String authToken) {
		Map<String, Object> response = new HashMap<String, Object>();
		System.out.println(authToken + " TOKEN ");
		//try {
			//List<Post> posts = postService.getAllPosts();
			List<Category> categories = categoriesDao.getCategories();
			response.put("categories", categories);		
            return Response.ok(response).build();

       // } catch (Exception e) {
           // return Response.status(Response.Status.UNAUTHORIZED).build();
       // }      
	}
	
}