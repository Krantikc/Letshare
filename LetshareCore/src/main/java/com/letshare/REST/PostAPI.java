package com.letshare.REST;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import com.letshare.dao.PostDaoImpl;
import com.letshare.model.Post;
import com.letshare.model.PostDetails;
import com.letshare.model.PostLocation;
import com.letshare.services.PostService;

/**
 * Webservice for CRUD operations related to Post. 
 * Every API URL with path name begins with '/post' will be mapped to this webservice
 * @author Kranti K C
 *
 */
@Path("post")
@Component
public class PostAPI {

	
	
	@Autowired
	PostService postService;
	
	PostDaoImpl postDaoImpl = new PostDaoImpl();

	@GET
	@Path("/init")
	public String getPostInit() {
		return "Post Initialized";
	}
	
	@GET
    @Produces("application/json")
	public Response getAllPosts(@QueryParam("title") String title) {
		Map<String, Object> response = new HashMap<String, Object>();
		//try {
			//List<Post> posts = postService.getAllPosts();
			List<Post> posts = postService.getAllPosts();
			response.put("posts", posts);		
            return Response.ok(response).build();

       // } catch (Exception e) {
           // return Response.status(Response.Status.UNAUTHORIZED).build();
       // }      
	}
	
	@GET
    @Produces("application/json")
	@Path("/{postId}")
	public Response getPost(@PathParam("postId") int postId) {
		Map<String, Object> response = new HashMap<String, Object>();
		try {
			Post post = postService.getPost(postId);
			response.put("post", post);
            return Response.ok(response).build();

        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }      
	}
	
	@POST
    @Produces("application/json")
	public Response addPost(@FormParam("title") String title,
									   @FormParam("description") String description,
									   @FormParam("categoryId") int categoryId,
									   @FormParam("userId") int userId,
									   // Location Details
									   @FormParam("location1Id") int location1Id,
									   @FormParam("city1Id") int city1Id,
									   @FormParam("location1Id") int location2Id,
									   @FormParam("city1Id") int city2Id,
									   @FormParam("location1Id") int location3Id,
									   @FormParam("city1Id") int city3Id,
									   // Post Details
									   @FormParam("uniqueId") String uniqueId,
									   @FormParam("color") String color,
									   @FormParam("measurement") String measurement,
									   @FormParam("capacity") int capacity,
									   @FormParam("availability") int availability,
									   @FormParam("amenities") String amenities,
									   @FormParam("brand") String brand,
									   @FormParam("age") String age
									   ) {
		
		Map<String, Object> response = new HashMap<String, Object>();
		//List<Post> posts = postService.getAllPosts();
		try {
			PostLocation postLocation = new PostLocation(location1Id, city1Id, location2Id, city2Id, location3Id, city3Id);
			PostDetails postDetails = new PostDetails(uniqueId, color, measurement, capacity, availability, amenities, brand, age);
					
			Post post = new Post(title, description, categoryId, userId, postLocation, postDetails, new Date(), new Date(), true);

			int postId = postDaoImpl.addPost(post);
			response.put("success", true);			
            return Response.ok(response).build();

        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }     
		
	}
	
	
	
}
