package com.letshare.dao;

import com.letshare.model.User;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to User
 */
public interface UserDAO {
	
	public User getUserByCredentials(String username, String password);
	
	public User getUserByUserId(int userId);
	
	public int createUser(User user);
	
	public boolean updateUser(User user);
	
	public boolean deleteUser(User user);
	
}
