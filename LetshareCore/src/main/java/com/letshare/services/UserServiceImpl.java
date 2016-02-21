package com.letshare.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.letshare.dao.UserDAO;
import com.letshare.model.User;
import com.letshare.util.CryptoUtil;

@Service("userService")
public class UserServiceImpl implements UserService {

	@Autowired
	UserDAO userDao;
	
	@Override
	public User authenticateUser(String email, String password) {
		CryptoUtil cryptoUtil = null;
		try {
			cryptoUtil = new CryptoUtil();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		String encryptedPassword = cryptoUtil.encrypt(password);
		
		return userDao.getUserByCredentials(email, encryptedPassword);
	}

	@Override
	public int addUser(User user) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public boolean updateUser(User user) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean deleteUser(User user) {
		// TODO Auto-generated method stub
		return false;
	}

}
