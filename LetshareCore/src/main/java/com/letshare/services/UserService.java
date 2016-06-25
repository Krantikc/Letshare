package com.letshare.services;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.letshare.model.User;


public interface UserService {

	public User authenticateUser(String email, String password)  throws Exception;
	
	public Map<String, Object> validateToken(String token, User user);
	
	public Map<String, Object> validateUserSession(User user);
	
	public User getUserById(int userId)  throws Exception;
	
	public Map<String, Object>  addUser(User user)  throws Exception;
	
	public Map<String, Object> changeUserPassword(int userId, String currentPassword, String newPassword)  throws Exception;
	
	public boolean updateUser(User user)  throws Exception;
	
	public boolean deleteUser(User user)  throws Exception;
}
