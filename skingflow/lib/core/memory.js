/**
 * Memory System SDK for skingflow
 * 
 * Provides flexible memory management with query, insert, update, delete operations
 * Supports multiple storage backends and vector search capabilities
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import { AsyncNode } from '../../skingflow.js';

/**
 * Memory Entry Schema
 */
export class MemoryEntry {
  constructor(data = {}) {
    this.id = data.id || MemoryEntry.generateId();
    this.content = data.content || '';
    this.type = data.type || 'general';
    this.category = data.category || 'default';
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.embedding = data.embedding || null;
    this.importance = data.importance || 0.5;
    this.confidence = data.confidence || 0.5;
    this.userId = data.userId || null;
    this.sessionId = data.sessionId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastAccessed = data.lastAccessed || new Date();
    this.accessCount = data.accessCount || 0;
    this.version = data.version || 1;
  }

  static generateId() {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date();
    this.version += 1;
    return this;
  }

  access() {
    this.lastAccessed = new Date();
    this.accessCount += 1;
    return this;
  }

  toJSON() {
    return { ...this };
  }

  static fromJSON(data) {
    return new MemoryEntry(data);
  }
}

/**
 * Memory Query Builder
 */
export class MemoryQuery {
  constructor() {
    this.conditions = [];
    this.sortBy = null;
    this.sortOrder = 'desc';
    this.limitCount = 10;
    this.offsetCount = 0;
    this.includeEmbedding = false;
  }

  // Query conditions
  where(field, operator, value) {
    this.conditions.push({ field, operator, value });
    return this;
  }

  equals(field, value) {
    return this.where(field, '=', value);
  }

  contains(field, value) {
    return this.where(field, 'contains', value);
  }

  in(field, values) {
    return this.where(field, 'in', values);
  }

  between(field, min, max) {
    return this.where(field, 'between', [min, max]);
  }

  // Vector similarity search
  similar(embedding, threshold = 0.7) {
    this.conditions.push({ 
      type: 'vector_similarity', 
      embedding, 
      threshold 
    });
    return this;
  }

  // Semantic search
  semantic(text, limit = 10) {
    this.conditions.push({ 
      type: 'semantic_search', 
      text, 
      limit 
    });
    return this;
  }

  // Sorting
  orderBy(field, order = 'desc') {
    this.sortBy = field;
    this.sortOrder = order;
    return this;
  }

  // Pagination
  limit(count) {
    this.limitCount = count;
    return this;
  }

  offset(count) {
    this.offsetCount = count;
    return this;
  }

  // Include embedding in results
  withEmbedding() {
    this.includeEmbedding = true;
    return this;
  }

  // Build final query object
  build() {
    return {
      conditions: this.conditions,
      sort: this.sortBy ? { field: this.sortBy, order: this.sortOrder } : null,
      limit: this.limitCount,
      offset: this.offsetCount,
      includeEmbedding: this.includeEmbedding
    };
  }
}

/**
 * Abstract Memory Storage Interface
 */
export class MemoryStorage extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.initialized = false;
  }

  async initialize() {
    throw new Error('initialize() must be implemented');
  }

  async insert(entry) {
    throw new Error('insert() must be implemented');
  }

  async query(queryBuilder) {
    throw new Error('query() must be implemented');
  }

  async update(id, updates) {
    throw new Error('update() must be implemented');
  }

  async delete(id) {
    throw new Error('delete() must be implemented');
  }

  async count(conditions = []) {
    throw new Error('count() must be implemented');
  }

  async close() {
    this.initialized = false;
  }
}

/**
 * In-Memory Storage Implementation
 */
export class InMemoryStorage extends MemoryStorage {
  constructor(config = {}) {
    super(config);
    this.memories = new Map();
    this.indices = {
      userId: new Map(),
      category: new Map(),
      type: new Map(),
      tags: new Map()
    };
  }

  async initialize() {
    if (this.initialized) return;
    this.memories.clear();
    Object.values(this.indices).forEach(index => index.clear());
    this.initialized = true;
  }

  async insert(entry) {
    if (!this.initialized) await this.initialize();
    
    const memoryEntry = entry instanceof MemoryEntry ? entry : new MemoryEntry(entry);
    
    this.memories.set(memoryEntry.id, memoryEntry);
    this._updateIndices(memoryEntry);
    
    this.emit('inserted', memoryEntry);
    return memoryEntry.id;
  }

