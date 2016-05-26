package com.letshare.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * Category model class, which is persistence object for 'category_fields' table
 * This is to show or hide 'Post new ad' fields based on category
 * @author Kranti K C
 * 
 */
@Entity
@Table(name="category_fields")
public class CategoryField {

	@Id
	@GeneratedValue(strategy=GenerationType.AUTO)
	@Column(name="category_field_id")
	private int categoryFieldId;
	
	@Column(name="category_id")
	private int categoryId;
	
	@Column(name="field")
	private String field;

	public int getCategoryFieldId() {
		return categoryFieldId;
	}

	public void setCategoryFieldId(int categoryFieldId) {
		this.categoryFieldId = categoryFieldId;
	}

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public String getField() {
		return field;
	}

	public void setField(String field) {
		this.field = field;
	}
	
}
