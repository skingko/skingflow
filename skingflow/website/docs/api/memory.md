# Memory API

The Memory API provides interfaces for storing, retrieving, and managing both short-term and long-term memory in the SkinFlow framework.

## MemorySystem Class

Main class for managing all memory operations.

### Constructor

```javascript
import { MemorySystem } from 'skingflow'

const memorySystem = new MemorySystem({
  shortTerm: {
    maxItems: 100,
    ttl: 3600000 // 1 hour
  },
  longTerm: {
    storage: {
      type: 'postgres',
      config: {
        host: 'localhost',
        database: 'skingflow',
        user: 'postgres',
        password: 'your-password'
      }
    }
  },
  search: {
    enabled: true,
    provider: 'openai',
    model: 'text-embedding-ada-002'
  }
})
```

### Methods

#### store(memory)

Stores a memory in both short-term and long-term storage.

```javascript
const memory = {
  id: 'mem123',
  userId: 'user123',
  type: 'conversation',
  content: 'User prefers concise responses with bullet points',
  timestamp: Date.now(),
  metadata: {
    sessionId: 'session456',
    importance: 0.8,
    tags: ['preference', 'communication-style']
  }
}

await memorySystem.store(memory)
```

**Parameters:**
- **`memory`** (Object): Memory object to store
  - **`id`** (string): Unique memory identifier
  - **`userId`** (string): User identifier
  - **`type`** (string): Memory type
  - **`content`** (string): Memory content
  - **`timestamp`** (number): Creation timestamp
  - **`metadata`** (Object): Additional metadata

**Returns:**
- **Promise\<void\>**

#### retrieve(query, options)

Retrieves memories relevant to a query.

```javascript
const results = await memorySystem.retrieve(
  'user preferences for response style',
  {
    userId: 'user123',
    limit: 10,
    threshold: 0.7,
    types: ['preference', 'conversation']
  }
)
```

**Parameters:**
- **`query`** (string): Search query
- **`options`** (Object): Search options
  - **`userId`** (string): Filter by user
  - **`limit`** (number): Maximum results
  - **`threshold`** (number): Similarity threshold (0-1)
  - **`types`** (Array\<string\>): Filter by memory types
  - **`timeRange`** (Object): Time range filter

**Returns:**
- **Promise\<Array\<Object\>\>**: Relevant memories
  - **`id`** (string): Memory ID
  - **`content`** (string): Memory content
  - **`similarity`** (number): Similarity score
  - **`metadata`** (Object): Memory metadata

#### update(memoryId, updates)

Updates an existing memory.

```javascript
await memorySystem.update('mem123', {
  content: 'User prefers very concise responses with bullet points',
  metadata: {
    importance: 0.9,
    lastUpdated: Date.now()
  }
})
```

**Parameters:**
- **`memoryId`** (string): Memory ID to update
- **`updates`** (Object): Updates to apply

**Returns:**
- **Promise\<void\>**

#### delete(memoryId)

Deletes a memory from storage.

```javascript
await memorySystem.delete('mem123')
```

**Parameters:**
- **`memoryId`** (string): Memory ID to delete

**Returns:**
- **Promise\<void\>**

#### consolidate()

Moves important memories from short-term to long-term storage.

```javascript
await memorySystem.consolidate()
```

**Returns:**
- **Promise\<Object\>**: Consolidation results
  - **`moved`** (number): Number of memories moved
  - **`retained`** (number): Number of memories retained
  - **`errors`** (Array\<string\>): Any errors encountered

## ShortTermMemory Class

Manages in-memory session data.

### Constructor

```javascript
import { ShortTermMemory } from 'skingflow'

const shortTermMemory = new ShortTermMemory({
  maxItems: 100,
  ttl: 3600000, // 1 hour
  cleanupInterval: 300000 // 5 minutes
})
```

### Methods

#### add(memory)

Adds a memory to short-term storage.

```javascript
await shortTermMemory.add({
  id: 'short123',
  userId: 'user123',
  type: 'session_context',
  content: 'Current conversation about AI trends',
  timestamp: Date.now()
})
```

**Parameters:**
- **`memory`** (Object): Memory to add

**Returns:**
- **Promise\<void\>**

#### get(memoryId)

Retrieves a specific memory by ID.

```javascript
const memory = await shortTermMemory.get('short123')
```

**Parameters:**
- **`memoryId`** (string): Memory ID

**Returns:**
- **Promise\<Object\>**: Memory object or null if not found

#### getAll(userId)

Gets all memories for a user.

```javascript
const memories = await shortTermMemory.getAll('user123')
```

**Parameters:**
- **`userId`** (string): User identifier

