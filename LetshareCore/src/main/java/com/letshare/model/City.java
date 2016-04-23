package com.letshare.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * City model class, which is persistence object for 'city' table
 * @author Kranti K C
 * 
 */
@Entity
@Table(name="city")
public class City {
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="city_id")
	private int cityId;
	
	@Column(name="name")
	private String name;

	public int getCityId() {
		return cityId;
	}

	public void setCityId(int cityId) {
		this.cityId = cityId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	
}
