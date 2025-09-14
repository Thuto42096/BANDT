# Developer Guide - BANDT Enhanced POS

## Overview

This guide provides comprehensive information for developers working on the BANDT Enhanced POS application, including architecture, coding standards, and contribution guidelines.

## 🏗 Architecture Overview

### MVVM Pattern
The application follows the Model-View-ViewModel (MVVM) architecture pattern:

- **Model**: Data classes, database entities, and business logic
- **View**: Jetpack Compose UI components and screens
- **ViewModel**: State management and business logic coordination

### Project Structure
```
app/src/main/java/com/simplepos/app/
├── MainActivity.kt                    # Main activity with navigation
├── data/                             # Data layer
│   ├── Product.kt                    # Core data models
│   ├── SampleData.kt                 # Sample data provider
│   ├── database/                     # Database layer
│   │   ├── Entities.kt               # Room database entities
│   │   └── Daos.kt                   # Database access objects
│   └── gamification/                 # Gamification logic
│       └── GamificationData.kt       # Gamification models & algorithms
├── ui/                               # UI layer
│   ├── components/                   # Reusable UI components
│   │   ├── ProductCard.kt            # Product display component
│   │   └── CartItemCard.kt           # Cart item component
│   ├── screens/                      # Screen composables
│   │   ├── POSMainScreen.kt          # Main POS interface
│   │   ├── CheckoutScreen.kt         # Checkout process
│   │   ├── DashboardScreen.kt        # Analytics dashboard
│   │   └── ProfileScreen.kt          # Gamification profile
│   └── theme/                        # App theming
│       ├── Color.kt                  # Color definitions
│       ├── Theme.kt                  # Material 3 theme
│       └── Type.kt                   # Typography
```

## 🛠 Technology Stack

### Core Technologies
- **Kotlin 1.9.20**: Primary programming language
- **Jetpack Compose**: Modern UI toolkit
- **Material 3**: Design system and components
- **Room Database**: Local data persistence
- **Navigation Compose**: Screen navigation
- **Coroutines**: Asynchronous programming

### Key Dependencies
```gradle
dependencies {
    // Compose BOM
    implementation platform('androidx.compose:compose-bom:2023.10.01')
    
    // Core Compose
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.ui:ui-tooling-preview'
    implementation 'androidx.compose.material3:material3'
    
    // Activity Compose
    implementation 'androidx.activity:activity-compose:1.8.0'
    
    // Navigation
    implementation 'androidx.navigation:navigation-compose:2.7.4'
    
    // Room Database
    implementation 'androidx.room:room-runtime:2.6.0'
    implementation 'androidx.room:room-ktx:2.6.0'
    kapt 'androidx.room:room-compiler:2.6.0'
    
    // Lifecycle
    implementation 'androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    
    // Icons
    implementation 'androidx.compose.material:material-icons-extended'
}
```

## 🎨 UI Development

### Jetpack Compose Guidelines

#### Component Structure
```kotlin
@Composable
fun ComponentName(
    // Required parameters first
    requiredParam: Type,
    // Optional parameters with defaults
    optionalParam: Type = defaultValue,
    // Callbacks
    onAction: () -> Unit,
    // Modifier last
    modifier: Modifier = Modifier
) {
    // Component implementation
}
```

#### State Management
```kotlin
@Composable
fun StatefulComponent() {
    // Use remember for simple state
    var simpleState by remember { mutableStateOf(initialValue) }
    
    // Use rememberSaveable for state that survives configuration changes
    var persistentState by rememberSaveable { mutableStateOf(initialValue) }
    
    // Hoist state when needed by parent components
    StatelessComponent(
        value = simpleState,
        onValueChange = { simpleState = it }
    )
}
```

#### Material 3 Usage
```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaterialComponent() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        // Card content
    }
}
```

### Custom Components

#### Creating Reusable Components
1. **Single Responsibility**: Each component should have one clear purpose
2. **Parameterization**: Make components flexible with parameters
3. **Modifier Support**: Always accept and apply Modifier parameter
4. **Preview Support**: Add @Preview composables for development

