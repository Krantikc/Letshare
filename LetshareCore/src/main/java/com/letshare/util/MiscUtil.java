package com.letshare.util;

import java.security.SecureRandom;
import java.util.Random;

public class MiscUtil {
	
	private static String ALPHA_NUMERIC = "abcdefghijklmnopqrstuvwxyz~@#$%ABCDEFGHIJKLMNOPQRSTUVWXYZ~@#$%0123456789~@#$%abcdefghijklmnopqrstuvwxyz~@#$%ABCDEFGHIJKLMNOPQRSTUVWXYZ~@#$%0123456789";
	public static String generatePassword(int length) {
		StringBuilder strBldr = new StringBuilder();
		
		for (int i = 0; i < length; i++) {
			int random = (int) (Math.random() * 10);
			strBldr.append(ALPHA_NUMERIC.charAt(random));
		}
		
		return strBldr.toString();
	}
	
	public static void main(String[] args) {
		String sd = generatePassword(5);
		System.out.println(sd);
	}

}
