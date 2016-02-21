package com.letshare.REST;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.letshare.model.User;
import com.letshare.services.UserService;

/**
 * Webservice for User Authentication. 
 * Every API URL with path name begins with '/user' will be mapped to this webservice
 * @author Kranti K C
 *
 */
@Path("user")
@Component
public class UserAPI {

	@Autowired
	@Qualifier("userService")
	UserService userService;
	
	@GET
	@Path("/init")
	public String getPostInit() {
		return "User Initialized";
	}
	
	@POST
	@Path("/auth")
	public Response authenticateUser(@FormParam("email") String email, 
									 @FormParam("password") String password) {
		
		try {
			Map<String, Object> response = new HashMap<>();
			User user = userService.authenticateUser(email, password);
			if (user != null) {
				response.put("success", true);
				response.put("user", user);
			} else {
				response.put("success", false);
			}
			return Response.ok(response).build();
		} catch(Exception e) {
			return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		
	}
	
	@POST
	public Response addUser() {
		User user = new User();
		try {
			Map<String, Object> response = new HashMap<>();
			int userId = userService.addUser(user);
			
			response.put("success", true);
			response.put("userId", userId);
			return Response.ok(response).build();
		} catch(Exception e) {
			return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		
	}
}
