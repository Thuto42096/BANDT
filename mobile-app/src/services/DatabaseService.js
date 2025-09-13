import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class DatabaseService {
  constructor() {
    this.database = null;
  }

  // Initialize database
  async initDatabase() {
    try {
      this.database = await SQLite.openDatabase({
        name: 'TownshipPOS.db',
        location: 'default',
      });

      console.log('Database opened successfully');
      await this.createTables();
      return this.database;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  // Create all necessary tables
  async createTables() {
    try {
      // Inventory table
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER NOT NULL,
          category TEXT,
          barcode TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0,
          sync_id TEXT
        )
      `);

      // Sales table
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_name TEXT NOT NULL,
          item_id INTEGER,
          quantity INTEGER NOT NULL,
          total REAL NOT NULL,
          payment_method TEXT NOT NULL,
          amount_received REAL,
          change_given REAL DEFAULT 0,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0,
          sync_id TEXT,
          FOREIGN KEY (item_id) REFERENCES inventory (id)
        )
      `);

      // Credit score table
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS credit_score (
          id INTEGER PRIMARY KEY,
          shop_id TEXT DEFAULT 'local_shop',
          score INTEGER DEFAULT 0,
          total_sales REAL DEFAULT 0,
          transaction_count INTEGER DEFAULT 0,
          avg_transaction REAL DEFAULT 0,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          synced INTEGER DEFAULT 0
        )
      `);

      // Sync queue table for offline operations
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT NOT NULL,
          operation TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          attempts INTEGER DEFAULT 0,
          last_attempt TEXT,
          error_message TEXT
        )
      `);

      // User preferences/settings table
      await this.database.executeSql(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('All tables created successfully');
      
      // Initialize default data if needed
      await this.initializeDefaultData();
      
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  // Initialize default data
  async initializeDefaultData() {
    try {
      // Check if we have any inventory items
      const [results] = await this.database.executeSql('SELECT COUNT(*) as count FROM inventory');
      const count = results.rows.item(0).count;

      if (count === 0) {
        // Add some default inventory items
        const defaultItems = [
          { name: 'Bread', price: 15.00, quantity: 20, category: 'Food & Drinks' },
          { name: 'Milk 1L', price: 18.50, quantity: 15, category: 'Food & Drinks' },
          { name: 'Coca Cola 330ml', price: 12.00, quantity: 30, category: 'Food & Drinks' },
          { name: 'Airtime R10', price: 10.00, quantity: 100, category: 'Airtime & Data' },
          { name: 'Airtime R20', price: 20.00, quantity: 100, category: 'Airtime & Data' },
          { name: 'Cigarettes', price: 45.00, quantity: 10, category: 'Cigarettes' },
          { name: 'Soap Bar', price: 8.50, quantity: 25, category: 'Household' },
        ];

        for (const item of defaultItems) {
          await this.addInventoryItem(item);
        }

        console.log('Default inventory items added');
      }

      // Initialize credit score if not exists
      const [creditResults] = await this.database.executeSql('SELECT COUNT(*) as count FROM credit_score');
      const creditCount = creditResults.rows.item(0).count;

      if (creditCount === 0) {
        await this.database.executeSql(`
          INSERT INTO credit_score (id, shop_id, score, total_sales, transaction_count, avg_transaction)
          VALUES (1, 'local_shop', 0, 0, 0, 0)
        `);
        console.log('Default credit score initialized');
      }

    } catch (error) {
      console.error('Failed to initialize default data:', error);
    }
  }

  // Inventory operations
  async getInventory() {
    try {
      const [results] = await this.database.executeSql('SELECT * FROM inventory ORDER BY name');
      const inventory = [];
      
      for (let i = 0; i < results.rows.length; i++) {
        inventory.push(results.rows.item(i));
      }
      
      return inventory;
    } catch (error) {
      console.error('Failed to get inventory:', error);
      throw error;
    }
  }

  async addInventoryItem(item) {
    try {
      const { name, price, quantity, category = 'Other', barcode = null } = item;
      const timestamp = new Date().toISOString();
      
      const [result] = await this.database.executeSql(`
        INSERT INTO inventory (name, price, quantity, category, barcode, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [name, price, quantity, category, barcode, timestamp, timestamp]);

      const newItem = {
        id: result.insertId,
        name,
        price,
        quantity,
        category,
        barcode,
        created_at: timestamp,
        updated_at: timestamp,
        synced: 0,
        sync_id: null
      };

      return newItem;
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      throw error;
    }
  }

  async updateInventoryItem(item) {
    try {
      const { id, name, price, quantity, category } = item;
      const timestamp = new Date().toISOString();
      
      await this.database.executeSql(`
        UPDATE inventory 
        SET name = ?, price = ?, quantity = ?, category = ?, updated_at = ?, synced = 0
        WHERE id = ?
      `, [name, price, quantity, category, timestamp, id]);

      return { ...item, updated_at: timestamp, synced: 0 };
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      throw error;
    }
  }

  async deleteInventoryItem(itemId) {
    try {
      await this.database.executeSql('DELETE FROM inventory WHERE id = ?', [itemId]);
      return true;
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      throw error;
    }
  }

  // Sales operations
  async getSalesHistory(limit = 50) {
    try {
      const [results] = await this.database.executeSql(`
        SELECT * FROM sales 
        ORDER BY timestamp DESC 
        LIMIT ?
      `, [limit]);
      
      const sales = [];
      for (let i = 0; i < results.rows.length; i++) {
        sales.push(results.rows.item(i));
      }
      
      return sales;
    } catch (error) {
      console.error('Failed to get sales history:', error);
      throw error;
    }
  }

  async processSale(saleData) {
    try {
      const { item_name, item_id, quantity, payment_method, amount_received } = saleData;
      
      // Get item details
      const [itemResults] = await this.database.executeSql('SELECT * FROM inventory WHERE id = ?', [item_id]);
      
      if (itemResults.rows.length === 0) {
        throw new Error('Item not found');
      }
      
      const item = itemResults.rows.item(0);
      
      if (item.quantity < quantity) {
        throw new Error('Insufficient stock');
      }
      
      const total = item.price * quantity;
      const change = payment_method === 'cash' ? (amount_received - total) : 0;
      const timestamp = new Date().toISOString();
      
      // Start transaction
      await this.database.transaction(async (tx) => {
        // Update inventory
        await tx.executeSql(`
          UPDATE inventory 
          SET quantity = quantity - ?, updated_at = ?, synced = 0
          WHERE id = ?
        `, [quantity, timestamp, item_id]);
        
        // Insert sale record
        const [saleResult] = await tx.executeSql(`
          INSERT INTO sales (item_name, item_id, quantity, total, payment_method, amount_received, change_given, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [item_name, item_id, quantity, total, payment_method, amount_received || total, change, timestamp]);
        
        // Update credit score
        await this.updateCreditScore();
        
        return saleResult.insertId;
      });
      
      const sale = {
        item_name,
        item_id,
        quantity,
        total,
        payment_method,
        amount_received: amount_received || total,
        change_given: change,
        timestamp,
        synced: 0
      };
      
      return sale;
    } catch (error) {
      console.error('Failed to process sale:', error);
      throw error;
    }
  }

  // Credit score operations
  async getCreditScore() {
    try {
      const [results] = await this.database.executeSql('SELECT * FROM credit_score WHERE id = 1');
      
      if (results.rows.length > 0) {
        return results.rows.item(0);
      }
      
      return {
        score: 0,
        total_sales: 0,
        transaction_count: 0,
        avg_transaction: 0
      };
    } catch (error) {
      console.error('Failed to get credit score:', error);
      throw error;
    }
  }

  async updateCreditScore() {
    try {
      // Calculate new credit score based on sales data
      const [salesResults] = await this.database.executeSql(`
        SELECT SUM(total) as total_sales, COUNT(*) as transaction_count
        FROM sales
      `);
      
      const { total_sales = 0, transaction_count = 0 } = salesResults.rows.item(0);
      const avg_transaction = transaction_count > 0 ? total_sales / transaction_count : 0;
      
      // Calculate score (same algorithm as backend)
      const score = Math.min(Math.floor(total_sales / 10 + avg_transaction / 2 + transaction_count * 5), 100);
      const timestamp = new Date().toISOString();
      
      await this.database.executeSql(`
        UPDATE credit_score 
        SET score = ?, total_sales = ?, transaction_count = ?, avg_transaction = ?, updated_at = ?, synced = 0
        WHERE id = 1
      `, [score, total_sales, transaction_count, avg_transaction, timestamp]);
      
      return { score, total_sales, transaction_count, avg_transaction };
    } catch (error) {
      console.error('Failed to update credit score:', error);
      throw error;
    }
  }

  // Sync queue operations
  async addToSyncQueue(tableName, operation, data) {
    try {
      const timestamp = new Date().toISOString();
      await this.database.executeSql(`
        INSERT INTO sync_queue (table_name, operation, data, created_at)
        VALUES (?, ?, ?, ?)
      `, [tableName, operation, JSON.stringify(data), timestamp]);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue() {
    try {
      const [results] = await this.database.executeSql(`
        SELECT * FROM sync_queue 
        ORDER BY created_at ASC
      `);
      
      const queue = [];
      for (let i = 0; i < results.rows.length; i++) {
        const item = results.rows.item(i);
        queue.push({
          ...item,
          data: JSON.parse(item.data)
        });
      }
      
      return queue;
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      throw error;
    }
  }

  async removeSyncQueueItem(id) {
    try {
      await this.database.executeSql('DELETE FROM sync_queue WHERE id = ?', [id]);
    } catch (error) {
      console.error('Failed to remove sync queue item:', error);
      throw error;
    }
  }

  async getPendingSyncCount() {
    try {
      const [results] = await this.database.executeSql('SELECT COUNT(*) as count FROM sync_queue');
      return results.rows.item(0).count;
    } catch (error) {
      console.error('Failed to get pending sync count:', error);
      return 0;
    }
  }

  // Settings operations
  async getSetting(key) {
    try {
      const [results] = await this.database.executeSql('SELECT value FROM settings WHERE key = ?', [key]);
      
      if (results.rows.length > 0) {
        return results.rows.item(0).value;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get setting:', error);
      return null;
    }
  }

  async setSetting(key, value) {
    try {
      const timestamp = new Date().toISOString();
      await this.database.executeSql(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
      `, [key, value, timestamp]);
    } catch (error) {
      console.error('Failed to set setting:', error);
      throw error;
    }
  }

  // Close database
  async closeDatabase() {
    if (this.database) {
      await this.database.close();
      console.log('Database closed');
    }
  }
}

export default new DatabaseService();
