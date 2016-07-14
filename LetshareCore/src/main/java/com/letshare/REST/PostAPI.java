package com.letshare.REST;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import com.letshare.dao.PostDaoImpl;
import com.letshare.dao.UserDAO;
import com.letshare.helper.PostFilter;
import com.letshare.model.Post;
import com.letshare.model.PostDetails;
import com.letshare.model.PostLocation;
import com.letshare.model.User;
import com.letshare.services.PostService;
import com.letshare.services.UserService;
import com.letshare.util.FileUtil;
import com.letshare.util.JWTokenUtil;

import io.jsonwebtoken.ExpiredJwtException;

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
	
	@Autowired
	UserDAO userDao;
	
	@Autowired
	UserService userService;

	@GET
	@Path("/init")
	public String getPostInit() {
		return "Post Initialized";
	}
	
	@GET
    @Produces("application/json")
	public Response getAllPosts(@DefaultValue("0") @QueryParam("start") int start, 
								@DefaultValue("30") @QueryParam("size") int size, 
								@DefaultValue("") @QueryParam("searchTitle") String title,
								@DefaultValue("0") @QueryParam("categoryId") int categoryId,
								@DefaultValue("share") @QueryParam("postType") String postType,
								@DefaultValue("0") @QueryParam("city1Id") int city1Id,
								@DefaultValue("0") @QueryParam("location1Id") int location1Id,
								@DefaultValue("0") @QueryParam("city2Id") int city2Id,
								@DefaultValue("0") @QueryParam("location2Id") int location2Id,
								@QueryParam("processDate") String processDateStr,
			                    @HeaderParam("Authorization") String token) {
		
		
		
		Map<String, Object> response = new HashMap<String, Object>();
		
		try {
			boolean authenticationRequired = false;
			boolean isValidAccess = false;
			
			DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
			Date processDate = null;
			
			if (processDateStr != null) {
				processDate = dateFormat.parse(processDateStr);
			}
			
			boolean activePosts = true;
			
			PostFilter postFilter = new PostFilter(start, size, activePosts, categoryId, postType, city1Id, city2Id, processDate, location1Id, location2Id, title, token);
			if (authenticationRequired) {
				String authToken = token.substring(7);
				
				User user = userDao.getUserByToken(authToken);
				
				
				/*try {
					isValidAccess = JWTokenUtil.validateToken(token.substring(7), user.getEmail());
				} catch(ExpiredJwtException e) {
					String regeneratedToken = JWTokenUtil.generateTokenByEmail(user.getEmail());
					user.setAuthorizationToken(regeneratedToken);
					userDao.updateUser(user);
					response.put("token", regeneratedToken);
					System.out.println("Regenerated Token");
				}*/
				
				response = userService.validateToken(authToken, user);
				if (response.get("valid") != null && (Boolean)response.get("valid")) {
					isValidAccess = true;
				}
				
				if (isValidAccess) {
					System.out.println(token + " TOKEN ");
						List<Post> posts = postService.getAllPosts();
						response.put("posts", posts);		
						response.put("success", true);	
				} else {
					response.put("success", false);	
					response.put("message", "Invalid user access");		
				}
			} else {
				List<Post> posts = postService.getPosts(postFilter);
				response.put("posts", posts);		
				response.put("success", true);	
			}
		} catch (Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
		}
        return Response.ok(response).build();

	}
	
	@GET
    @Produces("application/json")
	@Path("/user")
	public Response getPostsByUser(@QueryParam("userId") int userId,
								   @DefaultValue("true") @QueryParam("active") boolean active, 
			                       @HeaderParam("Authorization") String token) {
		
		Map<String, Object> response = new HashMap<String, Object>();
		try {
			boolean authenticationRequired = true;
			boolean isValidAccess = false;
			
			if (authenticationRequired) {
				String authToken = token.substring(7);
				System.out.println(token + " TOKEN ");
				User user = userDao.getUserByToken(authToken);
				/*try {
					isValidAccess = JWTokenUtil.validateToken(token.substring(7), user.getEmail());
				} catch(ExpiredJwtException e) {
					String regeneratedToken = JWTokenUtil.generateTokenByEmail(user.getEmail());
					user.setAuthorizationToken(regeneratedToken);
					userDao.updateUser(user);
					response.put("token", regeneratedToken);
					System.out.println("Regenerated Token");
				}*/
				
				response = userService.validateToken(authToken, user);
				if (response.get("valid") != null && (Boolean)response.get("valid")) {
					isValidAccess = true;
				}
				
				if (isValidAccess) {
						List<Post> posts = postService.getPostsByUser(userId, active);
						response.put("posts", posts);		
						response.put("success", true);	
				} else {
					response.put("success", false);	
					response.put("message", "Invalid user access");		
				}
			} else {
				List<Post> posts = postService.getPostsByUser(userId, active);
				response.put("posts", posts);		
				response.put("success", true);	
			}
		} catch (Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
		}
		
        return Response.ok(response).build();  
	}
	
	@GET
    @Produces("application/json")
	@Path("/{postId}")
	public Response getPost(@PathParam("postId") int postId) {
		Map<String, Object> response = new HashMap<String, Object>();
		try {
			Post post = postService.getPost(postId);
			response.put("success", true);
			response.put("post", post);
            

        } catch (Exception e) {
        	response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
        }      
		return Response.ok(response).build();
	}
	
	@POST
    //@Produces("application/json")
	@Consumes("multipart/form-data")
	public Response addPost(@DefaultValue("") @FormDataParam("title") String title,
							@FormDataParam("description") String description,
							@FormDataParam("categoryId") int categoryId,
							@FormDataParam("type") String type,
							@FormDataParam("userId") int userId,
							@FormDataParam("processDate") Date processDate,
										   // Location Details
							@FormDataParam("location1Id") int location1Id,
							@FormDataParam("city1Id") int city1Id,
							@FormDataParam("location2Id") int location2Id,
							@FormDataParam("city2Id") int city2Id,
							@FormDataParam("location3Id") int location3Id,
							@FormDataParam("city3Id") int city3Id,
										   // Post Details
							@FormDataParam("uniqueId") String uniqueId,
							//@FormDataParam("color") String color,
						    @FormDataParam("measurement") String measurement,
							@FormDataParam("capacity") int capacity,
							@FormDataParam("availability") int availability,
							@FormDataParam("amenities") String amenities,
							@FormDataParam("brand") String brand,
							@FormDataParam("age") String age,
							@FormDataParam("displayContactDetails") boolean displayContactDetails,
						    // Images uploaded
						    @FormDataParam("uploadedFile1") InputStream uploadedInputStream1,
						    @FormDataParam("uploadedFile1") FormDataContentDisposition fileMetaData1,

						    @FormDataParam("uploadedFile2") InputStream uploadedInputStream2,
						    @FormDataParam("uploadedFile2") FormDataContentDisposition fileMetaData2,

						    @FormDataParam("uploadedFile3") InputStream uploadedInputStream3,
						    @FormDataParam("uploadedFile3") FormDataContentDisposition fileMetaData3,
						    @Context HttpServletRequest request) {
		
		Map<String, Object> response = new HashMap<String, Object>();
		//List<Post> posts = postService.getAllPosts();
		try {
			PostLocation postLocation = new PostLocation(location1Id, city1Id, location2Id, city2Id, location3Id, city3Id);
			PostDetails postDetails = new PostDetails(uniqueId, "", measurement, capacity, availability, amenities, brand, age);
				
			Date postedDate = new Date();
			Date modifiedDate = new Date();
			boolean isPostActive = true;
			Post post = new Post(title, description, categoryId, userId, postLocation, postDetails, processDate, postedDate, modifiedDate, isPostActive);

			post.setPostType(type);
			post.setDisplayContactDetails(displayContactDetails);
			
			int postId = postService.addPost(post);
			
			String folderName = "posts" + File.separator + postId;
			
			if (postId != 0) {
				String uploadedPath = "";
				
				if (uploadedInputStream1 != null) {
					FileUtil.uploadFile(request, uploadedInputStream1,  folderName, "img-" + postId + "-1.jpg");
				}
				
				if (uploadedInputStream2 != null) {
					FileUtil.uploadFile(request, uploadedInputStream2,  folderName, "img-" + postId + "-2.jpg");
				}
				
				if (uploadedInputStream3 != null) {
					uploadedPath = FileUtil.uploadFile(request, uploadedInputStream3,  folderName, "img-" + postId + "-3.jpg");
				}
				response.put("filePath", uploadedPath);	
			}
			
			
			
			response.put("success", true);			
           

        } catch (Exception e) {
        	response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
            
        }   
		
		 return Response.ok(response).build();
		
	}
	
	@POST
	@Path("/upload")
	@Consumes("multipart/form-data")
	public Response uploadFile(@FormDataParam("uploadedFile") InputStream uploadedInputStream,
							   @FormDataParam("uploadedFile") FormDataContentDisposition fileMetaData,
							   @FormDataParam("name") String name,
							   @Context HttpServletRequest request) throws IOException {
		System.out.println("Uploading.." + name);
		String fileName = "";
		//System.out.println(uploadedInputStream.read());
		fileName = fileMetaData.getFileName();
		
		String uploadedPath = FileUtil.uploadFile(request, uploadedInputStream,  "img", fileName);
		
		return Response.status(200)
		    .entity(uploadedPath).build();   
		
	}
	
	
}
