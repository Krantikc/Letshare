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

import javax.ws.rs.Consumes;
import javax.ws.rs.CookieParam;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

import org.apache.commons.io.IOUtils;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.jboss.resteasy.plugins.providers.multipart.InputPart;
import org.jboss.resteasy.plugins.providers.multipart.MultipartFormDataInput;
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

	private final String UPLOADED_FILE_PATH = "d:\\";
	
	@Autowired
	PostService postService;

	@GET
	@Path("/init")
	public String getPostInit() {
		return "Post Initialized";
	}
	
	@GET
    @Produces("application/json")
	public Response getAllPosts(@QueryParam("title") String title, @CookieParam("auth_token") String authToken) {
		Map<String, Object> response = new HashMap<String, Object>();
		System.out.println(authToken + " TOKEN ");
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
									   @FormParam("location2Id") int location2Id,
									   @FormParam("city2Id") int city2Id,
									   @FormParam("location3Id") int location3Id,
									   @FormParam("city3Id") int city3Id,
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

			int postId = postService.addPost(post);
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
							   @FormDataParam("uploadedFile") FormDataContentDisposition fileMetaData) throws IOException {
		System.out.println("Uploading..");
		String fileName = "";
		System.out.println(uploadedInputStream.read());
		fileName = fileMetaData.getFileName();
		
		writeToFile(uploadedInputStream, UPLOADED_FILE_PATH + fileName);
		
		/*
		Map<String, List<InputPart>> uploadForm = input.getFormDataMap();
		List<InputPart> inputParts = uploadForm.get("uploadedFile");

		for (InputPart inputPart : inputParts) {

		 try {

			MultivaluedMap<String, String> header = inputPart.getHeaders();
			fileName = getFileName(header);

			//convert the uploaded file to inputstream
			InputStream inputStream = inputPart.getBody(InputStream.class,null);

			byte [] bytes = IOUtils.toByteArray(inputStream);
				
			//constructs upload file path
			fileName = UPLOADED_FILE_PATH + fileName;
				
			writeFile(bytes,fileName);
				
			System.out.println("Done");

		  } catch (IOException e) {
			e.printStackTrace();
		  }

		}
*/
		return Response.status(200)
		    .entity("uploadFile is called, Uploaded file name : " + fileName).build();   
		
	}
	
	/**
	 * header sample
	 * {
	 * 	Content-Type=[image/png], 
	 * 	Content-Disposition=[form-data; name="file"; filename="filename.extension"]
	 * }
	 **/
	//get uploaded filename, is there a easy way in RESTEasy?
	private String getFileName(MultivaluedMap<String, String> header) {

		String[] contentDisposition = header.getFirst("Content-Disposition").split(";");
		
		for (String filename : contentDisposition) {
			if ((filename.trim().startsWith("filename"))) {

				String[] name = filename.split("=");
				
				String finalFileName = name[1].trim().replaceAll("\"", "");
				return finalFileName;
			}
		}
		return "unknown";
	}

	//save to somewhere
	private void writeToFile(InputStream uploadedInputStream,
	        String uploadedFileLocation) {

	    try {
	        OutputStream out = new FileOutputStream(new File(
	                uploadedFileLocation));
	        int read = 0;
	        byte[] bytes = new byte[1024];

	        out = new FileOutputStream(new File(uploadedFileLocation));
	        while ((read = uploadedInputStream.read(bytes)) != -1) {
	            out.write(bytes, 0, read);
	        }
	        out.flush();
	        out.close();
	    } catch (IOException e) {

	        e.printStackTrace();
	    }

	   }
	
}
