package com.letshare.services;

import com.letshare.model.User;

public interface UserService {

	public User authenticateUser(String email, String password);
	
	public int addUser(User user);
	
	public boolean updateUser(User user);
	
	public boolean deleteUser(User user);
}
