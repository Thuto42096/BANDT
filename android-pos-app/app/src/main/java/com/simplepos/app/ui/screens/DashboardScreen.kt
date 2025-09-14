package com.simplepos.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.simplepos.app.data.gamification.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(modifier: Modifier = Modifier) {
    // Sample data - in real app this would come from database
    val creditScore = GamificationSampleData.calculateCreditScore(
        totalSales = 2450.75,
        transactionCount = 89,
        digitalPaymentCount = 34,
        activeDays = 15
    )
    
    val salesAnalytics = SalesAnalytics(
        todaysSales = 245.50,
        todaysTransactions = 12,
        weekSales = 1680.25,
        monthSales = 2450.75,
        topProducts = listOf(
            ProductStat("Americano", 45, 157.50),
            ProductStat("Latte", 32, 136.00),
            ProductStat("Club Sandwich", 18, 153.00)
        ),
        paymentMethodStats = listOf(
            PaymentMethodStat("Cash", 55, 61.8),
            PaymentMethodStat("Card", 28, 31.5),
            PaymentMethodStat("Mobile", 6, 6.7)
        ),
        salesTrend = listOf(
            DailySales("Mon", 180.25, 8),
            DailySales("Tue", 220.50, 11),
            DailySales("Wed", 195.75, 9),
            DailySales("Thu", 245.50, 12),
            DailySales("Fri", 280.00, 15)
        )
    )
    
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Business Dashboard",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        // Credit Score Card
        item {
            CreditScoreCard(creditScore = creditScore)
        }
        
        // Sales Overview Cards
        item {
            SalesOverviewCards(salesAnalytics = salesAnalytics)
        }
        
        // Top Products
        item {
            TopProductsCard(products = salesAnalytics.topProducts)
        }
        
        // Payment Methods
        item {
            PaymentMethodsCard(paymentStats = salesAnalytics.paymentMethodStats)
        }
        
        // Sales Trend
        item {
            SalesTrendCard(salesTrend = salesAnalytics.salesTrend)
        }
    }
}

@Composable
fun CreditScoreCard(creditScore: CreditScore) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Credit Score",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = creditScore.rating,
                        style = MaterialTheme.typography.bodyMedium,
                        color = when (creditScore.rating) {
                            "Excellent" -> Color(0xFF4CAF50)
                            "Good" -> Color(0xFF8BC34A)
                            "Fair" -> Color(0xFFFF9800)
                            else -> Color(0xFFF44336)
                        }
                    )
                }
                
                Text(
                    text = creditScore.score.toString(),
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Loan Eligibility
            if (creditScore.loanEligibility.eligible) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(12.dp)
                    ) {
                        Text(
                            text = "🎉 Loan Eligible!",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Up to $${creditScore.loanEligibility.amount:,} at ${creditScore.loanEligibility.interestRate}",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SalesOverviewCards(salesAnalytics: SalesAnalytics) {
    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(
            listOf(
                Triple("Today", "$%.2f".format(salesAnalytics.todaysSales), Icons.Default.Today),
                Triple("Week", "$%.2f".format(salesAnalytics.weekSales), Icons.Default.DateRange),
                Triple("Month", "$%.2f".format(salesAnalytics.monthSales), Icons.Default.CalendarMonth),
                Triple("Transactions", salesAnalytics.todaysTransactions.toString(), Icons.Default.Receipt)
            )
        ) { (title, value, icon) ->
            MetricCard(title = title, value = value, icon = icon)
        }
    }
}

@Composable
fun MetricCard(title: String, value: String, icon: ImageVector) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .height(100.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
            
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = value,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.bodySmall,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

@Composable
fun TopProductsCard(products: List<ProductStat>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Top Products",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            products.forEach { product ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = product.productName,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            text = "${product.totalQuantity} sold",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Text(
                        text = "$%.2f".format(product.totalSales),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

@Composable
fun PaymentMethodsCard(paymentStats: List<PaymentMethodStat>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Payment Methods",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            paymentStats.forEach { stat ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = stat.paymentMethod,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "${stat.percentage}% (${stat.count})",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}

@Composable
fun SalesTrendCard(salesTrend: List<DailySales>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Sales Trend (This Week)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            salesTrend.forEach { day ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = day.date,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Column(
                        horizontalAlignment = Alignment.End
                    ) {
                        Text(
                            text = "$%.2f".format(day.sales),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "${day.transactions} transactions",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}
