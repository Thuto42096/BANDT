package com.simplepos.app.data.gamification

import java.util.Date

// Credit Score System
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

// Gamification System
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
    val earned: Boolean = false,
    val earnedDate: Date? = null
)

data class Mission(
    val id: String,
    val title: String,
    val description: String,
    val progress: Int,
    val target: Int,
    val reward: String,
    val xpReward: Int,
    val type: MissionType,
    val completed: Boolean = false
)

enum class MissionType {
    DAILY, WEEKLY, MONTHLY
}

// Analytics Data
data class SalesAnalytics(
    val todaysSales: Double,
    val todaysTransactions: Int,
    val weekSales: Double,
    val monthSales: Double,
    val topProducts: List<ProductStat>,
    val paymentMethodStats: List<PaymentMethodStat>,
    val salesTrend: List<DailySales>
)

data class ProductStat(
    val productName: String,
    val totalQuantity: Int,
    val totalSales: Double
)

data class PaymentMethodStat(
    val paymentMethod: String,
    val count: Int,
    val percentage: Double
)

data class DailySales(
    val date: String,
    val sales: Double,
    val transactions: Int
)

// Sample Data for Gamification
object GamificationSampleData {
    
    val badges = listOf(
        Badge("first_sale", "First Sale", "🎉", "Complete your first sale"),
        Badge("daily_achiever", "Daily Achiever", "⭐", "Complete 10 sales in one day"),
        Badge("digital_pioneer", "Digital Pioneer", "💳", "Accept 5 digital payments"),
        Badge("week_warrior", "Week Warrior", "🏆", "Complete 50 sales in one week"),
        Badge("month_master", "Month Master", "👑", "Complete 200 sales in one month"),
        Badge("cash_king", "Cash King", "💰", "Reach $1000 in daily sales"),
        Badge("variety_vendor", "Variety Vendor", "🛍️", "Sell products from all categories"),
        Badge("loyal_customer", "Loyal Customer", "❤️", "Serve 100 unique customers"),
        Badge("efficiency_expert", "Efficiency Expert", "⚡", "Complete 20 sales in one hour"),
        Badge("growth_guru", "Growth Guru", "📈", "Increase weekly sales by 50%")
    )
    
    val missions = listOf(
        Mission(
            "daily_sales_5", "Daily Sales Goal", "Complete 5 sales today",
            0, 5, "Daily Achiever Badge", 50, MissionType.DAILY
        ),
        Mission(
            "digital_payments_3", "Go Digital", "Accept 3 digital payments today",
            0, 3, "Digital Pioneer Badge", 30, MissionType.DAILY
        ),
        Mission(
            "weekly_sales_25", "Weekly Target", "Complete 25 sales this week",
            0, 25, "Week Warrior Badge", 200, MissionType.WEEKLY
        ),
        Mission(
            "monthly_revenue_2000", "Monthly Revenue", "Reach $2000 in sales this month",
            0, 2000, "Month Master Badge", 500, MissionType.MONTHLY
        ),
        Mission(
            "category_variety", "Product Variety", "Sell from all 4 categories today",
            0, 4, "Variety Vendor Badge", 75, MissionType.DAILY
        )
    )
    
    fun calculateCreditScore(
        totalSales: Double,
        transactionCount: Int,
        digitalPaymentCount: Int,
        activeDays: Int
    ): CreditScore {
        val avgTransaction = if (transactionCount > 0) totalSales / transactionCount else 0.0
        val digitalAdoption = if (transactionCount > 0) (digitalPaymentCount.toDouble() / transactionCount) * 100 else 0.0
        
        // Credit score calculation (0-850 scale)
        var score = 300 // Base score
        
        // Sales volume factor (max 200 points)
        score += minOf(200, (totalSales / 50).toInt())
        
        // Transaction frequency factor (max 150 points)
        score += minOf(150, transactionCount * 2)
        
        // Average transaction size factor (max 100 points)
        score += minOf(100, (avgTransaction * 10).toInt())
        
        // Digital adoption factor (max 100 points)
        score += (digitalAdoption).toInt()
        
        // Business consistency factor (max 100 points)
        score += minOf(100, activeDays * 5)
        
        score = minOf(850, score) // Cap at 850
        
        val rating = when (score) {
            in 750..850 -> "Excellent"
            in 650..749 -> "Good"
            in 550..649 -> "Fair"
            in 450..549 -> "Poor"
            else -> "Very Poor"
        }
        
        val loanEligibility = when {
            score >= 700 -> LoanEligibility(50000, "8.5%", true)
            score >= 600 -> LoanEligibility(25000, "12.0%", true)
            score >= 500 -> LoanEligibility(10000, "15.5%", true)
            else -> LoanEligibility(0, "N/A", false)
        }
        
        return CreditScore(
            score = score,
            totalSales = totalSales,
            transactionCount = transactionCount,
            avgTransaction = avgTransaction,
            digitalAdoption = digitalAdoption,
            activeDays = activeDays,
            rating = rating,
            loanEligibility = loanEligibility
        )
    }
    
    fun calculateUserLevel(xp: Int): Int {
        return when {
            xp >= 5000 -> 10
            xp >= 4000 -> 9
            xp >= 3200 -> 8
            xp >= 2500 -> 7
            xp >= 1900 -> 6
            xp >= 1400 -> 5
            xp >= 1000 -> 4
            xp >= 700 -> 3
            xp >= 400 -> 2
            xp >= 100 -> 1
            else -> 0
        }
    }
    
    fun getXpForNextLevel(currentLevel: Int): Int {
        return when (currentLevel) {
            0 -> 100
            1 -> 400
            2 -> 700
            3 -> 1000
            4 -> 1400
            5 -> 1900
            6 -> 2500
            7 -> 3200
            8 -> 4000
            9 -> 5000
            else -> 5000
        }
    }
}
