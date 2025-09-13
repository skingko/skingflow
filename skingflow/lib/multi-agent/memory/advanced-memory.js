/**
 * Advanced Memory System for Multi-Agent Framework
 * 
 * Based on mem0 architecture with:
 * - Short-term memory (session/conversation context)
 * - Long-term memory (user preferences, facts, history)
 * - User preferences (personalization data)
 * - Semantic search and retrieval
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import { MemoryEntry, MemoryStorage } from '../../core/memory.js';
import chalk from 'chalk';

/**
 * Memory Types
 */
export const MemoryType = {
  SHORT_TERM: 'short_term',
  LONG_TERM: 'long_term',
  USER_PREFERENCE: 'user_preference',
  FACT: 'fact',
  INTEREST: 'interest',
  CONVERSATION: 'conversation',
  TASK_RESULT: 'task_result'
};

/**
 * Advanced Memory Entry
 */
export class AdvancedMemoryEntry extends MemoryEntry {
  constructor(data = {}) {
    super(data);
    
    // Additional fields for advanced memory
    this.memoryType = data.memoryType || MemoryType.SHORT_TERM;
    this.sessionId = data.sessionId || null;
    this.runId = data.runId || null;
    this.agentId = data.agentId || null;
    this.parentMemoryId = data.parentMemoryId || null;
    this.extractedFrom = data.extractedFrom || null;
    this.expiresAt = data.expiresAt || null;
    this.accessPattern = data.accessPattern || {
      lastAccessed: new Date(),
      accessCount: 0,
      accessFrequency: 0
    };
    this.relationships = data.relationships || [];
    this.sentiment = data.sentiment || null;
    this.entities = data.entities || [];
  }

  /**
   * Check if memory is expired
   */
  isExpired() {
    return this.expiresAt && new Date() > this.expiresAt;
  }

  /**
   * Update access pattern
   */
  recordAccess() {
    this.accessPattern.lastAccessed = new Date();
    this.accessPattern.accessCount += 1;
    
    // Calculate access frequency (accesses per day since creation)
    const daysSinceCreation = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    this.accessPattern.accessFrequency = this.accessPattern.accessCount / Math.max(daysSinceCreation, 1);
  }

  /**
   * Add relationship to another memory
   */
  addRelationship(memoryId, type, strength = 1.0) {
    this.relationships.push({
      memoryId,
      type, // 'related', 'contradicts', 'supports', 'follows', etc.
      strength,
      createdAt: new Date()
    });
  }
}

/**
 * Advanced Memory Manager
 */
