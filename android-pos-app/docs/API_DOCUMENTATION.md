# API Documentation - BANDT Enhanced POS

## Overview

This document provides comprehensive API documentation for the BANDT Enhanced POS application, including data models, business logic, and component interfaces.

## Data Models

### Core POS Models

#### Product
```kotlin
data class Product(
    val id: String,              // Unique product identifier
    val name: String,            // Product display name
    val price: Double,           // Product price in currency
    val category: String,        // Category ID (beverages, food, desserts, retail)
    val description: String = "", // Product description
    val imageUrl: String = "",   // Product image URL (optional)
    val inStock: Boolean = true, // Stock availability
    val stockQuantity: Int = 0   // Current stock quantity
)
```

#### CartItem
```kotlin
data class CartItem(
    val product: Product,        // Associated product
    val quantity: Int = 1        // Quantity in cart
) {
    val totalPrice: Double       // Calculated: product.price * quantity
        get() = product.price * quantity
}
```

#### Category
```kotlin
data class Category(
    val id: String,              // Unique category identifier
    val name: String,            // Display name
    val description: String = "" // Category description
)
```

#### Sale
```kotlin
data class Sale(
    val id: String,                           // Unique sale identifier
    val items: List<CartItem>,                // Items in the sale
    val totalAmount: Double,                  // Total sale amount
    val timestamp: Long = System.currentTimeMillis(), // Sale timestamp
    val paymentMethod: PaymentMethod = PaymentMethod.CASH // Payment method used
)
```

#### PaymentMethod
```kotlin
enum class PaymentMethod {
    CASH,           // Cash payment
    CARD,           // Credit/Debit card
    MOBILE_PAYMENT  // Mobile payment (Apple Pay, Google Pay, etc.)
}
```

### Gamification Models

#### CreditScore
```kotlin
data class CreditScore(
    val score: Int,              // Credit score (0-850)
    val totalSales: Double,      // Total sales amount
    val transactionCount: Int,   // Number of transactions
    val avgTransaction: Double,  // Average transaction amount
    val digitalAdoption: Double, // Digital payment percentage
    val activeDays: Int,         // Number of active business days
    val rating: String,          // Credit rating (Excellent, Good, Fair, Poor, Very Poor)
    val loanEligibility: LoanEligibility // Loan qualification details
)
```

#### LoanEligibility
```kotlin
data class LoanEligibility(
    val amount: Int,         // Maximum loan amount
    val interestRate: String, // Interest rate percentage
    val eligible: Boolean    // Loan eligibility status
)
```

#### UserProgress
```kotlin
data class UserProgress(
    val level: Int,                    // Current user level (0-10)
    val xp: Int,                      // Experience points
    val badges: List<Badge>,          // Earned and available badges
    val completedMissions: List<String> // Completed mission IDs
)
```

#### Badge
```kotlin
data class Badge(
    val id: String,              // Unique badge identifier
    val name: String,            // Badge display name
    val icon: String,            // Badge emoji/icon
    val description: String,     // Badge description
    val earned: Boolean = false, // Whether badge is earned
    val earnedDate: Date? = null // Date when badge was earned
)
```

#### Mission
```kotlin
data class Mission(
    val id: String,          // Unique mission identifier
    val title: String,       // Mission title
    val description: String, // Mission description
    val progress: Int,       // Current progress
    val target: Int,         // Target to complete mission
    val reward: String,      // Reward description
    val xpReward: Int,       // XP reward amount
    val type: MissionType,   // Mission type (DAILY, WEEKLY, MONTHLY)
    val completed: Boolean = false // Completion status
)
```

#### MissionType
```kotlin
enum class MissionType {
    DAILY,   // Resets every 24 hours
    WEEKLY,  // Resets every Monday
    MONTHLY  // Resets on 1st of month
}
```

### Analytics Models

#### SalesAnalytics
```kotlin
data class SalesAnalytics(
    val todaysSales: Double,                    // Today's total sales
    val todaysTransactions: Int,                // Today's transaction count
    val weekSales: Double,                      // This week's sales
    val monthSales: Double,                     // This month's sales
    val topProducts: List<ProductStat>,         // Top-selling products
    val paymentMethodStats: List<PaymentMethodStat>, // Payment method distribution
    val salesTrend: List<DailySales>           // Daily sales trend data
)
```

#### ProductStat
```kotlin
data class ProductStat(
    val productName: String,  // Product name
    val totalQuantity: Int,   // Total quantity sold
    val totalSales: Double    // Total revenue from product
)
```

#### PaymentMethodStat
```kotlin
data class PaymentMethodStat(
    val paymentMethod: String, // Payment method name
    val count: Int,           // Number of transactions
    val percentage: Double    // Percentage of total transactions
)
```

#### DailySales
```kotlin
data class DailySales(
    val date: String,      // Date string (e.g., "Mon", "Tue")
    val sales: Double,     // Sales amount for the day
    val transactions: Int  // Number of transactions
)
```

## Business Logic APIs

### Credit Score Calculation

#### calculateCreditScore()
```kotlin
fun calculateCreditScore(
    totalSales: Double,        // Total sales amount
    transactionCount: Int,     // Number of transactions
    digitalPaymentCount: Int,  // Number of digital payments
    activeDays: Int           // Number of active business days
): CreditScore
```

