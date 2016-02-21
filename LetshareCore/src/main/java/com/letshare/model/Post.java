package com.letshare.model;

import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.ws.rs.FormParam;


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
	
	@Column(name="category_id")
	private int categoryId;
	
	@Column(name="post_location_id")
	private int postLocationId;
	
	@OneToOne(cascade = CascadeType.ALL)
	private PostLocation postLocation;
	
	@Column(name="user_id")
	private int userId;
	
	@OneToOne(cascade = CascadeType.ALL)
	private PostDetails postDetails;
	
	@Column(name="verification_code")
	private String verificationCode;
	
	@Column(name="active")
	private boolean active;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="posted_date")
	private Date postedDate;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="modified_date")
	private Date modifiedDate;

	public Post() {
		
	}

	public Post(String title,
			   	String description,
			   	int categoryId,
			   	int userId,
			   	PostLocation postLocation,
			   	PostDetails postDetails,
			   	Date postedDate,
			   	Date modifiedDate,
			   	boolean active
			   	) {
		this.title = title;
		this.description = description;
		this.categoryId = categoryId;
		this.userId = userId;
		this.postLocation = postLocation;
		this.postDetails = postDetails;
		this.postedDate = postedDate;
		this.modifiedDate = modifiedDate;
		this.active = active;
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

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
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


	public String getVerificationCode() {
		return verificationCode;
	}

	public void setVerificationCode(String verificationCode) {
		this.verificationCode = verificationCode;
	}

	public boolean getActive() {
		return active;
	}

	public void setActive(boolean active) {
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

	public PostLocation getPostLocation() {
		return postLocation;
	}

	public void setPostLocation(PostLocation postLocation) {
		this.postLocation = postLocation;
	}

	public PostDetails getPostDetails() {
		return postDetails;
	}

	public void setPostDetails(PostDetails postDetails) {
		this.postDetails = postDetails;
	}
	
	
	
}