export class AdvancedMemoryManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      shortTermRetention: config.shortTermRetention || 24 * 60 * 60 * 1000, // 24 hours
      maxShortTermMemories: config.maxShortTermMemories || 100,
      maxLongTermMemories: config.maxLongTermMemories || 10000,
      consolidationThreshold: config.consolidationThreshold || 0.8,
      preferenceUpdateThreshold: config.preferenceUpdateThreshold || 0.7,
      memoryExtractionEnabled: config.memoryExtractionEnabled !== false,
      semanticSearchEnabled: config.semanticSearchEnabled !== false,
      storage: config.storage || null
    };
    
    this.storage = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Initialize storage
    if (this.config.storage) {
      this.storage = this.config.storage;
    } else {
      // Use default in-memory storage
      const { InMemoryStorage } = await import('../../core/memory.js');
      this.storage = new InMemoryStorage();
    }

    await this.storage.initialize();
    
    // Initialize memory manager for queries
    const { MemoryManager } = await import('../../core/memory.js');
    this.memoryManager = new MemoryManager(this.storage);
    
    // Start background processes
    this.startBackgroundProcesses();
    
    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Add short-term memory (conversation context)
   */
  async addShortTermMemory(data) {
    const memory = new AdvancedMemoryEntry({
      ...data,
      memoryType: MemoryType.SHORT_TERM,
      type: data.type || 'conversation',
      category: data.category || 'session',
      // Short-term memories expire after retention period
      expiresAt: new Date(Date.now() + this.config.shortTermRetention)
    });

    const id = await this.storage.insert(memory);
    this.emit('shortTermMemoryAdded', { id, memory });
    
    // Clean up old short-term memories
    await this.cleanupShortTermMemories(data.userId, data.sessionId);
    
    return id;
  }

  /**
   * Add long-term memory (persistent facts, preferences)
   */
  async addLongTermMemory(data) {
    const memory = new AdvancedMemoryEntry({
      ...data,
      memoryType: MemoryType.LONG_TERM,
      type: data.type || 'fact',
      category: data.category || 'knowledge',
      importance: data.importance || 0.8,
      // Long-term memories don't expire
      expiresAt: null
    });

    // Check for conflicts with existing memories
    const conflicts = await this.findConflictingMemories(memory);
    if (conflicts.length > 0) {
      memory = await this.resolveMemoryConflicts(memory, conflicts);
    }

    const id = await this.storage.insert(memory);
    this.emit('longTermMemoryAdded', { id, memory });
    
    return id;
  }

  /**
   * Add or update user preference
   */
  async addUserPreference(data) {
    // Check if preference already exists
    const existing = await this.memoryManager.query(q => 
      q.equals('userId', data.userId)
       .equals('memoryType', MemoryType.USER_PREFERENCE)
       .equals('category', data.category)
       .contains('content', data.preferenceKey || data.content)
       .limit(1)
    );

    if (existing.length > 0) {
      // Update existing preference
      const existingMemory = existing[0];
      const updatedContent = this.mergePreferences(existingMemory.content, data.content);
      
      await this.storage.update(existingMemory.id, {
        content: updatedContent,
        confidence: Math.max(existingMemory.confidence, data.confidence || 0.8),
        importance: Math.max(existingMemory.importance, data.importance || 0.9),
        updatedAt: new Date()
      });

      this.emit('userPreferenceUpdated', { id: existingMemory.id, data });
      return existingMemory.id;
    } else {
      // Create new preference
      const memory = new AdvancedMemoryEntry({
        ...data,
        memoryType: MemoryType.USER_PREFERENCE,
        type: 'preference',
        category: data.category || 'user_setting',
        importance: data.importance || 0.9,
        confidence: data.confidence || 0.8
      });

      const id = await this.storage.insert(memory);
      this.emit('userPreferenceAdded', { id, memory });
      return id;
    }
  }

  /**
   * Get short-term memories for a session
   */
  async getShortTermMemories(userId, sessionId, limit = 20) {
    const memories = await this.memoryManager.query(q => 
      q.equals('userId', userId)
       .equals('sessionId', sessionId)
       .equals('memoryType', MemoryType.SHORT_TERM)
       .orderBy('createdAt', 'desc')
       .limit(limit)
    );

    // Convert to AdvancedMemoryEntry instances and update access patterns
    const advancedMemories = memories.map(m => new AdvancedMemoryEntry(m));
    
    for (const memory of advancedMemories) {
      memory.recordAccess();
      await this.storage.update(memory.id, {
        lastAccessed: memory.accessPattern.lastAccessed,
        accessCount: memory.accessPattern.accessCount
      });
    }

    return advancedMemories.filter(m => !m.isExpired());
  }

  /**
   * Search long-term memories
   */
  async searchLongTermMemories(query, userId, limit = 10) {
    const memories = await this.memoryManager.query(q => 
      q.equals('userId', userId)
       .equals('memoryType', MemoryType.LONG_TERM)
       .contains('content', query)  // Use contains instead of semantic for now
       .orderBy('importance', 'desc')
       .limit(limit)
    );

    // Convert to AdvancedMemoryEntry instances and update access patterns
    const advancedMemories = memories.map(m => new AdvancedMemoryEntry(m));
    
    for (const memory of advancedMemories) {
      memory.recordAccess();
      await this.storage.update(memory.id, {
        lastAccessed: memory.accessPattern.lastAccessed,
        accessCount: memory.accessPattern.accessCount
      });
    }

    return advancedMemories;
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId, category = null) {
    return await this.memoryManager.query(q => {
      let builder = q.equals('userId', userId)
                    .equals('memoryType', MemoryType.USER_PREFERENCE);
      
      if (category) {
        builder = builder.equals('category', category);
      }
      
      return builder.orderBy('importance', 'desc').limit(50);
    });
  }

  /**
   * Search all memories with context
   */
  async searchWithContext(query, userId, options = {}) {
    const results = {
      shortTerm: [],
      longTerm: [],
      preferences: [],
      related: []
    };

    // Search short-term memories
    if (options.includeShortTerm !== false) {
      results.shortTerm = await this.memoryManager.query(q => 
        q.equals('userId', userId)
         .equals('memoryType', MemoryType.SHORT_TERM)
         .contains('content', query)  // Use contains instead of semantic for now
         .limit(options.shortTermLimit || 5)
      );
    }

    // Search long-term memories
    if (options.includeLongTerm !== false) {
      results.longTerm = await this.searchLongTermMemories(
        query, 
        userId, 
        options.longTermLimit || 10
      );
    }

    // Search preferences
    if (options.includePreferences !== false) {
      results.preferences = await this.memoryManager.query(q => 
        q.equals('userId', userId)
         .equals('memoryType', MemoryType.USER_PREFERENCE)
         .contains('content', query)  // Use contains instead of semantic for now
         .limit(options.preferencesLimit || 5)
      );
    }

    // Find related memories
    if (options.includeRelated !== false) {
      const allMemories = [...results.shortTerm, ...results.longTerm, ...results.preferences];
      results.related = await this.findRelatedMemories(allMemories, options.relatedLimit || 3);
    }

    return results;
  }

  /**
   * Consolidate short-term memories into long-term
   */
  async consolidateMemories(userId) {
    console.log(chalk.cyan(`🔄 Consolidating memories for user ${userId}...`));

    // Get short-term memories that meet consolidation criteria
    const candidates = await this.memoryManager.query(q => 
      q.equals('userId', userId)
       .equals('memoryType', MemoryType.SHORT_TERM)
       .gte('importance', this.config.consolidationThreshold)
       .limit(100) // Limit to avoid performance issues
    );

    let consolidated = 0;
    for (const memory of candidates) {
      // Extract important information and convert to long-term
      const longTermMemory = await this.extractLongTermMemory(memory);
      if (longTermMemory) {
        await this.addLongTermMemory(longTermMemory);
        
        // Mark original as consolidated
        await this.storage.update(memory.id, {
          consolidated: true,
          consolidatedAt: new Date()
        });
        
        consolidated++;
      }
    }

    console.log(chalk.green(`✅ Consolidated ${consolidated} memories`));
    this.emit('memoriesConsolidated', { userId, count: consolidated });
    
    return consolidated;
  }

  /**
   * Clean up expired and low-value memories
   */
  async cleanupMemories(userId = null) {
    console.log(chalk.cyan('🧹 Cleaning up memories...'));

    let cleaned = 0;

    // Clean up expired short-term memories
    const expired = await this.memoryManager.query(q => {
      let builder = q.equals('memoryType', MemoryType.SHORT_TERM);
      
      if (userId) builder = builder.equals('userId', userId);
      
      return builder.limit(1000);
    });

    for (const memory of expired) {
      await this.storage.delete(memory.id);
      cleaned++;
    }

    // Clean up low-value long-term memories (if over limit)
    if (userId) {
      const longTermCount = await this.storage.count([
        { field: 'userId', value: userId },
        { field: 'memoryType', value: MemoryType.LONG_TERM }
      ]);

      if (longTermCount > this.config.maxLongTermMemories) {
        const excess = longTermCount - this.config.maxLongTermMemories;
        const lowValue = await this.memoryManager.query(q => 
          q.equals('userId', userId)
           .equals('memoryType', MemoryType.LONG_TERM)
           .orderBy('importance', 'asc')
           .limit(excess)
        );

        for (const memory of lowValue) {
          await this.storage.delete(memory.id);
          cleaned++;
        }
      }
    }

    console.log(chalk.green(`✅ Cleaned up ${cleaned} memories`));
    this.emit('memoriesCleaned', { count: cleaned });
    
    return cleaned;
  }

  // Private helper methods

  async cleanupShortTermMemories(userId, sessionId) {
    const count = await this.storage.count([
      { field: 'userId', value: userId },
      { field: 'sessionId', value: sessionId },
      { field: 'memoryType', value: MemoryType.SHORT_TERM }
    ]);

    if (count > this.config.maxShortTermMemories) {
      const excess = count - this.config.maxShortTermMemories;
      const oldest = await this.memoryManager.query(q => 
        q.equals('userId', userId)
         .equals('sessionId', sessionId)
         .equals('memoryType', MemoryType.SHORT_TERM)
         .orderBy('createdAt', 'asc')
         .limit(excess)
      );

      for (const memory of oldest) {
        await this.storage.delete(memory.id);
      }
    }
  }

  async findConflictingMemories(newMemory) {
    // Simple conflict detection based on content similarity
    return await this.memoryManager.query(q => 
      q.equals('userId', newMemory.userId)
       .equals('memoryType', newMemory.memoryType)
       .equals('category', newMemory.category)
       .contains('content', newMemory.content.substring(0, 50)) // Use substring for similarity
       .limit(5)
    );
  }

  async resolveMemoryConflicts(newMemory, conflicts) {
    // Simple resolution: update importance and merge if very similar
    for (const conflict of conflicts) {
      if (this.calculateSimilarity(newMemory.content, conflict.content) > 0.9) {
        // Very similar - merge and update existing
        conflict.content = this.mergeMemoryContent(conflict.content, newMemory.content);
        conflict.importance = Math.max(conflict.importance, newMemory.importance);
        conflict.confidence = Math.max(conflict.confidence, newMemory.confidence);
        
        await this.storage.update(conflict.id, {
          content: conflict.content,
          importance: conflict.importance,
          confidence: conflict.confidence,
          updatedAt: new Date()
        });

        // Don't create new memory
        return null;
      }
    }

    return newMemory;
  }

  mergePreferences(existing, newContent) {
    // Simple merge - in production, this would be more sophisticated
    return `${existing}\n${newContent}`;
  }

  mergeMemoryContent(existing, newContent) {
    // Simple merge - in production, this would use LLM for intelligent merging
    return `${existing} (Updated: ${newContent})`;
  }

  calculateSimilarity(content1, content2) {
    // Simple similarity calculation - in production, use embeddings
    const words1 = content1.toLowerCase().split(/\s+/);
    const words2 = content2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  async extractLongTermMemory(shortTermMemory) {
    // Extract important information for long-term storage
    if (shortTermMemory.importance < this.config.consolidationThreshold) {
      return null;
    }

    return {
      userId: shortTermMemory.userId,
      content: shortTermMemory.content,
      type: 'extracted_fact',
      category: shortTermMemory.category,
      importance: shortTermMemory.importance,
      confidence: shortTermMemory.confidence,
      extractedFrom: shortTermMemory.id,
      metadata: {
        originalSession: shortTermMemory.sessionId,
        extractedAt: new Date(),
        accessCount: shortTermMemory.accessPattern.accessCount
      }
    };
  }

  async findRelatedMemories(memories, limit = 5) {
    const related = [];
    
    for (const memory of memories) {
      if (memory.relationships && memory.relationships.length > 0) {
        for (const relationship of memory.relationships.slice(0, limit)) {
          try {
            const relatedMemory = await this.storage.findById(relationship.memoryId);
            if (relatedMemory) {
              related.push({
                memory: relatedMemory,
                relationship: relationship.type,
                strength: relationship.strength
              });
            }
          } catch (error) {
            // Related memory might have been deleted
            continue;
          }
        }
      }
    }

    return related.slice(0, limit);
  }

  startBackgroundProcesses() {
    // Periodic cleanup
    setInterval(async () => {
      try {
        await this.cleanupMemories();
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Background cleanup failed:'), error.message);
      }
    }, 60 * 60 * 1000); // Every hour

    // Periodic consolidation
    setInterval(async () => {
      try {
        // Get all users with short-term memories
        const users = await this.getActiveUsers();
        for (const userId of users) {
          await this.consolidateMemories(userId);
        }
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Background consolidation failed:'), error.message);
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours
  }

  async getActiveUsers() {
    // Get users who have recent short-term memories
    const recentMemories = await this.memoryManager.query(q => 
      q.equals('memoryType', MemoryType.SHORT_TERM)
       .limit(1000)
    );

    return [...new Set(recentMemories.map(m => m.userId))];
  }

  async close() {
    if (this.storage) {
      await this.storage.close();
    }
    this.initialized = false;
    this.emit('closed');
  }
}
