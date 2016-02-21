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

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

/**
 * PostDetails model class, which is persistence object for 'post_details' table
 * @author Kranti K C
 * 
 */
@Entity
@Table(name="post_details")
public class PostDetails {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="post_details_id")
	private int postDetailsId;
	
	@Column(name="unique_id")
	private String uniqueId;
	
	@Column(name="color")
	private String color;
	
	@Column(name="measurement")
	private String measurement; // Measurement to define Capacity and Availability
	
	@Column(name="capacity")
	private int capacity;  // Capacity in number for car, bike, area
	
	@Column(name="availability")
	private int availability; // Availability in number out of specified capacity for car, bike, area
	
	@Column(name="amenities")
	private String amenities;
	
	@Column(name="brand")
	private String brand; // Brand of machine, car, bike etc (can be building name for area)
	
	@Column(name="age")
	private String age; // Age of machine, area, car, bike 
	
	
	@OneToOne(fetch=FetchType.LAZY,  cascade = CascadeType.ALL)
	private Post post;
	
	
	public PostDetails() {
		
	}
	
	public PostDetails(String uniqueId,
					   String color,
					   String measurement,
					   int capacity,
					   int availability,
					   String amenities,
					   String brand,
					   String age) {
		this.uniqueId = uniqueId;
		this.color  = color;
		this.measurement = measurement;
		this.capacity  = capacity;
		this.availability  = availability;
		this.amenities  = amenities;
		this.brand  = brand;
		this.age = age;
	}
	
	public int getPostDetailsId() {
		return postDetailsId;
	}

	public void setPostDetailsId(int postDetailsId) {
		this.postDetailsId = postDetailsId;
	}

	public String getUniqueId() {
		return uniqueId;
	}

	public void setUniqueId(String uniqueId) {
		this.uniqueId = uniqueId;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getMeasurement() {
		return measurement;
	}

	public void setMeasurement(String measurement) {
		this.measurement = measurement;
	}

	public String getAmenities() {
		return amenities;
	}

	public void setAmenities(String amenities) {
		this.amenities = amenities;
	}

	public String getBrand() {
		return brand;
	}

	public void setBrand(String brand) {
		this.brand = brand;
	}

	public Post getPost() {
		return post;
	}

	public void setPost(Post post) {
		this.post = post;
	}

	public int getCapacity() {
		return capacity;
	}

	public void setCapacity(int capacity) {
		this.capacity = capacity;
	}

	public int getAvailability() {
		return availability;
	}

	public void setAvailability(int availability) {
		this.availability = availability;
	}

	public String getAge() {
		return age;
	}

	public void setAge(String age) {
		this.age = age;
	}

}
