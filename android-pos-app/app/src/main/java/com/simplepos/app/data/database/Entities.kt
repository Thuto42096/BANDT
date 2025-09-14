package com.simplepos.app.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ColumnInfo
import java.util.Date

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val description: String,
    val price: Double,
    val category: String,
    val quantity: Int = 0,
    @ColumnInfo(name = "image_url")
    val imageUrl: String? = null,
    @ColumnInfo(name = "created_at")
    val createdAt: Date = Date()
)

@Entity(tableName = "sales")
data class SaleEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    @ColumnInfo(name = "total_amount")
    val totalAmount: Double,
    val tax: Double,
    @ColumnInfo(name = "payment_method")
    val paymentMethod: String,
    val timestamp: Date = Date(),
    @ColumnInfo(name = "item_count")
    val itemCount: Int
)

@Entity(tableName = "sale_items")
data class SaleItemEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    @ColumnInfo(name = "sale_id")
    val saleId: Int,
    @ColumnInfo(name = "product_id")
    val productId: Int,
    @ColumnInfo(name = "product_name")
    val productName: String,
    val quantity: Int,
    val price: Double,
    val total: Double
)

@Entity(tableName = "credit_scores")
data class CreditScoreEntity(
    @PrimaryKey
    val id: Int = 1,
    val score: Int,
    @ColumnInfo(name = "total_sales")
    val totalSales: Double,
    @ColumnInfo(name = "transaction_count")
    val transactionCount: Int,
    @ColumnInfo(name = "avg_transaction")
    val avgTransaction: Double,
    @ColumnInfo(name = "digital_adoption")
    val digitalAdoption: Double,
    @ColumnInfo(name = "active_days")
    val activeDays: Int,
    @ColumnInfo(name = "last_updated")
    val lastUpdated: Date = Date()
)

@Entity(tableName = "user_progress")
data class UserProgressEntity(
    @PrimaryKey
    val id: Int = 1,
    val level: Int = 1,
    val xp: Int = 0,
    @ColumnInfo(name = "badges_earned")
    val badgesEarned: String = "", // JSON string of badge IDs
    @ColumnInfo(name = "missions_completed")
    val missionsCompleted: String = "", // JSON string of completed mission IDs
    @ColumnInfo(name = "last_updated")
    val lastUpdated: Date = Date()
)

// Data classes for business logic
data class CreditScore(
    val score: Int,
    val totalSales: Double,
    val transactionCount: Int,
    val avgTransaction: Double,
    val digitalAdoption: Double,
    val activeDays: Int,
    val rating: String,
    val loanEligibility: LoanEligibility
)

data class LoanEligibility(
    val amount: Int,
    val interestRate: String,
    val eligible: Boolean
)

data class UserProgress(
    val level: Int,
    val xp: Int,
    val badges: List<Badge>,
    val completedMissions: List<String>
)

data class Badge(
    val id: String,
    val name: String,
    val icon: String,
    val description: String,
    val earned: Boolean = false
)

data class Mission(
    val id: String,
    val title: String,
    val description: String,
    val progress: Int,
    val target: Int,
    val reward: String,
    val type: MissionType,
    val completed: Boolean = false
)

enum class MissionType {
    DAILY, WEEKLY, MONTHLY
}
