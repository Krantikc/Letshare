package com.letshare.REST;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.letshare.dao.CategoriesDao;
import com.letshare.dao.CategoriesDaoImpl;
import com.letshare.dao.CategoryFieldsDao;
import com.letshare.model.Category;
import com.letshare.model.CategoryField;
import com.letshare.model.Post;

@Path("/category")
public class CategoryAPI {

	@Autowired
	CategoriesDao categoriesDao;
	
	@Autowired
	CategoryFieldsDao categoryFieldsDao;
	
	@GET
	@Path("/all")
    @Produces("application/json")
	
	public Response getAllCategories() {
		Map<String, Object> response = new HashMap<String, Object>();
		//try {

			List<Category> categories = categoriesDao.getCategories();
			response.put("categories", categories);		
            return Response.ok(response).build();

       // } catch (Exception e) {
           // return Response.status(Response.Status.UNAUTHORIZED).build();
       // }      
	}
	
	@GET
	@Path("/all/nested")
    @Produces("application/json")
	
	public Response getAllNestedCategories() {
		Map<String, Object> response = new HashMap<String, Object>();
		List<Category> categoriesList = new LinkedList<>();
		//try {

			List<Category> categories = categoriesDao.getCategoriesByLevel(1);
			
			for (Category category : categories) {
				List<Category> children = categoriesDao.getChildCategories(category.getCategoryId());
				categoriesList.add(category);
				categoriesList.addAll(children);
			}
			response.put("categories", categoriesList);		
            return Response.ok(response).build();

       // } catch (Exception e) {
           // return Response.status(Response.Status.UNAUTHORIZED).build();
       // }      
	}
	
	@GET
	@Path("/fields/{categoryId}")
    @Produces("application/json")
	
	public Response getCategoryfields(@PathParam("categoryId") int categoryId) {
		
		Map<String, Object> response = new HashMap<String, Object>();
		
		//try {
			//List<Post> posts = postService.getAllPosts();
			List<CategoryField> categoryFields = categoryFieldsDao.getCategoryFieldsByCategoryId(categoryId);
			response.put("categoryFields", categoryFields);		
            return Response.ok(response).build();

       // } catch (Exception e) {
           // return Response.status(Response.Status.UNAUTHORIZED).build();
       // }      
	}
	
	@POST
    @Produces("application/json")
	public Response saveCategory(@FormParam("name") String name,
								 @FormParam("level") int level,
								 @FormParam("parentId") int parentId
								 ) {
		
		
		Map<String, Object> response = new HashMap<String, Object>();
		Category category = new Category(name, level, parentId);
		//try {
			//List<Post> posts = postService.getAllPosts();
			int categoryId = categoriesDao.addCategory(category);
			response.put("categoryId", categoryId);		
            return Response.ok(response).build();

       // } catch (Exception e) {
           // return Response.status(Response.Status.UNAUTHORIZED).build();
       // }      
	}
	
}
