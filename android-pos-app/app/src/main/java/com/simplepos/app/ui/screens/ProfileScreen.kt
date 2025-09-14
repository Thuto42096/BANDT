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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.simplepos.app.data.gamification.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(modifier: Modifier = Modifier) {
    // Sample data - in real app this would come from database
    val userProgress = UserProgress(
        level = 3,
        xp = 750,
        badges = GamificationSampleData.badges.take(4).map { it.copy(earned = true) } + 
                GamificationSampleData.badges.drop(4),
        completedMissions = listOf("daily_sales_5", "digital_payments_3")
    )
    
    val missions = GamificationSampleData.missions.map { mission ->
        when (mission.id) {
            "daily_sales_5" -> mission.copy(progress = 3, completed = false)
            "digital_payments_3" -> mission.copy(progress = 1, completed = false)
            "weekly_sales_25" -> mission.copy(progress = 12, completed = false)
            "monthly_revenue_2000" -> mission.copy(progress = 1250, completed = false)
            "category_variety" -> mission.copy(progress = 2, completed = false)
            else -> mission
        }
    }
    
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Your Profile",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        // User Level Card
        item {
            UserLevelCard(userProgress = userProgress)
        }
        
        // Badges Section
        item {
            BadgesSection(badges = userProgress.badges)
        }
        
        // Missions Section
        item {
            MissionsSection(missions = missions)
        }
        
        // Statistics Card
        item {
            StatisticsCard()
        }
    }
}

@Composable
fun UserLevelCard(userProgress: UserProgress) {
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
                        text = "Level ${userProgress.level}",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Business Owner",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Text(
                    text = "🏪",
                    style = MaterialTheme.typography.displayMedium
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // XP Progress
            val nextLevelXp = GamificationSampleData.getXpForNextLevel(userProgress.level)
            val currentLevelXp = if (userProgress.level > 0) 
                GamificationSampleData.getXpForNextLevel(userProgress.level - 1) else 0
            val progress = if (nextLevelXp > currentLevelXp) {
                (userProgress.xp - currentLevelXp).toFloat() / (nextLevelXp - currentLevelXp)
            } else 1f
            
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "XP: ${userProgress.xp}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Text(
                        text = "Next: $nextLevelXp XP",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                LinearProgressIndicator(
                    progress = progress,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )
            }
        }
    }
}

@Composable
fun BadgesSection(badges: List<Badge>) {
    Column {
        Text(
            text = "Badges",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(badges) { badge ->
                BadgeCard(badge = badge)
            }
        }
    }
}

@Composable
fun BadgeCard(badge: Badge) {
    Card(
        modifier = Modifier
            .width(100.dp)
            .height(120.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (badge.earned) 
                MaterialTheme.colorScheme.primaryContainer 
            else 
                MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = badge.icon,
                style = MaterialTheme.typography.headlineLarge,
                modifier = Modifier.padding(top = 8.dp)
            )
            
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = badge.name,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    maxLines = 2
                )
                
                if (badge.earned) {
                    Text(
                        text = "✓ Earned",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

@Composable
fun MissionsSection(missions: List<Mission>) {
    Column {
        Text(
            text = "Active Missions",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        
        missions.filter { !it.completed }.take(3).forEach { mission ->
            MissionCard(mission = mission)
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun MissionCard(mission: Mission) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = mission.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = mission.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Chip(
                    onClick = { },
                    label = {
                        Text(
                            text = when (mission.type) {
                                MissionType.DAILY -> "Daily"
                                MissionType.WEEKLY -> "Weekly"
                                MissionType.MONTHLY -> "Monthly"
                            },
                            style = MaterialTheme.typography.labelSmall
                        )
                    }
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Progress
            val progress = mission.progress.toFloat() / mission.target
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${mission.progress}/${mission.target}",
                    style = MaterialTheme.typography.bodySmall
                )
                Text(
                    text = "+${mission.xpReward} XP",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(6.dp),
                trackColor = MaterialTheme.colorScheme.surfaceVariant
            )
        }
    }
}

@Composable
fun StatisticsCard() {
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
                text = "Your Statistics",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            val stats = listOf(
                "Total Sales" to "$2,450.75",
                "Transactions" to "89",
                "Active Days" to "15",
                "Digital Adoption" to "38.2%",
                "Badges Earned" to "4/10",
                "Missions Completed" to "2"
            )
            
            stats.chunked(2).forEach { rowStats ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    rowStats.forEach { (label, value) ->
                        Column(
                            modifier = Modifier.weight(1f),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = value,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = label,
                                style = MaterialTheme.typography.bodySmall,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}
