package com.simplepos.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import com.simplepos.app.ui.screens.POSMainScreen
import com.simplepos.app.ui.theme.SimplePOSTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SimplePOSTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    POSMainScreen(modifier = Modifier)
                }
            }
        }
    }
}
