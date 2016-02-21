package com.letshare.dao;

import java.util.List;

import com.letshare.model.Category;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to Category
 */
public interface CategoriesDao {
	

		public int addCategory(Category category);
		public boolean updateCategory(Category category);
		public List<Category> getCategories();

}
