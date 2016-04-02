package com.letshare.util;

import java.security.Key;
import java.util.Calendar;
import java.util.Date;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.impl.crypto.MacProvider;

public class JWTokenUtil {

	static final Key SECURITY_KEY = MacProvider.generateKey();
	static final int TOKEN_EXPIRY_TIME = (5 * 60 * 1000); // 5 Minutes
	public String generateTokenByEmail(String email) {
		
		Claims claims = Jwts.claims();
		claims.setSubject(email);
		
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.MILLISECOND, TOKEN_EXPIRY_TIME);
		claims.setExpiration(cal.getTime());
		
		String authToken = Jwts.builder()
					   .setClaims(claims)
					   .signWith(SignatureAlgorithm.HS512, SECURITY_KEY)
					   .compact();
		
		return authToken;
		
	}
	
	public boolean validateToken(String authToken, String email) {
		
		Claims claims = Jwts.parser()
							.setSigningKey(SECURITY_KEY)
							.parseClaimsJws(authToken).getBody();

		boolean isValid = false;
		try {
			isValid = claims.getSubject().equals(email);
		} catch (ExpiredJwtException e) {

			String s = generateTokenByEmail(email);
			System.out.println("Expired, but regenerated");
		}
		return false;
	}
	public static void main(String[] args) {
		
		Claims claims = Jwts.claims();
		claims.setSubject("kra@gm");
		
		Calendar cal = Calendar.getInstance();
		cal.add(Calendar.SECOND, 1);
		claims.setExpiration(cal.getTime());
		
		String s = Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, SECURITY_KEY).compact();
		
		try {
		    Thread.sleep(5000);                 //1000 milliseconds is one second.
		} catch(InterruptedException ex) {
		    Thread.currentThread().interrupt();
		}
		
		System.out.println(s);
		boolean valid = false;
		try {
			valid = Jwts.parser().setSigningKey(SECURITY_KEY).parseClaimsJws(s).getBody().getSubject().equals("kra@gm");
		} catch (ExpiredJwtException e) {
			
			cal.add(Calendar.MINUTE, 1);
			claims.setExpiration(cal.getTime());
			s = Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, SECURITY_KEY).compact();
			System.out.println("Expired, but regenerated");
		}
		
		valid = Jwts.parser().setSigningKey(SECURITY_KEY).parseClaimsJws(s).getBody().getExpiration().getTime() > new Date().getTime();
		
		System.out.println(valid);
	}
	
}
