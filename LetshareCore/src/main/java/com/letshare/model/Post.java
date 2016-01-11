package com.letshare.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Post model class, which is persistence object for 'post' table
 * @author Kranti K C
 * 
 */
@Entity
@Table(name="post")
public class Post {
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="post_id")
	private int postId;
	
	@Column(name="title")
	private String title;
	
	@Column(name="description")
	private String description;
	
	@Column(name="main_category_id")
	private int mainCategoryId;
	
	@Column(name="sub_category_id")
	private int subCategoryId;
	
	@Column(name="post_location_id")
	private int postLocationId;
	
	@Column(name="user_id")
	private int userId;
	
	@Column(name="post_details_id")
	private int postDetailsId;
	
	@Column(name="verification_code")
	private String verificationCode;
	
	@Column(name="active")
	private String active;
	
	@Column(name="posted_date")
	private Date postedDate;
	
	@Column(name="modified_date")
	private Date modifiedDate;

	public Post() {
		
	}
	
	public Post(String title, String description) {
		this.title = title;
		this.description = description;
	}
	public int getPostId() {
		return postId;
	}

	public void setPostId(int postId) {
		this.postId = postId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public int getMainCategoryId() {
		return mainCategoryId;
	}

	public void setMainCategoryId(int mainCategoryId) {
		this.mainCategoryId = mainCategoryId;
	}

	public int getSubCategoryId() {
		return subCategoryId;
	}

	public void setSubCategoryId(int subCategoryId) {
		this.subCategoryId = subCategoryId;
	}

	public int getPostLocationId() {
		return postLocationId;
	}

	public void setPostLocationId(int postLocationId) {
		this.postLocationId = postLocationId;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public int getPostDetailsId() {
		return postDetailsId;
	}

	public void setPostDetailsId(int postDetailsId) {
		this.postDetailsId = postDetailsId;
	}

	public String getVerificationCode() {
		return verificationCode;
	}

	public void setVerificationCode(String verificationCode) {
		this.verificationCode = verificationCode;
	}

	public String getActive() {
		return active;
	}

	public void setActive(String active) {
		this.active = active;
	}

	public Date getPostedDate() {
		return postedDate;
	}

	public void setPostedDate(Date postedDate) {
		this.postedDate = postedDate;
	}

	public Date getModifiedDate() {
		return modifiedDate;
	}

	public void setModifiedDate(Date modifiedDate) {
		this.modifiedDate = modifiedDate;
	}
	
	
	
}
