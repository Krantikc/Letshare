package com.letshare.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * Category model class, which is persistence object for 'category' table
 * @author Kranti K C
 * 
 */
@Entity
@Table(name="category")
@XmlRootElement
public class Category {
	
	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="category_id")
	private int categoryId;
	
	@Column(name="name")
	private String name;
	
	@Column(name="level")
	private int level;
	
	@Column(name="parent_id")
	private int parentId;
	
	@Column(name="img")
	private String image;
	
	@Column(name="is_group")
	private boolean isCGroup;
	
	

	public Category() {
		
	}
	
	public Category(String name, int level, int parentId) {
		this.name = name;
		this.level = level;
		this.parentId = parentId;
	}

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public int getLevel() {
		return level;
	}

	public void setLevel(int level) {
		this.level = level;
	}

	public int getParentId() {
		return parentId;
	}

	public void setParentId(int parentId) {
		this.parentId = parentId;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public boolean isCGroup() {
		return isCGroup;
	}

	public void setCGroup(boolean isCGroup) {
		this.isCGroup = isCGroup;
	}

}
