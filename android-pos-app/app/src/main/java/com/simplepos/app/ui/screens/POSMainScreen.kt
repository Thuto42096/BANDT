package com.simplepos.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.simplepos.app.data.*
import com.simplepos.app.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun POSMainScreen(modifier: Modifier = Modifier) {
    var selectedCategory by remember { mutableStateOf(SampleData.categories.first()) }
    var cartItems by remember { mutableStateOf(listOf<CartItem>()) }
    var showCheckout by remember { mutableStateOf(false) }
    
    val products = SampleData.getProductsByCategory(selectedCategory.id)
    val cartTotal = cartItems.sumOf { it.totalPrice }
    
    if (showCheckout) {
        CheckoutScreen(
            cartItems = cartItems,
            onBackToShopping = { showCheckout = false },
            onCompleteSale = { 
                cartItems = emptyList()
                showCheckout = false
            }
        )
    } else {
        Row(
            modifier = modifier.fillMaxSize()
        ) {
            // Left side - Product catalog
            Column(
                modifier = Modifier
                    .weight(2f)
                    .fillMaxHeight()
                    .padding(16.dp)
            ) {
                // Header
                Text(
                    text = "Simple POS System",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                // Category tabs
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    items(SampleData.categories) { category ->
                        FilterChip(
                            onClick = { selectedCategory = category },
                            label = { Text(category.name) },
                            selected = selectedCategory.id == category.id
                        )
                    }
                }
                
                // Product grid
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 200.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(products) { product ->
                        ProductCard(
                            product = product,
                            onAddToCart = { 
                                val existingItem = cartItems.find { it.product.id == product.id }
                                cartItems = if (existingItem != null) {
                                    cartItems.map { 
                                        if (it.product.id == product.id) {
                                            it.copy(quantity = it.quantity + 1)
                                        } else it
                                    }
                                } else {
                                    cartItems + CartItem(product, 1)
                                }
                            }
                        )
                    }
                }
            }
            
            // Right side - Shopping cart
            Card(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .padding(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Shopping Cart",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    
                    if (cartItems.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Cart is empty\nAdd items to get started",
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(cartItems) { cartItem ->
                                CartItemCard(
                                    cartItem = cartItem,
                                    onQuantityChange = { newQuantity ->
                                        cartItems = if (newQuantity <= 0) {
                                            cartItems.filter { it.product.id != cartItem.product.id }
                                        } else {
                                            cartItems.map { 
                                                if (it.product.id == cartItem.product.id) {
                                                    it.copy(quantity = newQuantity)
                                                } else it
                                            }
                                        }
                                    },
                                    onRemove = {
                                        cartItems = cartItems.filter { it.product.id != cartItem.product.id }
                                    }
                                )
                            }
                        }
                        
                        Divider(modifier = Modifier.padding(vertical = 16.dp))
                        
                        // Total and checkout
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Total:",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "$%.2f".format(cartTotal),
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Button(
                            onClick = { showCheckout = true },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = cartItems.isNotEmpty()
                        ) {
                            Text("Proceed to Checkout")
                        }
                        
                        OutlinedButton(
                            onClick = { cartItems = emptyList() },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = cartItems.isNotEmpty()
                        ) {
                            Text("Clear Cart")
                        }
                    }
                }
            }
        }
    }
}
