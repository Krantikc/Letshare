package com.letshare.REST;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import org.springframework.stereotype.Component;

import com.letshare.model.Post;
import com.letshare.util.FileUtil;

@Path("misc")
@Component
public class MiscAPI {

	@GET
    @Produces("application/json")
	@Path("/serverpath")
	public Response getRelativePath(HttpServletRequest request) {
		Map<String, Object> response = new HashMap<String, Object>();
		try {
			String path = FileUtil.getRelativePath(request);

			response.put("success", true);
			response.put("path", path);
	        return Response.ok(response).build();
	        
        } catch (Exception e) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }      
	}
	
}
