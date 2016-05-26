package com.letshare.util;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLConnection;
import java.util.Properties;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.MultivaluedMap;

import org.apache.commons.io.filefilter.WildcardFileFilter;
import org.apache.commons.logging.Log;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

public class FileUtil {
	static Logger log = LoggerFactory.getLogger(FileUtil.class);
	public static String uploadToLocalServer(HttpServletRequest request, 
			String folderName, 
			MultipartFile file, 
			String fileName) {
		
		 String path = "";
	        if (!file.isEmpty()) {
	            try {
	                byte[] bytes = file.getBytes();
	 
	                // Creating the directory to store file
	                String rootPath = "";//request.getServletContext().getRealPath("");
	                rootPath = rootPath.substring(0, rootPath.lastIndexOf(File.separator));
	                rootPath = rootPath.substring(0, rootPath.lastIndexOf(File.separator));
	               
	                String finalPath = rootPath  + File.separator;
	               
	                path = " finalPath = " + finalPath;
	                
	                File dir = new File(finalPath + folderName);
	                if (!dir.exists())
	                    dir.mkdirs();
	 
	                File[] files = dir.listFiles();
	                for (File file2 : files) {
						path = path + file2.getName();
					}
	                // Create the file on server
	                File serverFile = new File(dir.getAbsolutePath()
	                        + File.separator + fileName);
	                BufferedOutputStream stream = new BufferedOutputStream(
	                        new FileOutputStream(serverFile));
	                
	                System.out.println(serverFile+": "+serverFile.getAbsolutePath());
	                stream.write(bytes);
	                stream.close();
	 
	                log.info("Server File Location="
	                        + serverFile.getAbsolutePath());
	                
	                return path;
	               
	            } catch (Exception e) {
	                e.printStackTrace();
	                return path;
	            }
	        } 
	        
	        return path;
		
		
	}
	public static String uploadFile(HttpServletRequest request, 
									String folderName, 
									MultipartFile file, 
									String fileName) {
		String path = uploadToLocalServer(request, folderName, file, fileName);
		//String path = uploadToRemoteServerFTP(request, folderName, file, fileName);
		return path;
		
	}
	
	public static String uploadFile(HttpServletRequest request, 
									InputStream uploadedInputStream,
									String folderName, 
							        String fileName) {
		String path = writeToFile(request, uploadedInputStream, folderName,  fileName);
		//String path = uploadToRemoteServerFTP(request, folderName, file, fileName);
		return path;
		
	}

	public static boolean deleteFile(String folderName, 
									 String fileName, 
									 String fileType, 
									 boolean isPartialFileName) {
		String rootPath = System.getProperty("catalina.home");
		String finalPath = rootPath  + File.separator + "webapps" + File.separator + "ROOT" + File.separator;
        System.out.println(finalPath + folderName);
		if (isPartialFileName) {
            try {
               
               File dir = new File(finalPath + folderName);
               FileFilter filter = new WildcardFileFilter("*" + fileName+ "*" + fileType);
               File[] files = dir.listFiles(filter);
               for (File file : files) {
            	   file.delete();
               }
               
                
                return true;
               
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        } else {
        	File file = new File(finalPath + folderName +  File.separator + fileName + fileType);
        	file.delete();
        }
         
        return false;

	} 
	
	///////////
	
	/**
	 * header sample
	 * {
	 * 	Content-Type=[image/png], 
	 * 	Content-Disposition=[form-data; name="file"; filename="filename.extension"]
	 * }
	 **/
	//get uploaded filename
	private String getFileName(MultivaluedMap<String, String> header) {

		String[] contentDisposition = header.getFirst("Content-Disposition").split(";");
		
		for (String filename : contentDisposition) {
			if ((filename.trim().startsWith("filename"))) {

				String[] name = filename.split("=");
				
				String finalFileName = name[1].trim().replaceAll("\"", "");
				return finalFileName;
			}
		}
		return "unknown";
	}

	//save to somewhere
	public static String writeToFile(HttpServletRequest request,
									InputStream uploadedInputStream,
	        						String folderName,
	        						String uploadedFileLocation) {

			// Creating the directory to store file
			String realPath = request.getSession().getServletContext().getRealPath("");
			System.out.println(realPath);
			realPath = realPath.substring(0, realPath.lastIndexOf(File.separator));  // 1 folder back (G:\Servers\apache-tomcat-7.0.42\webapps\)
			//realPath = realPath.substring(0, realPath.lastIndexOf(File.separator));
			realPath = realPath + File.separator + "ROOT";
			System.out.println(realPath);
	        String finalPath = realPath  + File.separator;
	        

            
	        
	        File dir = new File(finalPath + folderName);
	        if (!dir.exists())
	            dir.mkdirs();
	        
	        /*File[] files = dir.listFiles();
            for (File file2 : files) {
				path = path + file2.getName();
			}*/
            // Create the file on server
            File serverFile = new File(dir.getAbsolutePath() + File.separator + uploadedFileLocation);
			OutputStream outputStream = null;
			try {
				outputStream = new FileOutputStream(serverFile);
				int read = 0;
				byte[] bytes = new byte[1024];
	
				//outputStream = new FileOutputStream(new File(uploadedFileLocation));
				while ((read = uploadedInputStream.read(bytes)) != -1) {
					outputStream.write(bytes, 0, read);
				}
				outputStream.flush();
				outputStream.close();
				outputStream = null;
				System.gc();
			} catch (IOException e) {
	
				e.printStackTrace();
			}

	        return finalPath;

	   }
	public static String getRelativePath(HttpServletRequest request) {
		String rootPath = "";//request.getServletContext().getRealPath("");
        rootPath = rootPath.substring(0, rootPath.lastIndexOf(File.separator));
        rootPath = rootPath.substring(0, rootPath.lastIndexOf(File.separator));
       
        String finalPath = rootPath  + File.separator;
        
        return finalPath;
		
	}
}
