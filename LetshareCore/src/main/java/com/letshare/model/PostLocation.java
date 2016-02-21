package com.letshare.model;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;
import javax.ws.rs.FormParam;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

/**
 * PostDetails model class, which is persistence object for 'post_details' table
 * @author Kranti K C
 * 
 */
@Entity
@Table(name="post_location")
public class PostLocation {
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="post_location_id")
	private int postLocationId;
	
	@Column(name="location1_id")
	private int location1Id;
	
	@Column(name="city1_id")
	private int city1Id;
	
	@Column(name="location2_id")
	private int location2Id;
	
	@Column(name="city2_id")
	private int city2Id;
	
	@Column(name="location3_id")
	private int location3Id;
	
	@Column(name="city3_id")
	private int city3Id;
	
	@OneToOne(fetch=FetchType.LAZY,  cascade = CascadeType.ALL)
	private Post post;
	
	public PostLocation() {
		
	}
	
	public PostLocation(int location1Id,
			   			int city1Id,
			   			int location2Id,
			   			int city2Id,
			   			int location3Id,
			   			int city3Id) {
		this.location1Id = location1Id;
		this.city1Id = city1Id;
		this.location2Id  = location2Id;
		this.city2Id = city2Id;
		this.location3Id  = location3Id;
		this.city3Id  = city3Id;
	}

	public int getPostLocationId() {
		return postLocationId;
	}

	public void setPostLocationId(int postLocationId) {
		this.postLocationId = postLocationId;
	}

	public int getLocation1Id() {
		return location1Id;
	}

	public void setLocation1Id(int location1Id) {
		this.location1Id = location1Id;
	}

	public int getCity1Id() {
		return city1Id;
	}

	public void setCity1Id(int city1Id) {
		this.city1Id = city1Id;
	}

	public int getLocation2Id() {
		return location2Id;
	}

	public void setLocation2Id(int location2Id) {
		this.location2Id = location2Id;
	}

	public int getCity2Id() {
		return city2Id;
	}

	public void setCity2Id(int city2Id) {
		this.city2Id = city2Id;
	}

	public int getLocation3Id() {
		return location3Id;
	}

	public void setLocation3Id(int location3Id) {
		this.location3Id = location3Id;
	}

	public int getCity3Id() {
		return city3Id;
	}

	public void setCity3Id(int city3Id) {
		this.city3Id = city3Id;
	}

	public Post getPost() {
		return post;
	}

	public void setPost(Post post) {
		this.post = post;
	}
	
	
	
}