```kotlin
@Composable
fun CustomCard(
    title: String,
    content: String,
    onAction: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        onClick = onAction
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium
            )
            Text(
                text = content,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Preview
@Composable
fun CustomCardPreview() {
    SimplePOSTheme {
        CustomCard(
            title = "Sample Title",
            content = "Sample content",
            onAction = { }
        )
    }
}
```

## 💾 Data Management

### Room Database Setup

#### Entity Definition
```kotlin
@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val name: String,
    val price: Double,
    val category: String,
    @ColumnInfo(name = "created_at")
    val createdAt: Date = Date()
)
```

#### DAO Implementation
```kotlin
@Dao
interface ProductDao {
    @Query("SELECT * FROM products")
    fun getAllProducts(): Flow<List<ProductEntity>>
    
    @Query("SELECT * FROM products WHERE category = :category")
    fun getProductsByCategory(category: String): Flow<List<ProductEntity>>
    
    @Insert
    suspend fun insertProduct(product: ProductEntity)
    
    @Update
    suspend fun updateProduct(product: ProductEntity)
    
    @Delete
    suspend fun deleteProduct(product: ProductEntity)
}
```

#### Database Class
```kotlin
@Database(
    entities = [ProductEntity::class, SaleEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun saleDao(): SaleDao
    
    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        
        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "pos_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
```

### Repository Pattern
```kotlin
class ProductRepository(private val productDao: ProductDao) {
    fun getAllProducts(): Flow<List<Product>> = 
        productDao.getAllProducts().map { entities ->
            entities.map { it.toProduct() }
        }
    
    suspend fun insertProduct(product: Product) {
        productDao.insertProduct(product.toEntity())
    }
}
```

## 🎮 Gamification System

### Credit Score Algorithm
```kotlin
fun calculateCreditScore(
    totalSales: Double,
    transactionCount: Int,
    digitalPaymentCount: Int,
    activeDays: Int
): CreditScore {
    val avgTransaction = if (transactionCount > 0) totalSales / transactionCount else 0.0
    val digitalAdoption = if (transactionCount > 0) 
        (digitalPaymentCount.toDouble() / transactionCount) * 100 else 0.0
    
    var score = 300 // Base score
    
    // Sales volume factor (max 200 points)
    score += minOf(200, (totalSales / 50).toInt())
    
    // Transaction frequency factor (max 150 points)
    score += minOf(150, transactionCount * 2)
    
    // Average transaction size factor (max 100 points)
    score += minOf(100, (avgTransaction * 10).toInt())
    
    // Digital adoption factor (max 100 points)
    score += digitalAdoption.toInt()
    
    // Business consistency factor (max 100 points)
    score += minOf(100, activeDays * 5)
    
    score = minOf(850, score) // Cap at 850
    
    return CreditScore(
        score = score,
        totalSales = totalSales,
        transactionCount = transactionCount,
        avgTransaction = avgTransaction,
        digitalAdoption = digitalAdoption,
        activeDays = activeDays,
        rating = getRating(score),
        loanEligibility = getLoanEligibility(score)
    )
}
```

### Mission System
```kotlin
fun checkMissionProgress(mission: Mission, userStats: UserStats): Mission {
    val newProgress = when (mission.id) {
        "daily_sales_5" -> userStats.todaysSales
        "digital_payments_3" -> userStats.todaysDigitalPayments
        "weekly_sales_25" -> userStats.weekSales
        "monthly_revenue_2000" -> userStats.monthRevenue.toInt()
        "category_variety" -> userStats.categoriesSoldToday
        else -> mission.progress
    }
    
    val completed = newProgress >= mission.target
    
    return mission.copy(
        progress = newProgress,
        completed = completed
    )
}
```

## 🧪 Testing

### Unit Testing
```kotlin
class CreditScoreTest {
    @Test
    fun `calculateCreditScore returns correct score for basic input`() {
        val result = GamificationSampleData.calculateCreditScore(
            totalSales = 1000.0,
            transactionCount = 50,
            digitalPaymentCount = 20,
            activeDays = 10
        )
        
        assertEquals(690, result.score)
        assertEquals("Good", result.rating)
        assertTrue(result.loanEligibility.eligible)
    }
}
```

