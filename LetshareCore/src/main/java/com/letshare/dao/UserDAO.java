package com.letshare.dao;

import java.math.BigInteger;

import com.letshare.model.User;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to User
 */
public interface UserDAO {
	
	public User getUserByCredentials(String username, String password);
	
	public User getUserByUserId(int userId);
	
	public User getUserByToken(String token);
	
	public int createUser(User user);
	
	public boolean updateUser(User user);
	
	public boolean deleteUser(User user);
	
	public User findUserByEmail(String email)  throws Exception;
	
	public User findUserByMobile(BigInteger mobile)  throws Exception;
	
}
