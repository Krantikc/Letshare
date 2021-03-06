package com.letshare.REST;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestParam;

import com.letshare.dao.UserDAO;
import com.letshare.model.User;
import com.letshare.services.UserService;
import com.letshare.util.CryptoUtil;
import com.letshare.util.JWTokenUtil;

import io.jsonwebtoken.Jwts;

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
	UserService userService;
	
	@Autowired
	UserDAO userDao;
	
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
				
				response.put("token", user.getAuthorizationToken());
			} else {
				response.put("success", false);
			}
			return Response.ok(response).build();
		} catch(Exception e) {
			e.printStackTrace();
			return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		
	}
	
	@POST
	@Path("/validatesession")
	@Consumes("application/json")
	public Response authenticateUser(User user) {
		
		Map<String, Object> response = new HashMap<>();

		try {
			System.out.println(user.getAuthorizationToken());
			response = userService.validateUserSession(user);
			response.put("success", true);
		} catch(Exception e) {
			
			response.put("success", false);
			e.printStackTrace();
		}
		return Response.ok(response).build();
		
	}
	
	@GET
	@Produces("application/json")
	@Path("/{userId}")
	public Response getUser(@PathParam("userId") int userId) {
		//User user = new User();
		Map<String, Object> response = new HashMap<>();
		try {
			
			User user = userService.getUserById(userId);
			
			response.put("success", true);
			response.put("user", user);
			
		} catch(Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
			//return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		return Response.ok(response).build();
		
	}
	
	@GET
	@Produces("application/json")
	@Path("/pwd/{userId}")
	public Response getUserPassword(@PathParam("userId") int userId) {
		//User user = new User();
		Map<String, Object> response = new HashMap<>();
		try {
			
			User user = userService.getUserById(userId);
			
			CryptoUtil cryptoUtil = new CryptoUtil();
			String decryptedPassword = cryptoUtil.decrypt(user.getPassword());
			
			response.put("success", true);
			response.put("pwd", decryptedPassword);
			
		} catch(Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
			//return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		return Response.ok(response).build();
		
	}
	
	@GET
	@Produces("application/json")
	@Path("/reset")
	public Response resetUserPassword(@QueryParam("email") String email) {
		Map<String, Object> response = new HashMap<>();
		try {
			
			response = userService.resetPassword(email);
			
		} catch(Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
		}
		
		return Response.ok(response).build();
	}
	
	@PUT
	@Consumes("application/json")
	public Response addUser(User user) {
		//User user = new User();
		Map<String, Object> response = new HashMap<>();
		try {
			
			response = userService.addUser(user);
			
			//response.put("success", true);
			//response.put("userId", userId);
			
		} catch(Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
			//return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		return Response.ok(response).build();
		
	}
	
	
	
	@POST
	@Consumes("application/json")
	public Response updateUser(User user) {
		//User user = new User();
		Map<String, Object> response = new HashMap<>();
		try {
			
			User persistedUser = userDao.getUserByUserId(user.getUserId());
			User existingUserEmail = null;
			User existingUserMobile = null;
			
			if (!persistedUser.getEmail().equalsIgnoreCase(user.getEmail())) {
				existingUserEmail = userDao.findUserByEmail(user.getEmail());
			}
			
			if (persistedUser.getMobile() != user.getMobile()) {
				existingUserMobile = userDao.findUserByMobile(user.getMobile());
			}
			
			if (existingUserEmail == null && existingUserMobile == null) {
				user.setPassword(persistedUser.getPassword());
				userService.updateUser(user);		
				response.put("success", true);
			} else {
				String message = "";
				if (existingUserEmail != null) {
					message += "Email already exists. ";
				}
				
				if (existingUserMobile != null) {
					message += "Mobile already exists. ";
				}
				response.put("message", message);
				response.put("success", false);
			}
			
			
			//response.put("userId", userId);
			
		} catch(Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
			//return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		return Response.ok(response).build();
		
	}
	
	@POST
	@Path("/password")
	public Response changeUserPassword(@FormParam("userId") int userId,
									   @FormParam("currentPassword") String currentPassword,
									   @FormParam("newPassword") String newPassword) {
		//User user = new User();
		Map<String, Object> response = new HashMap<>();
		try {
			
			response = userService.changeUserPassword(userId, currentPassword, newPassword);

			//response.put("userId", userId);
			
		} catch(Exception e) {
			response.put("success", false);
			response.put("exception", e.getClass());
			response.put("message", e.getMessage());
			e.printStackTrace();
			//return Response.status(Response.Status.UNAUTHORIZED).build();
		}
		return Response.ok(response).build();
		
	}
}