**Returns:**
- **Promise\<Array\<Object\>\>**: User's short-term memories

#### clear(userId)

Clears all memories for a user.

```javascript
await shortTermMemory.clear('user123')
```

**Parameters:**
- **`userId`** (string): User identifier

**Returns:**
- **Promise\<void\>**

#### cleanup()

Removes expired memories.

```javascript
const results = await shortTermMemory.cleanup()
console.log(`Cleaned up ${results.removed} expired memories`)
```

**Returns:**
- **Promise\<Object\>**: Cleanup results
  - **`removed`** (number): Number of memories removed
  - **`total`** (number): Total memories before cleanup

## LongTermMemory Class

Manages persistent memory storage.

### Constructor

```javascript
import { LongTermMemory } from 'skingflow'

const longTermMemory = new LongTermMemory({
  storage: {
    type: 'postgres',
    config: {
      host: 'localhost',
      database: 'skingflow',
      user: 'postgres',
      password: 'your-password'
    }
  },
  indexing: {
    enabled: true,
    provider: 'openai',
    model: 'text-embedding-ada-002'
  }
})
```

### Methods

#### persist(memory)

Persists a memory to long-term storage.

```javascript
await longTermMemory.persist({
  id: 'long123',
  userId: 'user123',
  type: 'user_preference',
  content: 'Prefers dark mode themes',
  embedding: await generateEmbedding('Prefers dark mode themes'),
  timestamp: Date.now(),
  metadata: {
    category: 'ui',
    importance: 0.7
  }
})
```

**Parameters:**
- **`memory`** (Object): Memory to persist

**Returns:**
- **Promise\<void\>**

#### search(query, options)

Searches for memories using semantic similarity.

```javascript
const results = await longTermMemory.search(
  'user interface preferences',
  {
    userId: 'user123',
    limit: 10,
    threshold: 0.6,
    timeRange: {
      start: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
      end: Date.now()
    }
  }
)
```

**Parameters:**
- **`query`** (string): Search query
- **`options`** (Object): Search options

**Returns:**
- **Promise\<Array\<Object\>\>**: Search results with similarity scores

#### getByType(type, options)

Gets memories by type.

```javascript
const preferences = await longTermMemory.getByType('user_preference', {
  userId: 'user123',
  limit: 50,
  sortBy: 'importance',
  sortOrder: 'desc'
})
```

**Parameters:**
- **`type`** (string): Memory type
- **`options`** (Object): Query options

**Returns:**
- **Promise\<Array\<Object\>\>**: Memories of specified type

#### updateEmbeddings(memoryIds)

Updates embeddings for specified memories.

```javascript
await longTermMemory.updateEmbeddings(['long123', 'long456'])
```

**Parameters:**
- **`memoryIds`** (Array\<string\>): Memory IDs to update

**Returns:**
- **Promise\<void\>**

## SemanticSearch Class

Provides semantic search capabilities using embeddings.

### Constructor

```javascript
import { SemanticSearch } from 'skingflow'

const semanticSearch = new SemanticSearch({
  provider: 'openai',
  model: 'text-embedding-ada-002',
  dimensions: 1536,
  batchSize: 100
})
```

### Methods

#### generateEmbedding(text)

Generates an embedding for text.

```javascript
const embedding = await semanticSearch.generateEmbedding(
  'User prefers concise responses with bullet points'
)
```

**Parameters:**
- **`text`** (string): Text to embed

**Returns:**
- **Promise\<Array\<number\>\>**: Embedding vector

#### similarity(embedding1, embedding2)

Calculates similarity between two embeddings.

```javascript
const similarity = await semanticSearch.similarity(embedding1, embedding2)
console.log(`Similarity score: ${similarity}`)
```

**Parameters:**
- **`embedding1`** (Array\<number\>): First embedding
- **`embedding2`** (Array\<number\>): Second embedding

**Returns:**
- **Promise\<number\>**: Similarity score (0-1)

#### findSimilar(query, embeddings, options)

Finds most similar embeddings to a query.

```javascript
const results = await semanticSearch.findSimilar(
  queryEmbedding,
  memoryEmbeddings,
  {
    limit: 10,
    threshold: 0.7
  }
)
```

**Parameters:**
- **`query`** (Array\<number\>): Query embedding
- **`embeddings`** (Array\<Object\>): Candidate embeddings
- **`options`** (Object): Search options

**Returns:**
- **Promise\<Array\<Object\>\>**: Similar embeddings with scores

## Memory Backend Classes

### PostgreSQLBackend

PostgreSQL-based memory storage.