**Algorithm:**
- Base Score: 300 points
- Sales Volume: +min(200, totalSales/50) points
- Transaction Frequency: +min(150, transactionCount*2) points
- Average Transaction: +min(100, avgTransaction*10) points
- Digital Adoption: +digitalAdoptionPercentage points
- Business Consistency: +min(100, activeDays*5) points
- Maximum Score: 850 points

**Returns:** Complete CreditScore object with rating and loan eligibility

### User Level System

#### calculateUserLevel()
```kotlin
fun calculateUserLevel(xp: Int): Int
```

**XP Requirements:**
- Level 0: 0-99 XP
- Level 1: 100-399 XP
- Level 2: 400-699 XP
- Level 3: 700-999 XP
- Level 4: 1000-1399 XP
- Level 5: 1400-1899 XP
- Level 6: 1900-2499 XP
- Level 7: 2500-3199 XP
- Level 8: 3200-3999 XP
- Level 9: 4000-4999 XP
- Level 10: 5000+ XP

#### getXpForNextLevel()
```kotlin
fun getXpForNextLevel(currentLevel: Int): Int
```

**Returns:** XP required to reach the next level

## Component APIs

### Screen Components

#### POSMainScreen
```kotlin
@Composable
fun POSMainScreen(modifier: Modifier = Modifier)
```

**Features:**
- Product catalog with category filtering
- Shopping cart management
- Real-time total calculations
- Checkout navigation

**State Management:**
- `selectedCategory`: Currently selected product category
- `cartItems`: List of items in shopping cart
- `showCheckout`: Boolean for checkout screen navigation

#### DashboardScreen
```kotlin
@Composable
fun DashboardScreen(modifier: Modifier = Modifier)
```

**Features:**
- Credit score display with loan eligibility
- Sales overview cards (today, week, month)
- Top products analysis
- Payment method statistics
- Sales trend visualization

#### ProfileScreen
```kotlin
@Composable
fun ProfileScreen(modifier: Modifier = Modifier)
```

**Features:**
- User level and XP progress
- Badge collection display
- Active missions with progress
- Business statistics overview

### UI Components

#### ProductCard
```kotlin
@Composable
fun ProductCard(
    product: Product,           // Product to display
    onAddToCart: () -> Unit,   // Callback when add button is clicked
    modifier: Modifier = Modifier
)
```

#### CartItemCard
```kotlin
@Composable
fun CartItemCard(
    cartItem: CartItem,                    // Cart item to display
    onQuantityChange: (Int) -> Unit,       // Callback for quantity changes
    onRemove: () -> Unit,                  // Callback for item removal
    modifier: Modifier = Modifier
)
```

#### CreditScoreCard
```kotlin
@Composable
fun CreditScoreCard(creditScore: CreditScore)
```

**Features:**
- Credit score display with color-coded rating
- Loan eligibility information
- Business performance metrics

#### BadgeCard
```kotlin
@Composable
fun BadgeCard(badge: Badge)
```

**Features:**
- Badge icon and name display
- Earned status indication
- Visual distinction for earned vs. unearned badges

#### MissionCard
```kotlin
@Composable
fun MissionCard(mission: Mission)
```

**Features:**
- Mission title and description
- Progress bar with current/target values
- XP reward display
- Mission type indicator (Daily/Weekly/Monthly)

## Navigation API

### Screen Routes
```kotlin
sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object POS : Screen("pos", "POS", Icons.Default.ShoppingCart)
    object Dashboard : Screen("dashboard", "Dashboard", Icons.Default.Analytics)
    object Profile : Screen("profile", "Profile", Icons.Default.Person)
}
```

### Navigation Implementation
```kotlin
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    // Bottom navigation with three main screens
    // NavHost with composable destinations
}
```

## Sample Data APIs

### Product Categories
```kotlin
val categories = listOf(
    Category("beverages", "Beverages", "Hot and cold drinks"),
    Category("food", "Food", "Snacks and meals"),
    Category("desserts", "Desserts", "Sweet treats"),
    Category("retail", "Retail", "Merchandise and gifts")
)
```

### Sample Products
- **Beverages**: Americano, Latte, Cappuccino, Teas, Juices, Sodas
- **Food**: Sandwiches, Salads, Soups, Bagels, Muffins
- **Desserts**: Cookies, Cakes, Pastries, Ice Cream
- **Retail**: Mugs, T-shirts, Coffee Beans, Gift Cards

### Badge System
10 achievement badges covering:
- First sale completion
- Daily/weekly/monthly targets
- Digital payment adoption
- Product variety
- Customer service
- Business growth

### Mission System
5 active missions covering:
- Daily sales goals
- Digital payment targets
- Weekly sales targets
- Monthly revenue goals
- Product category variety

## Error Handling

### Common Error Scenarios
1. **Empty Cart Checkout**: Prevent checkout with empty cart
2. **Invalid Product Data**: Handle missing or invalid product information
3. **Payment Processing**: Manage payment method selection and validation
4. **Data Persistence**: Handle database read/write errors
5. **Navigation Errors**: Manage invalid navigation states

### Best Practices
- Use sealed classes for result types
- Implement proper error boundaries
- Provide user-friendly error messages
- Log errors for debugging
- Graceful degradation for non-critical features
