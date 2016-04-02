package com.letshare.util;

import java.security.spec.KeySpec;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;

import org.apache.commons.codec.binary.Base64;

public class CryptoUtil {
	private static final String UNICODE_FORMAT = "UTF8";
    public static final String DESEDE_ENCRYPTION_SCHEME = "DESede";
    private KeySpec keySpec;
    private SecretKeyFactory secretKeyfactory;
    private Cipher cipher;
    byte[] arrayBytes;
    private String myEncryptionKey;
    private String myEncryptionScheme;
    SecretKey key;

    public CryptoUtil() throws Exception {
        myEncryptionKey = "LetshareWithOurNewWorldz"; // Min 24 characters
        myEncryptionScheme = DESEDE_ENCRYPTION_SCHEME;
        arrayBytes = myEncryptionKey.getBytes(UNICODE_FORMAT);
        keySpec = new DESedeKeySpec(arrayBytes);
        secretKeyfactory = SecretKeyFactory.getInstance(myEncryptionScheme);
        cipher = Cipher.getInstance(myEncryptionScheme);
        key = secretKeyfactory.generateSecret(keySpec);
    }


    public String encrypt(String unencryptedString) {
        String encryptedString = null;
        try {
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] plainText = unencryptedString.getBytes(UNICODE_FORMAT);
            byte[] encryptedText = cipher.doFinal(plainText);
            encryptedString = new String(Base64.encodeBase64(encryptedText));
        } catch (Exception e) {
            e.printStackTrace();
        }
        return encryptedString;
    }


    public String decrypt(String encryptedString) {
        String decryptedText=null;
        try {
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] encryptedText = Base64.decodeBase64(encryptedString.getBytes());
            byte[] plainText = cipher.doFinal(encryptedText);
            decryptedText= new String(plainText);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return decryptedText;
    }


    public static void main(String args []) throws Exception
    {
    	CryptoUtil td= new CryptoUtil();

        String target="kra";
        String encrypted=td.encrypt(target);
        String decrypted=td.decrypt(encrypted);

        System.out.println("String To Encrypt: "+ target);
        System.out.println("Encrypted String: " + encrypted);
        System.out.println("Decrypted String: " + decrypted);

    }
}
