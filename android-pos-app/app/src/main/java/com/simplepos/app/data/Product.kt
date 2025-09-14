package com.simplepos.app.data

data class Product(
    val id: String,
    val name: String,
    val price: Double,
    val category: String,
    val description: String = "",
    val imageUrl: String = "",
    val inStock: Boolean = true,
    val stockQuantity: Int = 0
)

data class CartItem(
    val product: Product,
    val quantity: Int = 1
) {
    val totalPrice: Double
        get() = product.price * quantity
}

data class Category(
    val id: String,
    val name: String,
    val description: String = ""
)

data class Sale(
    val id: String,
    val items: List<CartItem>,
    val totalAmount: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val paymentMethod: PaymentMethod = PaymentMethod.CASH
)

enum class PaymentMethod {
    CASH,
    CARD,
    MOBILE_PAYMENT
}
