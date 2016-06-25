package com.letshare.helper;

import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;

import com.letshare.model.Category;

public class PostFilter {
	private int start;
	private int size;
	private boolean active;
	private int categoryId;
	private String postType;
	private int city1Id;
	private int city2Id;
	private Date processDate;
	private int location1Id;
	private int location2Id;
	private String title;
	private String token;
	
	public PostFilter() {
		
	}



	public PostFilter(int start, int size, boolean active, int categoryId, String postType, int city1Id, int city2Id,
			Date processDate, int location1Id, int location2Id, String title, String token) {

		this.start = start;
		this.size = size;
		this.active = active;
		this.categoryId = categoryId;
		this.postType = postType;
		this.city1Id = city1Id;
		this.city2Id = city2Id;
		this.processDate = processDate;
		this.location1Id = location1Id;
		this.location2Id = location2Id;
		this.title = title;
		this.token = token;
	}



	public boolean isActive() {
		return active;
	}



	public void setActive(boolean active) {
		this.active = active;
	}



	public int getStart() {
		return start;
	}



	public void setStart(int start) {
		this.start = start;
	}



	public int getSize() {
		return size;
	}



	public void setSize(int size) {
		this.size = size;
	}



	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public String getPostType() {
		return postType;
	}

	public void setPostType(String postType) {
		this.postType = postType;
	}

	public int getCity1Id() {
		return city1Id;
	}

	public void setCity1Id(int city1Id) {
		this.city1Id = city1Id;
	}

	public int getCity2Id() {
		return city2Id;
	}

	public void setCity2Id(int city2Id) {
		this.city2Id = city2Id;
	}

	public Date getProcessDate() {
		return processDate;
	}

	public void setProcessDate(Date processDate) {
		this.processDate = processDate;
	}

	public int getLocation1Id() {
		return location1Id;
	}

	public void setLocation1Id(int location1Id) {
		this.location1Id = location1Id;
	}

	public int getLocation2Id() {
		return location2Id;
	}

	public void setLocation2Id(int location2Id) {
		this.location2Id = location2Id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}


	
	
}
