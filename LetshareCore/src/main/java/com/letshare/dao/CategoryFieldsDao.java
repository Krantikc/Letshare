package com.letshare.dao;

import java.util.List;

import com.letshare.model.Category;
import com.letshare.model.CategoryField;

/**
 * 
 * @author Kranti K C
 * Interface that defines CRUD related to CategoryField
 */
public interface CategoryFieldsDao {
	

		public int addCategoryField(CategoryField categoryField);
		public boolean updateCategoryField(CategoryField categoryField);
		public List<CategoryField> getCategoryFieldsByCategoryId(int categoryId);

}
