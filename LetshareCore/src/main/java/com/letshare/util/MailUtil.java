package com.letshare.util;
import java.io.InputStream;
import java.util.*;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.springframework.stereotype.Service;
@Service
public class MailUtil {
	public static String sendMail(String emailFrom, 
								  String emailTo, 
								  String subject, 
								  String salutation, 
								  String bodyMsg) {
		
		Properties prop = new Properties();
		InputStream inputStream = null;
		String email = "";
		String password = "";
		String transportProtocol = "smtp";
		String smtpAuth = "true";
		String sslTrust = "*";
		String sslEnable = "true";
		String starttlsEnable = "true";
		String smtpHost = "smtp.gmail.com";
		String smtpPort = "465";
		try {
			inputStream = MailUtil.class.getClassLoader().getResourceAsStream("mail.properties");
			prop.load(inputStream);
			email = prop.getProperty("email");
			password = prop.getProperty("password");
			transportProtocol = prop.getProperty("transport.protocol");
			smtpAuth = prop.getProperty("smtp.auth");
			sslTrust = prop.getProperty("smtp.ssl.trust");
			sslEnable = prop.getProperty("smtp.ssl.enable");
			starttlsEnable = prop.getProperty("smtp.starttls.enable");
			smtpHost = prop.getProperty("smtp.host");
			smtpPort = prop.getProperty("smtp.port");
			
			System.out.println(smtpPort);
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		final String USERNAME = email;
		final String PASSWORD = password;
		Properties props = new Properties();
		props.put("mail.transport.protocol", transportProtocol);
		props.put("mail.smtp.auth", smtpAuth);
		props.put("mail.smtp.ssl.trust", sslTrust);
		props.put("mail.smtp.ssl.enable", sslEnable);
		props.put("mail.smtp.starttls.enable", starttlsEnable);
		props.put("mail.smtp.host", smtpHost);
		props.put("mail.smtp.port", smtpPort);
 
		Session session = Session.getInstance(props,
		  new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(USERNAME, PASSWORD);
			}
		  });
 
		try {
 
			Message message = new MimeMessage(session);
			message.setFrom(new InternetAddress(emailFrom));
			message.setRecipients(Message.RecipientType.TO,InternetAddress.parse(emailTo));
			message.setSubject(subject);
			message.setText(salutation+","
				+ "\n\n"+bodyMsg);
 
			message.setContent(bodyMsg, "text/html");
			Transport.send(message);
 
			System.out.println("Done");
 
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
		return "success";
	}
	

}
