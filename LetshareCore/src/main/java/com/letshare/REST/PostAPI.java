package com.letshare.REST;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
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
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import com.letshare.dao.PostDaoImpl;
import com.letshare.dao.UserDAO;
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

	private final String UPLOADED_FILE_PATH = "d:\\";
	
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
	public Response getAllPosts(@QueryParam("title") String title,
			                    //@CookieParam("auth_token") String authToken,
			                    @HeaderParam("Authorization") String token) {
		
		
		
		Map<String, Object> response = new HashMap<String, Object>();
		String authToken = token.substring(7);
		
		User user = userDao.getUserByToken(authToken);
		
		boolean isValidAccess = false;
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
			//try {
				//List<Post> posts = postService.getAllPosts();
				List<Post> posts = postService.getAllPosts();
				response.put("posts", posts);		
				response.put("success", true);	
		} else {
			response.put("success", false);	
			response.put("message", "Invalid user access");		
		}
		
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
    //@Produces("application/json")
	@Consumes("multipart/form-data")
	public Response addPost(@FormDataParam("title") String title,
							@FormDataParam("description") String description,
							//@FormDataParam("categoryId") int categoryId,
							//@FormDataParam("userId") int userId,
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
							//@FormDataParam("measurement") String measurement,
							@FormDataParam("capacity") int capacity,
							@FormDataParam("availability") int availability,
							@FormDataParam("amenities") String amenities,
							@FormDataParam("brand") String brand,
							@FormDataParam("age") String age,
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
			PostDetails postDetails = new PostDetails(uniqueId, "", "", capacity, availability, amenities, brand, age);
					
			Post post = new Post(title, description, 1, 1, postLocation, postDetails, new Date(), new Date(), true);

			
			int postId = postService.addPost(post);
			
			String folderName = "posts" + File.separator + postId;
			
			if (postId != 0) {
				String uploadedPath = "";
				
				FileUtil.uploadFile(request, uploadedInputStream1,  folderName, fileMetaData1.getFileName());
				FileUtil.uploadFile(request, uploadedInputStream2,  folderName, fileMetaData2.getFileName());
				uploadedPath = FileUtil.uploadFile(request, uploadedInputStream3,  folderName, fileMetaData3.getFileName());
				response.put("filePath", uploadedPath);	
			}
			
			
			
			response.put("success", true);			
            return Response.ok(response).build();

        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }     
		
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