  async query(queryBuilder) {
    if (!this.initialized) await this.initialize();
    
    const query = queryBuilder.build();
    let results = Array.from(this.memories.values());
    
    // Apply conditions
    for (const condition of query.conditions) {
      results = this._applyCondition(results, condition);
    }
    
    // Sort results
    if (query.sort) {
      results.sort((a, b) => {
        const aVal = a[query.sort.field];
        const bVal = b[query.sort.field];
        const multiplier = query.sort.order === 'asc' ? 1 : -1;
        
        if (aVal < bVal) return -1 * multiplier;
        if (aVal > bVal) return 1 * multiplier;
        return 0;
      });
    }
    
    // Apply pagination
    results = results.slice(query.offset, query.offset + query.limit);
    
    // Update access statistics
    results.forEach(entry => entry.access());
    
    this.emit('queried', { query, results: results.length });
    return results;
  }

  async update(id, updates) {
    if (!this.initialized) await this.initialize();
    
    const entry = this.memories.get(id);
    if (!entry) return false;
    
    const oldEntry = { ...entry };
    entry.update(updates);
    
    this._updateIndices(entry, oldEntry);
    this.emit('updated', { id, updates, entry });
    return true;
  }

  async delete(id) {
    if (!this.initialized) await this.initialize();
    
    const entry = this.memories.get(id);
    if (!entry) return false;
    
    this.memories.delete(id);
    this._removeFromIndices(entry);
    
    this.emit('deleted', { id, entry });
    return true;
  }

  async count(conditions = []) {
    if (!this.initialized) await this.initialize();
    
    let results = Array.from(this.memories.values());
    
    for (const condition of conditions) {
      results = this._applyCondition(results, condition);
    }
    
    return results.length;
  }

  // Private methods
  _applyCondition(results, condition) {
    switch (condition.type) {
      case 'vector_similarity':
        return this._vectorSimilarity(results, condition.embedding, condition.threshold);
      case 'semantic_search':
        return this._semanticSearch(results, condition.text, condition.limit);
      default:
        return this._fieldCondition(results, condition);
    }
  }

  _fieldCondition(results, condition) {
    return results.filter(entry => {
      const value = entry[condition.field];
      
      switch (condition.operator) {
        case '=':
          return value === condition.value;
        case '!=':
          return value !== condition.value;
        case '>':
          return value > condition.value;
        case '<':
          return value < condition.value;
        case '>=':
          return value >= condition.value;
        case '<=':
          return value <= condition.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'in':
          return condition.value.includes(value);
        case 'between':
          return value >= condition.value[0] && value <= condition.value[1];
        default:
          return true;
      }
    });
  }

