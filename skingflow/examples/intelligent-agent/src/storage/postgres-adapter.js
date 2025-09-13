/**
 * PostgreSQL Adapter for Memory System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { MemoryStorage } from '../../../skingflow/lib/core/memory.js';
import pkg from 'pg';
const { Pool } = pkg;

/**
 * PostgreSQL Storage Implementation
 */
export class PostgresMemoryStorage extends MemoryStorage {
  constructor(config) {
    super(config);
    this.pool = null;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create connection pool
      this.pool = new Pool(this.config);
      
      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      // Create tables and indices
      await this._createSchema();
      
      this.initialized = true;
      this.emit('connected');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async insert(entry) {
    if (!this.initialized) await this.initialize();

    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO memories (
          id, user_id, session_id, memory_type, content, type, category, tags, metadata,
          importance, confidence, created_at, updated_at, 
          last_accessed, access_count, version
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `;
      
      const values = [
        entry.id,
        entry.userId,
        entry.sessionId || null,
        entry.memoryType || 'general',
        entry.content,
        entry.type,
        entry.category,
        JSON.stringify(entry.tags),
        JSON.stringify(entry.metadata),
        entry.importance,
        entry.confidence,
        entry.createdAt,
        entry.updatedAt,
        entry.lastAccessed,
        entry.accessCount,
        entry.version
      ];
      
      const result = await client.query(query, values);
      this.emit('inserted', entry);
      return result.rows[0].id;
    } finally {
      client.release();
    }
  }

  async query(queryBuilder) {
    if (!this.initialized) await this.initialize();

    const query = queryBuilder.build();
    const client = await this.pool.connect();
    
    try {
      let sql = 'SELECT * FROM memories WHERE 1=1';
      const values = [];
      let paramCount = 1;
      
      // Apply conditions
      for (const condition of query.conditions) {
        if (condition.type === 'semantic_search') {
          // Simple text search for semantic queries
          sql += ` AND content ILIKE $${paramCount}`;
          values.push(`%${condition.text}%`);
          paramCount++;
        } else if (condition.field) {
          switch (condition.operator) {
            case '=':
              sql += ` AND ${this._mapFieldToColumn(condition.field)} = $${paramCount}`;
              values.push(condition.value);
              paramCount++;
              break;
            case 'contains':
              sql += ` AND ${this._mapFieldToColumn(condition.field)} ILIKE $${paramCount}`;
              values.push(`%${condition.value}%`);
              paramCount++;
              break;
            case 'in':
              sql += ` AND ${this._mapFieldToColumn(condition.field)} = ANY($${paramCount})`;
              values.push(condition.value);
              paramCount++;
              break;
            case 'between':
              sql += ` AND ${this._mapFieldToColumn(condition.field)} BETWEEN $${paramCount} AND $${paramCount + 1}`;
              values.push(condition.value[0], condition.value[1]);
              paramCount += 2;
              break;
          }
        }
      }
      
      // Apply sorting
      if (query.sort) {
        sql += ` ORDER BY ${this._mapFieldToColumn(query.sort.field)} ${query.sort.order.toUpperCase()}`;
      }
      
      // Apply pagination
      sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(query.limit, query.offset);
      
      const result = await client.query(sql, values);
      
      const memories = result.rows.map(row => {
        const memory = this._formatMemory(row);
        
        // Update access statistics in database
        this._updateAccessStats(memory.id).catch(err => {
          console.warn(`Failed to update access stats for ${memory.id}:`, err.message);
        });
        
        return memory;
      });
      
      this.emit('queried', { query, results: memories.length });
      return memories;
    } finally {
      client.release();
    }
  }

  async update(id, updates) {
    if (!this.initialized) await this.initialize();

    const client = await this.pool.connect();
    try {
      const updateFields = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(updates)) {
        const dbField = this._mapFieldToColumn(key);
        if (dbField) {
          updateFields.push(`${dbField} = $${paramCount}`);
          
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
          
          paramCount++;
        }
      }
      
      if (updateFields.length === 0) {
        return false;
      }
      
      // Only add updated_at if it's not already in the update fields
      if (!updateFields.some(field => field.includes('updated_at'))) {
        updateFields.push(`updated_at = $${paramCount}`);
        values.push(new Date());
        paramCount++;
      }
      
      updateFields.push(`version = version + 1`);
      
      values.push(id);
      
      const query = `
        UPDATE memories 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id
      `;
      
      const result = await client.query(query, values);
      const success = result.rows.length > 0;
      
      if (success) {
        this.emit('updated', { id, updates });
      }
      
      return success;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    if (!this.initialized) await this.initialize();

    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM memories WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      const success = result.rows.length > 0;
      
      if (success) {
        this.emit('deleted', { id });
      }
      
      return success;
    } finally {
      client.release();
    }
  }

  async count(conditions = []) {
    if (!this.initialized) await this.initialize();

    const client = await this.pool.connect();
    try {
      let sql = 'SELECT COUNT(*) as count FROM memories WHERE 1=1';
      const values = [];
      let paramCount = 1;
      
      for (const condition of conditions) {
        if (condition.field) {
          sql += ` AND ${this._mapFieldToColumn(condition.field)} = $${paramCount}`;
          values.push(condition.value);
          paramCount++;
        }
      }
      
      const result = await client.query(sql, values);
      return parseInt(result.rows[0].count);
    } finally {
      client.release();
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
    this.initialized = false;
    this.emit('disconnected');
  }

  // Private methods

  async _createSchema() {
    const client = await this.pool.connect();
    try {
      // Create memories table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS memories (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          session_id VARCHAR(255),
          memory_type VARCHAR(100) DEFAULT 'general',
          content TEXT NOT NULL,
          type VARCHAR(100) NOT NULL,
          category VARCHAR(100) NOT NULL,
          tags JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          importance DECIMAL(3,2) DEFAULT 0.5,
          confidence DECIMAL(3,2) DEFAULT 0.5,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          last_accessed TIMESTAMP DEFAULT NOW(),
          access_count INTEGER DEFAULT 0,
          version INTEGER DEFAULT 1
        )
      `;
      
      await client.query(createTableQuery);
      
      // Add missing columns if they don't exist
      const alterQueries = [
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS session_id VARCHAR(255)',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS memory_type VARCHAR(100) DEFAULT \'general\'',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT NOW()',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT \'[]\'',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'',
        'ALTER TABLE memories ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2) DEFAULT 0.5'
      ];
      
      for (const alterQuery of alterQueries) {
        try {
          await client.query(alterQuery);
        } catch (error) {
          // Ignore errors for columns that already exist
          if (!error.message.includes('already exists')) {
            console.warn(`Warning: ${error.message}`);
          }
        }
      }
      
      // Create indices
      const indices = [
        'CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category)',
        'CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type)',
        'CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance)',
        'CREATE INDEX IF NOT EXISTS idx_memories_last_accessed ON memories(last_accessed)',
        'CREATE INDEX IF NOT EXISTS idx_memories_content ON memories USING gin(to_tsvector(\'english\', content))'
      ];
      
      for (const indexQuery of indices) {
        await client.query(indexQuery);
      }
      
      console.log('✅ Database schema created successfully');
    } finally {
      client.release();
    }
  }

  _formatMemory(row) {
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      memoryType: row.memory_type || 'general',
      content: row.content,
      type: row.type,
      category: row.category,
      tags: this._parseJSON(row.tags, []),
      metadata: this._parseJSON(row.metadata, {}),
      importance: parseFloat(row.importance || 0.5),
      confidence: parseFloat(row.confidence || 0.5),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastAccessed: row.last_accessed,
      accessCount: parseInt(row.access_count || 0),
      version: parseInt(row.version || 1)
    };
  }

  _parseJSON(value, defaultValue) {
    if (!value || value === null || value === undefined) {
      return defaultValue;
    }
    
    if (typeof value === 'object') {
      return value; // Already parsed
    }
    
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(`JSON parse error for value: ${value}`, error.message);
      return defaultValue;
    }
  }

  async _updateAccessStats(memoryId) {
    if (!this.initialized) return;

    const client = await this.pool.connect();
    try {
      await client.query(
        'UPDATE memories SET last_accessed = NOW(), access_count = access_count + 1 WHERE id = $1',
        [memoryId]
      );
    } finally {
      client.release();
    }
  }

  _mapFieldToColumn(field) {
    const mapping = {
      userId: 'user_id',
      sessionId: 'session_id',
      memoryType: 'memory_type',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      lastAccessed: 'last_accessed',
      accessCount: 'access_count'
    };
    
    return mapping[field] || field;
  }
}
