package com.letshare.dao;

import java.math.BigInteger;

import com.letshare.model.User;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to general user
 */
public interface ObjectDAO {

	public Object getObjectById(Object object, int id);
	
}