  _vectorSimilarity(results, queryEmbedding, threshold) {
    if (!queryEmbedding) return results;
    
    return results
      .filter(entry => entry.embedding)
      .map(entry => ({
        ...entry,
        similarity: this._cosineSimilarity(queryEmbedding, entry.embedding)
      }))
      .filter(entry => entry.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
  }

  _semanticSearch(results, text, limit) {
    // Simple text-based semantic search
    const query = text.toLowerCase();
    return results
      .map(entry => ({
        ...entry,
        relevance: this._textRelevance(entry.content.toLowerCase(), query)
      }))
      .filter(entry => entry.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  _cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    return normA === 0 || normB === 0 ? 0 : dotProduct / (normA * normB);
  }

  _textRelevance(content, query) {
    if (content.includes(query)) return 1.0;
    
    const words = query.split(' ');
    let matches = 0;
    
    for (const word of words) {
      if (content.includes(word)) matches++;
    }
    
    return matches / words.length;
  }

  _updateIndices(entry, oldEntry = null) {
    // Remove old indices if updating
    if (oldEntry) {
      this._removeFromIndices(oldEntry);
    }
    
    // Add to indices
    if (entry.userId) {
      if (!this.indices.userId.has(entry.userId)) {
        this.indices.userId.set(entry.userId, new Set());
      }
      this.indices.userId.get(entry.userId).add(entry.id);
    }
    
    if (!this.indices.category.has(entry.category)) {
      this.indices.category.set(entry.category, new Set());
    }
    this.indices.category.get(entry.category).add(entry.id);
    
    if (!this.indices.type.has(entry.type)) {
      this.indices.type.set(entry.type, new Set());
    }
    this.indices.type.get(entry.type).add(entry.id);
    
    for (const tag of entry.tags) {
      if (!this.indices.tags.has(tag)) {
        this.indices.tags.set(tag, new Set());
      }
      this.indices.tags.get(tag).add(entry.id);
    }
  }

  _removeFromIndices(entry) {
    if (entry.userId && this.indices.userId.has(entry.userId)) {
      this.indices.userId.get(entry.userId).delete(entry.id);
    }
    
    if (this.indices.category.has(entry.category)) {
      this.indices.category.get(entry.category).delete(entry.id);
    }
    
    if (this.indices.type.has(entry.type)) {
      this.indices.type.get(entry.type).delete(entry.id);
    }
    
    for (const tag of entry.tags) {
      if (this.indices.tags.has(tag)) {
        this.indices.tags.get(tag).delete(entry.id);
      }
    }
  }
}

/**
 * Memory Manager - Main SDK Interface
 */
export class MemoryManager extends EventEmitter {
  constructor(storage, options = {}) {
    super();
    this.storage = storage;
    this.options = {
      autoEmbedding: options.autoEmbedding || false,
      embeddingProvider: options.embeddingProvider || null,
      maxMemories: options.maxMemories || 10000,
      ...options
    };
  }

  async initialize() {
    await this.storage.initialize();
    this.emit('initialized');
  }

  /**
   * Insert memory entry
   */
  async insert(content, metadata = {}) {
    const entry = new MemoryEntry({
      content: typeof content === 'string' ? content : content.content,
      ...metadata,
      ...(typeof content === 'object' ? content : {})
    });

    // Auto-generate embedding if enabled
    if (this.options.autoEmbedding && this.options.embeddingProvider && !entry.embedding) {
      try {
        entry.embedding = await this.options.embeddingProvider.embed(entry.content);
      } catch (error) {
        this.emit('warning', `Failed to generate embedding: ${error.message}`);
      }
    }

    const id = await this.storage.insert(entry);
    this.emit('inserted', { id, entry });
    return id;
  }

  /**
   * Query memories
   */
  async query(builderFn) {
    const builder = new MemoryQuery();
    if (typeof builderFn === 'function') {
      builderFn(builder);
    }
    
    const results = await this.storage.query(builder);
    this.emit('queried', { results: results.length });
    return results;
  }

  /**
   * Find by ID
   */
  async findById(id) {
    const results = await this.query(q => q.equals('id', id).limit(1));
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Find by user
   */
  async findByUser(userId, limit = 10) {
    return await this.query(q => q.equals('userId', userId).limit(limit));
  }

  /**
   * Semantic search
   */
  async search(text, userId = null, limit = 10) {
    return await this.query(q => {
      q.semantic(text, limit);
      if (userId) q.equals('userId', userId);
      return q;
    });
  }

  /**
   * Vector similarity search
   */
  async similarTo(embedding, threshold = 0.7, limit = 10) {
    return await this.query(q => q.similar(embedding, threshold).limit(limit));
  }

  /**
   * Update memory
   */
  async update(id, updates) {
    const success = await this.storage.update(id, updates);
    if (success) {
      this.emit('updated', { id, updates });
    }
    return success;
  }

  /**
   * Delete memory
   */
  async delete(id) {
    const success = await this.storage.delete(id);
    if (success) {
      this.emit('deleted', { id });
    }
    return success;
  }

  /**
   * Count memories
   */
  async count(conditions = []) {
    return await this.storage.count(conditions);
  }

  /**
   * Get statistics
   */
  async getStats(userId = null) {
    const conditions = userId ? [{ field: 'userId', operator: '=', value: userId }] : [];
    const total = await this.count(conditions);
    
    // Get category distribution
    const allMemories = await this.query(q => {
      if (userId) q.equals('userId', userId);
      return q.limit(1000); // Reasonable limit for stats
    });
    
    const categories = {};
    const types = {};
    let totalImportance = 0;
    let totalAccess = 0;
    
    for (const memory of allMemories) {
      categories[memory.category] = (categories[memory.category] || 0) + 1;
      types[memory.type] = (types[memory.type] || 0) + 1;
      totalImportance += memory.importance;
      totalAccess += memory.accessCount;
    }
    
    return {
      total,
      categories,
      types,
      averageImportance: allMemories.length > 0 ? totalImportance / allMemories.length : 0,
      totalAccess,
      averageAccess: allMemories.length > 0 ? totalAccess / allMemories.length : 0
    };
  }

  /**
   * Cleanup old or low-importance memories
   */
  async cleanup(options = {}) {
    const {
      maxAge = 90 * 24 * 60 * 60 * 1000, // 90 days
      minImportance = 0.1,
      maxMemories = this.options.maxMemories
    } = options;
    
    const cutoffDate = new Date(Date.now() - maxAge);
    
    // Find memories to clean up
    const toDelete = await this.query(q => 
      q.where('lastAccessed', '<', cutoffDate)
       .where('importance', '<', minImportance)
       .limit(1000)
    );
    
    let deletedCount = 0;
    for (const memory of toDelete) {
      if (await this.delete(memory.id)) {
        deletedCount++;
      }
    }
    
    // Enforce max memories limit
    const total = await this.count();
    if (total > maxMemories) {
      const excess = await this.query(q => 
        q.orderBy('importance', 'asc')
         .orderBy('lastAccessed', 'asc')
         .limit(total - maxMemories)
      );
      
      for (const memory of excess) {
        if (await this.delete(memory.id)) {
          deletedCount++;
        }
      }
    }
    
    this.emit('cleanup', { deletedCount });
    return deletedCount;
  }

  async close() {
    await this.storage.close();
    this.emit('closed');
  }
}

/**
 * Memory Node for skingflow integration
 */
export class MemoryNode extends AsyncNode {
  constructor(memoryManager, options = {}) {
    super(options);
    this.memory = memoryManager;
    this.options = options;
  }

  async prepAsync(shared) {
    const action = shared.action || shared.memoryAction || 'query';
    const data = shared.data || shared.content || '';
    const userId = shared.userId || 'anonymous';
    
    return {
      action,
      data,
      userId,
      options: { ...this.options, ...shared.memoryOptions }
    };
  }

  async *execAsyncStream(prepRes) {
    try {
      switch (prepRes.action) {
        case 'insert':
          yield 'Storing memory...\n';
          const id = await this.memory.insert(prepRes.data, { userId: prepRes.userId });
          yield `Memory stored with ID: ${id}\n`;
          break;
          
        case 'query':
        case 'search':
          yield 'Searching memories...\n';
          const results = await this.memory.search(prepRes.data, prepRes.userId);
          yield `Found ${results.length} memories:\n`;
          results.forEach((memory, index) => {
            yield `${index + 1}. ${memory.content.substring(0, 100)}...\n`;
          });
          break;
          
        case 'update':
          yield 'Updating memory...\n';
          const success = await this.memory.update(prepRes.data.id, prepRes.data.updates);
          yield success ? 'Memory updated successfully\n' : 'Memory not found\n';
          break;
          
        case 'delete':
          yield 'Deleting memory...\n';
          const deleted = await this.memory.delete(prepRes.data);
          yield deleted ? 'Memory deleted successfully\n' : 'Memory not found\n';
          break;
          
        case 'stats':
          yield 'Getting memory statistics...\n';
          const stats = await this.memory.getStats(prepRes.userId);
          yield `Total memories: ${stats.total}\n`;
          yield `Average importance: ${stats.averageImportance.toFixed(2)}\n`;
          break;
          
        default:
          yield `Unknown memory action: ${prepRes.action}\n`;
      }
    } catch (error) {
      yield `Memory error: ${error.message}\n`;
      throw error;
    }
  }

  async postAsync(shared, prepRes, execRes) {
    shared.memoryActionComplete = true;
    return 'completed';
  }
}

// Convenience functions
export const createMemoryManager = (storage, options) => new MemoryManager(storage, options);
export const createInMemoryStorage = (config) => new InMemoryStorage(config);
export const createMemoryQuery = () => new MemoryQuery();

export default MemoryManager;
