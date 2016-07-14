package com.letshare.filter;


import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;

import com.letshare.util.JWTokenUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureException;

public class AuthenticationFilter implements Filter {
	final static String ALLOWABLE_REQUEST_KEY = "prelogin";

    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;
        
        boolean isPreflightReq = false;
        
        if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
        	isPreflightReq = true;
        }
        final String authHeader = request.getHeader("Authorization");
        
        
        if (!isPreflightReq && (authHeader !=null && !authHeader.equals(ALLOWABLE_REQUEST_KEY))) {
        	
        	if (!authHeader.startsWith("Bearer ")) {
            	throw new ServletException("Invalid Authorization header.");
            }
            
            final String token = authHeader.substring(7);
            
            try {
            	/*final Claims claims = Jwts.parser()
            			 				  .setSigningKey(JWTokenUtil.SECURITY_KEY)
            			 				  .parseClaimsJws(token)
            			 				  .getBody();*/
            	request.setAttribute("token", token);
            } catch (final SignatureException e) {
                throw new ServletException("Invalid token.");
            }
        }
        
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
        response.setHeader("Access-Control-Max-Age", "3600");
        //response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
        response.setHeader("Access-Control-Request-Headers", "Authorization");
        response.setHeader("auth_token", "new token");
        chain.doFilter(req, res);
    }

    public void init(FilterConfig filterConfig) {}

    public void destroy() {}

}