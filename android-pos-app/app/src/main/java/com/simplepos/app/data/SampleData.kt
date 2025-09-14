package com.simplepos.app.data

object SampleData {
    
    val categories = listOf(
        Category("beverages", "Beverages", "Hot and cold drinks"),
        Category("food", "Food", "Snacks and meals"),
        Category("desserts", "Desserts", "Sweet treats"),
        Category("retail", "Retail", "Merchandise and gifts")
    )
    
    val products = listOf(
        // Beverages
        Product("coffee_americano", "Americano", 3.50, "beverages", "Classic black coffee", "", true, 50),
        Product("coffee_latte", "Latte", 4.25, "beverages", "Espresso with steamed milk", "", true, 45),
        Product("coffee_cappuccino", "Cappuccino", 4.00, "beverages", "Espresso with foam", "", true, 40),
        Product("tea_green", "Green Tea", 2.75, "beverages", "Organic green tea", "", true, 30),
        Product("tea_black", "Black Tea", 2.50, "beverages", "Classic black tea", "", true, 35),
        Product("juice_orange", "Orange Juice", 3.25, "beverages", "Fresh squeezed", "", true, 20),
        Product("soda_cola", "Cola", 2.00, "beverages", "Classic cola drink", "", true, 60),
        Product("water_sparkling", "Sparkling Water", 1.75, "beverages", "Refreshing sparkling water", "", true, 40),
        
        // Food
        Product("sandwich_club", "Club Sandwich", 8.50, "food", "Triple decker with turkey and bacon", "", true, 15),
        Product("sandwich_veggie", "Veggie Sandwich", 7.25, "food", "Fresh vegetables and hummus", "", true, 20),
        Product("salad_caesar", "Caesar Salad", 9.75, "food", "Romaine lettuce with caesar dressing", "", true, 12),
        Product("salad_greek", "Greek Salad", 8.95, "food", "Mixed greens with feta cheese", "", true, 18),
        Product("soup_tomato", "Tomato Soup", 5.50, "food", "Creamy tomato soup", "", true, 25),
        Product("bagel_plain", "Plain Bagel", 2.25, "food", "Fresh baked bagel", "", true, 30),
        Product("muffin_blueberry", "Blueberry Muffin", 3.75, "food", "Fresh blueberry muffin", "", true, 20),
        
        // Desserts
        Product("cake_chocolate", "Chocolate Cake", 5.95, "desserts", "Rich chocolate layer cake", "", true, 8),
        Product("cookie_chocolate_chip", "Chocolate Chip Cookie", 2.50, "desserts", "Classic chocolate chip", "", true, 25),
        Product("donut_glazed", "Glazed Donut", 1.95, "desserts", "Classic glazed donut", "", true, 30),
        Product("ice_cream_vanilla", "Vanilla Ice Cream", 4.25, "desserts", "Premium vanilla ice cream", "", true, 15),
        Product("pie_apple", "Apple Pie", 4.75, "desserts", "Homemade apple pie slice", "", true, 10),
        
        // Retail
        Product("mug_coffee", "Coffee Mug", 12.99, "retail", "Ceramic coffee mug with logo", "", true, 25),
        Product("tshirt_logo", "Logo T-Shirt", 19.99, "retail", "Cotton t-shirt with cafe logo", "", true, 15),
        Product("beans_coffee", "Coffee Beans", 15.50, "retail", "Premium coffee beans (1lb bag)", "", true, 20),
        Product("gift_card_25", "Gift Card $25", 25.00, "retail", "Gift card worth $25", "", true, 100)
    )
    
    fun getProductsByCategory(categoryId: String): List<Product> {
        return products.filter { it.category == categoryId }
    }
    
    fun getProductById(productId: String): Product? {
        return products.find { it.id == productId }
    }
    
    fun getCategoryById(categoryId: String): Category? {
        return categories.find { it.id == categoryId }
    }
}
