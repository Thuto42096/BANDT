package com.simplepos.app.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE category = :category ORDER BY name ASC")
    fun getProductsByCategory(category: String): Flow<List<ProductEntity>>

    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProductById(id: Int): ProductEntity?

    @Query("SELECT * FROM products WHERE quantity < 5")
    fun getLowStockProducts(): Flow<List<ProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: ProductEntity): Long

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Delete
    suspend fun deleteProduct(product: ProductEntity)

    @Query("UPDATE products SET quantity = quantity + :amount WHERE id = :productId")
    suspend fun refillStock(productId: Int, amount: Int)

    @Query("UPDATE products SET price = :newPrice WHERE id = :productId")
    suspend fun updatePrice(productId: Int, newPrice: Double)

    @Query("UPDATE products SET quantity = quantity - :amount WHERE id = :productId AND quantity >= :amount")
    suspend fun reduceStock(productId: Int, amount: Int): Int
}

@Dao
interface SaleDao {
    @Query("SELECT * FROM sales ORDER BY timestamp DESC")
    fun getAllSales(): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE DATE(timestamp) = DATE('now') ORDER BY timestamp DESC")
    fun getTodaysSales(): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE timestamp >= :startDate ORDER BY timestamp DESC")
    fun getSalesSince(startDate: Date): Flow<List<SaleEntity>>

    @Query("SELECT COUNT(*) FROM sales WHERE DATE(timestamp) = DATE('now')")
    suspend fun getTodaysSalesCount(): Int

    @Query("SELECT SUM(total_amount) FROM sales WHERE DATE(timestamp) = DATE('now')")
    suspend fun getTodaysSalesTotal(): Double?

    @Query("SELECT COUNT(*) FROM sales WHERE payment_method != 'CASH' AND DATE(timestamp) = DATE('now')")
    suspend fun getTodaysDigitalPayments(): Int

    @Query("SELECT COUNT(*) FROM sales WHERE timestamp >= :startDate")
    suspend fun getSalesCountSince(startDate: Date): Int

    @Query("SELECT SUM(total_amount) FROM sales WHERE timestamp >= :startDate")
    suspend fun getSalesTotalSince(startDate: Date): Double?

    @Insert
    suspend fun insertSale(sale: SaleEntity): Long

    @Query("SELECT payment_method, COUNT(*) as count FROM sales GROUP BY payment_method")
    suspend fun getPaymentMethodStats(): List<PaymentMethodStat>
}

@Dao
interface SaleItemDao {
    @Query("SELECT * FROM sale_items WHERE sale_id = :saleId")
    suspend fun getSaleItems(saleId: Int): List<SaleItemEntity>

    @Insert
    suspend fun insertSaleItems(items: List<SaleItemEntity>)

    @Query("SELECT product_name, SUM(quantity) as total_quantity, SUM(total) as total_sales FROM sale_items GROUP BY product_name ORDER BY total_sales DESC LIMIT 10")
    suspend fun getTopSellingProducts(): List<ProductSalesStat>
}

@Dao
interface CreditScoreDao {
    @Query("SELECT * FROM credit_scores WHERE id = 1")
    suspend fun getCreditScore(): CreditScoreEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCreditScore(creditScore: CreditScoreEntity)

    @Update
    suspend fun updateCreditScore(creditScore: CreditScoreEntity)
}

@Dao
interface UserProgressDao {
    @Query("SELECT * FROM user_progress WHERE id = 1")
    suspend fun getUserProgress(): UserProgressEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUserProgress(progress: UserProgressEntity)

    @Update
    suspend fun updateUserProgress(progress: UserProgressEntity)

    @Query("UPDATE user_progress SET xp = xp + :xpAmount WHERE id = 1")
    suspend fun addXP(xpAmount: Int)

    @Query("UPDATE user_progress SET level = :newLevel WHERE id = 1")
    suspend fun updateLevel(newLevel: Int)
}

// Data classes for query results
data class PaymentMethodStat(
    @ColumnInfo(name = "payment_method")
    val paymentMethod: String,
    val count: Int
)

data class ProductSalesStat(
    @ColumnInfo(name = "product_name")
    val productName: String,
    @ColumnInfo(name = "total_quantity")
    val totalQuantity: Int,
    @ColumnInfo(name = "total_sales")
    val totalSales: Double
)
