package com.letshare.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.hibernate.Session;
import org.hibernate.SessionFactory;

import com.letshare.dao.PostDaoImpl;
import com.letshare.model.Post;
import com.letshare.util.HibernateUtil;
/**
 * Webservice for CRUD operations related to Post. 
 * Every API URL with path name begins with '/post' will be mapped to this webservice
 * @author PREM
 *
 */
@Path("post")
public class PostService {

	SessionFactory sessionFactory = HibernateUtil.getSessionFactory();
	@GET
	@Path("/init")
	public String getPostInit() {
		return "Initialized";
	}
	
	@GET
	@Path("/all")
    @Produces("application/json")
	public Map<String, Object> getAllPosts() {
		
		Map<String, Object> response = new HashMap<String, Object>();
		List<Post> posts = new PostDaoImpl().getPosts();
		response.put("posts", posts);			
		return response;
	}
	
}