### Compose Testing
```kotlin
@Test
fun productCard_displaysCorrectInformation() {
    val product = Product(
        id = "test",
        name = "Test Product",
        price = 9.99,
        category = "test"
    )
    
    composeTestRule.setContent {
        SimplePOSTheme {
            ProductCard(
                product = product,
                onAddToCart = { }
            )
        }
    }
    
    composeTestRule
        .onNodeWithText("Test Product")
        .assertIsDisplayed()
    
    composeTestRule
        .onNodeWithText("$9.99")
        .assertIsDisplayed()
}
```

## 🚀 Performance Optimization

### Compose Performance
1. **Stable Parameters**: Use stable data classes for parameters
2. **Remember Expensive Operations**: Cache expensive calculations
3. **Avoid Recomposition**: Use keys and stable references
4. **Lazy Loading**: Use LazyColumn/LazyRow for large lists

```kotlin
@Composable
fun OptimizedList(
    items: List<Item>,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(
            items = items,
            key = { item -> item.id } // Provide stable keys
        ) { item ->
            ItemCard(
                item = item,
                onClick = { /* Handle click */ }
            )
        }
    }
}
```

### Database Performance
1. **Use Indices**: Add database indices for frequently queried columns
2. **Batch Operations**: Use transactions for multiple operations
3. **Background Threads**: Perform database operations off main thread
4. **Pagination**: Use paging for large datasets

## 🔧 Build Configuration

### Gradle Setup
```gradle
android {
    compileSdk 34
    
    defaultConfig {
        applicationId "com.simplepos.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
    
    buildFeatures {
        compose true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.4'
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### ProGuard Rules
```proguard
# Keep Room entities
-keep class com.simplepos.app.data.database.** { *; }

# Keep data classes used with Gson/serialization
-keep class com.simplepos.app.data.** { *; }

# Keep Compose
-keep class androidx.compose.** { *; }
```

## 📝 Coding Standards

### Kotlin Style Guide
1. **Naming Conventions**:
   - Classes: PascalCase
   - Functions/Variables: camelCase
   - Constants: UPPER_SNAKE_CASE

2. **File Organization**:
   - One public class per file
   - Related functions grouped together
   - Imports organized alphabetically

3. **Documentation**:
   - KDoc for public APIs
   - Inline comments for complex logic
   - README files for modules

### Code Review Checklist
- [ ] Follows MVVM architecture
- [ ] Proper error handling
- [ ] Unit tests included
- [ ] Performance considerations
- [ ] Accessibility support
- [ ] Material 3 compliance
- [ ] Documentation updated

## 🤝 Contributing

### Development Workflow
1. **Fork Repository**: Create your own fork
2. **Create Branch**: Feature/bugfix branches from main
3. **Implement Changes**: Follow coding standards
4. **Write Tests**: Unit and integration tests
5. **Update Documentation**: Keep docs current
6. **Submit PR**: Pull request with description

### Commit Messages
```
feat: add credit score calculation algorithm
fix: resolve cart item quantity update issue
docs: update API documentation for gamification
refactor: extract common UI components
test: add unit tests for mission system
```

### Branch Naming
- `feature/credit-score-system`
- `bugfix/cart-quantity-issue`
- `docs/api-documentation`
- `refactor/ui-components`

## 🐛 Debugging

### Common Issues
1. **Compose Recomposition**: Use Compose Layout Inspector
2. **Database Issues**: Enable Room query logging
3. **Navigation Problems**: Check NavController state
4. **Performance Issues**: Use Android Profiler

### Debugging Tools
- **Layout Inspector**: Compose UI debugging
- **Database Inspector**: Room database inspection
- **Logcat**: Application logging
- **Android Profiler**: Performance analysis

## 📚 Resources

### Documentation
- [Jetpack Compose Documentation](https://developer.android.com/jetpack/compose)
- [Material 3 Guidelines](https://m3.material.io/)
- [Room Database Guide](https://developer.android.com/training/data-storage/room)
- [Navigation Compose](https://developer.android.com/jetpack/compose/navigation)

### Tools
- **Android Studio**: Primary IDE
- **Compose Preview**: UI development
- **Layout Inspector**: UI debugging
- **Database Inspector**: Database debugging

---

**Happy coding! Build amazing POS experiences! 🚀**
