package com.letshare.services;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.letshare.dao.UserDAO;
import com.letshare.model.User;
import com.letshare.util.CryptoUtil;
import com.letshare.util.EncryptionService;
import com.letshare.util.JWTokenUtil;
import com.letshare.util.Messages;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;

@Service("userService")
public class UserServiceImpl implements UserService {


	static final int SESSION_EXPIRY_TIME = (24 * 60 * 60 * 1000); // 24 Hours
	
	@Autowired
	UserDAO userDao;
	
	@Override
	public User authenticateUser(String email, String password) throws Exception {
		CryptoUtil cryptoUtil = new CryptoUtil();
		
		String encryptedPassword = cryptoUtil.encrypt(password);
		
		User user =  userDao.getUserByCredentials(email, encryptedPassword);
		
		if (user != null) {
			
			String authorizationToken = user.getAuthorizationToken();
			if (authorizationToken == null) {
				System.out.println("Generated Token");
				authorizationToken = JWTokenUtil.generateTokenByEmail(user.getEmail());
				user.setAuthorizationToken(authorizationToken);
				user.setTokenIssuedAt(new Date());
				userDao.updateUser(user);
			}
		}
		return user;
	}

	@Override
	public Map<String, Object> validateToken(String token, User user) {
		Map<String, Object> response = new HashMap<>();
		boolean isValidAccess = true;
		try {
			isValidAccess = JWTokenUtil.validateToken(token, user.getEmail());
		} catch(ExpiredJwtException e) {
			String regeneratedToken = JWTokenUtil.generateTokenByEmail(user.getEmail());
			user.setAuthorizationToken(regeneratedToken);
			user.setTokenIssuedAt(new Date());
			userDao.updateUser(user);
			response.put("token", regeneratedToken);
			System.out.println("Regenerated Token");
		}
		response.put("valid", isValidAccess);
		return response;
	}
	
	@Override
	public Map<String, Object> validateUserSession(User user) {
		Map<String, Object> response = new HashMap<>();
		
		boolean isValid = false;
		Date tokenExpiry = user.getTokenIssuedAt();
		System.out.println(tokenExpiry);
		Calendar sessionExpiryCal = Calendar.getInstance();
		sessionExpiryCal.setTime(tokenExpiry);
		sessionExpiryCal.add(Calendar.MILLISECOND, SESSION_EXPIRY_TIME);
		System.out.println("valid tiko"+ (new Date().getTime() < sessionExpiryCal.getTimeInMillis()));
		if (new Date().getTime() < sessionExpiryCal.getTimeInMillis()) {
			
			isValid = true;
		} else {
			user.setAuthorizationToken(null);
			userDao.updateUser(user);
			response.put("token", null);
		}
		
		response.put("validSession", isValid);
		return response;
	}
	
	@Override
	public Map<String, Object> addUser(User user)  throws Exception{
		Map response = new HashMap<String, Object>();
		int userId = 0;
		boolean isMobileOrEmailExist = false;
		CryptoUtil cryptoUtil = new CryptoUtil();
		String encryptedPassword = cryptoUtil.encrypt(user.getPassword());
		user.setPassword(encryptedPassword);
		
		String msg = "";
		
		User existingUserByEmail = userDao.findUserByEmail(user.getEmail());
		User existingUserByMobile = userDao.findUserByMobile(user.getMobile());
		if (existingUserByEmail != null) {
			msg = Messages.EMAIL_EXIST_MSG;
			isMobileOrEmailExist = true;
		}
		
		if (existingUserByMobile != null) {
			msg  = Messages.MOBILE_EXIST_MSG;
			isMobileOrEmailExist = true;
		}
		
		if (!isMobileOrEmailExist) {
			userId = userDao.createUser(user);
			response.put("success", true);
			response.put("userId", userId);
		} else {
			response.put("success", false);
			response.put("message", msg);
		}
		
		System.out.println(msg);
		
		
		return response;
	}

	@Override
	public boolean updateUser(User user)  throws Exception{
		
		return userDao.updateUser(user);
	}

	@Override
	public boolean deleteUser(User user)  throws Exception{
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public User getUserById(int userId) throws Exception {
		return userDao.getUserByUserId(userId);
	}

	@Override
	public Map<String, Object> changeUserPassword(int userId, String currentPassword, String newPassword)
			throws Exception {
		User user = userDao.getUserByUserId(userId);
		CryptoUtil cryptoUtil = new CryptoUtil();
		
		Map<String, Object> response = new HashMap<>();
		String encryptedCurrentPassword = cryptoUtil.encrypt(currentPassword);
		if (encryptedCurrentPassword.equals(user.getPassword())) {
			String encryptedNewPassword = cryptoUtil.encrypt(newPassword);
			user.setPassword(encryptedNewPassword);
			boolean updated = userDao.updateUser(user);
			if (updated) {
				response.put("success", true);
				response.put("msg", "Password changed successfully");
				
			}
		} else {
			response.put("success", false);
			response.put("msg", "Invalid Current Password");
		}
		
		return response;
	}

}
