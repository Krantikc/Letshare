package com.letshare.util;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.apache.commons.codec.binary.Base64;
import org.springframework.util.Base64Utils;

public final class EncryptionService {

	private static EncryptionService instance;
	
	private EncryptionService() {
		
	}
	
	public synchronized byte[] encrypt(String plaintext) {
		MessageDigest msgDigest = null;
		try {
			msgDigest = MessageDigest.getInstance("SHA-256");
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			msgDigest.update(plaintext.getBytes("UTF-8"));
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		byte raw[] = msgDigest.digest();
		String encryptedText = new String(Base64.encodeBase64(raw));
		return raw;
	}
	
	public synchronized String decrypt(byte[] hash) {
		MessageDigest msgDigest = null;
		try {
			msgDigest = MessageDigest.getInstance("SHA-256");
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		msgDigest.update(hash);
		byte raw[] = msgDigest.digest();
		String decryptedText = new String(Base64.decodeBase64(raw));
		return decryptedText;
	}
	
	public static synchronized EncryptionService getInstance() {
		if (instance == null) {
			instance = new EncryptionService();
		}
		return instance;
	}
	
	public static void main(String[] args) {
		byte[] s = EncryptionService.getInstance().encrypt("H");
		String s1 = EncryptionService.getInstance().decrypt(s);
		System.out.println(new String(s));
		System.out.println(" ******************************** ************ ******** *****");
		System.out.println(s1);
		
		/*String str = "kr";
		byte[]   bytesEncoded = Base64.encodeBase64(str.getBytes());
		System.out.println("ecncoded value is " + new String(bytesEncoded ));

		// Decode data on other side, by processing encoded data
		byte[] valueDecoded= Base64.decodeBase64(bytesEncoded );
		System.out.println("Decoded value is " + new String(valueDecoded));*/
	}
}