```javascript
import { PostgreSQLBackend } from 'skingflow'

const pgBackend = new PostgreSQLBackend({
  host: 'localhost',
  port: 5432,
  database: 'skingflow',
  user: 'postgres',
  password: 'your-password',
  ssl: false,
  pool: {
    max: 20,
    min: 5,
    idle: 30000
  }
})

// Initialize tables
await pgBackend.initialize()
```

### SQLiteBackend

SQLite-based memory storage for development.

```javascript
import { SQLiteBackend } from 'skingflow'

const sqliteBackend = new SQLiteBackend({
  database: './skingflow_memory.db',
  timeout: 30000
})

await sqliteBackend.initialize()
```

### RedisBackend

Redis-based memory storage for caching.

```javascript
import { RedisBackend } from 'skingflow'

const redisBackend = new RedisBackend({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'skingflow:memory:'
})
```

## Memory Manager

High-level memory management interface.

```javascript
import { MemoryManager } from 'skingflow'

const memoryManager = new MemoryManager({
  system: memorySystem,
  consolidation: {
    enabled: true,
    interval: 300000, // 5 minutes
    importanceThreshold: 0.7
  },
  cleanup: {
    enabled: true,
    interval: 3600000, // 1 hour
    retentionPeriod: 2592000000 // 30 days
  }
})

// Start background processes
await memoryManager.start()

// Stop background processes
await memoryManager.stop()
```

## Context Management

Manage conversation context:

```javascript
// Create context manager
const contextManager = memorySystem.createContextManager({
  userId: 'user123',
  sessionId: 'session456',
  maxContextLength: 100,
  maxTokens: 4000
})

// Add message to context
await contextManager.addMessage({
  role: 'user',
  content: 'Hello, I need help with my project',
  timestamp: Date.now()
})

// Get current context
const context = await contextManager.getContext()
console.log('Current context:', context.messages)

// Clear context
await contextManager.clear()
```

## User Preferences

Store and retrieve user preferences:

```javascript
// Store user preference
await memorySystem.store({
  id: 'pref_theme',
  userId: 'user123',
  type: 'user_preference',
  content: 'dark_mode',
  metadata: {
    category: 'ui',
    importance: 0.8,
    lastUpdated: Date.now()
  }
})

// Retrieve user preferences
const preferences = await memorySystem.retrieve(
  'user interface preferences',
  {
    userId: 'user123',
    types: ['user_preference'],
    limit: 20
  }
)

// Get specific preference
const themePreference = preferences.find(p =>
  p.content === 'dark_mode' || p.metadata.category === 'ui'
)
```

## Memory Analytics

Analyze memory usage and patterns:

```javascript
// Get memory statistics
const stats = await memorySystem.getStatistics()
console.log('Memory Statistics:', stats)

// Output example:
{
  "totalMemories": 15420,
  "shortTermMemories": 1230,
  "longTermMemories": 14190,
  "usersCount": 856,
  "averageMemoriesPerUser": 18.01,
  "memoryTypes": {
    "conversation": 8920,
    "user_preference": 3450,
    "session_context": 2050,
    "learning": 1000
  },
  "storageUsage": {
    "totalSize": "2.3GB",
    "averageSizePerMemory": "156KB"
  },
  "searchPerformance": {
    "averageSearchTime": 234,
    "successRate": 0.98
  }
}
```

## Memory Export/Import

Export and import memory data:

```javascript
// Export memories
const exportData = await memorySystem.export({
  userId: 'user123',
  formats: ['json', 'csv'],
  includeEmbeddings: false,
  timeRange: {
    start: Date.now() - 30 * 24 * 60 * 60 * 1000,
    end: Date.now()
  }
})

// Import memories
const importResult = await memorySystem.import(exportData, {
  userId: 'user123',
  deduplicate: true,
  updateExisting: true
})
```

## Best Practices

### 1. Memory Design
- Use descriptive memory types and categories
- Include relevant metadata for better searchability
- Set appropriate importance scores for consolidation
- Use semantic search for context-aware retrieval

### 2. Performance
- Configure appropriate TTL for short-term memory
- Use indexing for frequently searched memory types
- Implement batch operations for bulk operations
- Monitor memory usage and cleanup regularly

### 3. Privacy and Security
- Implement proper access controls for user data
- Encrypt sensitive memory content
- Comply with data retention regulations
- Provide user control over their memory data

### 4. Scalability
- Choose appropriate storage backend for your use case
- Implement connection pooling for database backends
- Use caching for frequently accessed memories
- Design for horizontal scaling when needed

## Next Steps

- [Framework API](./framework.md) - Main framework API documentation
- [Agent API](./agent.md) - Agent system API documentation
- [Tool API](./tool.md) - Tool system API documentation
- [Examples](../examples/quick-start.md) - Practical implementations