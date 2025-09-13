/**
 * Virtual File System for Multi-Agent Framework
 * 
 * Based on deepagents virtual filesystem for context sharing between agents
 * Provides file operations without touching the real filesystem
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { EventEmitter } from 'events';
import path from 'path';
import chalk from 'chalk';

/**
 * Virtual File Entry
 */
export class VirtualFile {
  constructor(name, content = '', metadata = {}) {
    this.name = name;
    this.content = content;
    this.size = content.length;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.accessedAt = new Date();
    this.metadata = {
      type: this.getFileType(name),
      encoding: 'utf8',
      permissions: 'rw-r--r--',
      ...metadata
    };
    this.version = 1;
    this.history = [];
  }

  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.txt': 'text',
      '.log': 'log',
      '.sql': 'sql'
    };
    return typeMap[ext] || 'text';
  }

  read() {
    this.accessedAt = new Date();
    return this.content;
  }

  write(content, append = false) {
    // Save to history
    this.history.push({
      content: this.content,
      size: this.size,
      version: this.version,
      timestamp: this.updatedAt
    });

    // Keep only last 10 versions
    if (this.history.length > 10) {
      this.history = this.history.slice(-10);
    }

    // Update content
    if (append) {
      this.content += content;
    } else {
      this.content = content;
    }

    this.size = this.content.length;
    this.updatedAt = new Date();
    this.accessedAt = new Date();
    this.version++;
  }

  edit(oldStr, newStr) {
    if (!this.content.includes(oldStr)) {
      throw new Error(`String "${oldStr}" not found in file ${this.name}`);
    }

    const newContent = this.content.replace(oldStr, newStr);
    this.write(newContent);
  }

  getInfo() {
    return {
      name: this.name,
      size: this.size,
      type: this.metadata.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      accessedAt: this.accessedAt,
      version: this.version,
      permissions: this.metadata.permissions
    };
  }

  getHistory() {
    return [...this.history];
  }
}

/**
 * Virtual File System
 */
export class VirtualFileSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxFiles: config.maxFiles || 1000,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxTotalSize: config.maxTotalSize || 100 * 1024 * 1024, // 100MB
      allowedExtensions: config.allowedExtensions || null, // null = all allowed
      autoBackup: config.autoBackup !== false,
      compressionEnabled: config.compressionEnabled || false
    };

    this.files = new Map();
    this.totalSize = 0;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    this.initialized = true;
    this.emit('initialized');
    console.log(chalk.blue('📁 Virtual file system initialized'));
  }

  /**
   * List all files
   */
  listFiles() {
    const fileList = {};
    for (const [name, file] of this.files) {
      fileList[name] = {
        name: file.name,
        size: file.size,
        type: file.metadata.type,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      };
    }
    return fileList;
  }

  /**
   * Check if file exists
   */
  exists(filename) {
    return this.files.has(filename);
  }

  /**
   * Read file content
   */
  readFile(filename) {
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist`);
    }

    const file = this.files.get(filename);
    this.emit('fileRead', { filename, size: file.size });
    return file.read();
  }

  /**
   * Write file content
   */
  writeFile(filename, content, options = {}) {
    this.validateFile(filename, content);

    let file;
    if (this.exists(filename)) {
      file = this.files.get(filename);
      const oldSize = file.size;
      file.write(content, options.append);
      this.totalSize += (file.size - oldSize);
      
      this.emit('fileUpdated', { 
        filename, 
        oldSize, 
        newSize: file.size,
        version: file.version 
      });
    } else {
      file = new VirtualFile(filename, content, options.metadata);
      this.files.set(filename, file);
      this.totalSize += file.size;
      
      this.emit('fileCreated', { 
        filename, 
        size: file.size,
        type: file.metadata.type 
      });
    }

    this.checkLimits();
    return file.getInfo();
  }

  /**
   * Edit file content (find and replace)
   */
  editFile(filename, oldStr, newStr) {
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist`);
    }

    const file = this.files.get(filename);
    const oldSize = file.size;
    
    try {
      file.edit(oldStr, newStr);
      this.totalSize += (file.size - oldSize);
      
      this.emit('fileEdited', { 
        filename, 
        oldSize, 
        newSize: file.size,
        version: file.version 
      });
      
      return file.getInfo();
    } catch (error) {
      throw new Error(`Edit failed for "${filename}": ${error.message}`);
    }
  }

  /**
   * Delete file
   */
  deleteFile(filename) {
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist`);
    }

    const file = this.files.get(filename);
    this.totalSize -= file.size;
    this.files.delete(filename);
    
    this.emit('fileDeleted', { filename, size: file.size });
    return true;
  }

  /**
   * Copy file
   */
  copyFile(sourceFilename, targetFilename) {
    if (!this.exists(sourceFilename)) {
      throw new Error(`Source file "${sourceFilename}" does not exist`);
    }

    if (this.exists(targetFilename)) {
      throw new Error(`Target file "${targetFilename}" already exists`);
    }

    const sourceFile = this.files.get(sourceFilename);
    const targetFile = new VirtualFile(
      targetFilename, 
      sourceFile.content, 
      { ...sourceFile.metadata }
    );

    this.files.set(targetFilename, targetFile);
    this.totalSize += targetFile.size;
    
    this.emit('fileCopied', { 
      sourceFilename, 
      targetFilename, 
      size: targetFile.size 
    });
    
    return targetFile.getInfo();
  }

  /**
   * Move/rename file
   */
  moveFile(oldFilename, newFilename) {
    if (!this.exists(oldFilename)) {
      throw new Error(`File "${oldFilename}" does not exist`);
    }

    if (this.exists(newFilename)) {
      throw new Error(`Target file "${newFilename}" already exists`);
    }

    const file = this.files.get(oldFilename);
    file.name = newFilename;
    
    this.files.delete(oldFilename);
    this.files.set(newFilename, file);
    
    this.emit('fileMoved', { oldFilename, newFilename });
    return file.getInfo();
  }

  /**
   * Get file info
   */
  getFileInfo(filename) {
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist`);
    }

    const file = this.files.get(filename);
    return file.getInfo();
  }

  /**
   * Get file history
   */
  getFileHistory(filename) {
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist`);
    }

    const file = this.files.get(filename);
    return file.getHistory();
  }

  /**
   * Search files by content
   */
  searchFiles(query, options = {}) {
    const results = [];
    const caseSensitive = options.caseSensitive !== false;
    const regex = options.regex || false;
    
    let searchPattern;
    if (regex) {
      try {
        searchPattern = new RegExp(query, caseSensitive ? 'g' : 'gi');
      } catch (error) {
        throw new Error(`Invalid regex pattern: ${error.message}`);
      }
    }

    for (const [filename, file] of this.files) {
      let matches = [];
      const content = file.content;
      
      if (regex) {
        let match;
        while ((match = searchPattern.exec(content)) !== null) {
          matches.push({
            line: content.substring(0, match.index).split('\n').length,
            column: match.index - content.lastIndexOf('\n', match.index - 1),
            match: match[0],
            index: match.index
          });
        }
      } else {
        const searchTerm = caseSensitive ? query : query.toLowerCase();
        const searchContent = caseSensitive ? content : content.toLowerCase();
        
        let index = searchContent.indexOf(searchTerm);
        while (index !== -1) {
          matches.push({
            line: content.substring(0, index).split('\n').length,
            column: index - content.lastIndexOf('\n', index - 1),
            match: content.substring(index, index + query.length),
            index
          });
          index = searchContent.indexOf(searchTerm, index + 1);
        }
      }

      if (matches.length > 0) {
        results.push({
          filename,
          matches,
          matchCount: matches.length
        });
      }
    }

    return results;
  }

  /**
   * Get system stats
   */
  getStats() {
    const stats = {
      totalFiles: this.files.size,
      totalSize: this.totalSize,
      maxFiles: this.config.maxFiles,
      maxTotalSize: this.config.maxTotalSize,
      utilizationPercent: (this.totalSize / this.config.maxTotalSize) * 100,
      fileTypes: {},
      averageFileSize: this.files.size > 0 ? this.totalSize / this.files.size : 0
    };

    // Count file types
    for (const file of this.files.values()) {
      const type = file.metadata.type;
      stats.fileTypes[type] = (stats.fileTypes[type] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clear all files
   */
  clear() {
    const fileCount = this.files.size;
    this.files.clear();
    this.totalSize = 0;
    
    this.emit('filesCleared', { fileCount });
    return fileCount;
  }

  /**
   * Export files as JSON
   */
  exportFiles() {
    const exported = {};
    for (const [filename, file] of this.files) {
      exported[filename] = {
        content: file.content,
        metadata: file.metadata,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        version: file.version
      };
    }
    return exported;
  }

  /**
   * Import files from JSON
   */
  importFiles(data, options = {}) {
    const overwrite = options.overwrite || false;
    let imported = 0;
    let skipped = 0;

    for (const [filename, fileData] of Object.entries(data)) {
      if (this.exists(filename) && !overwrite) {
        skipped++;
        continue;
      }

      try {
        const file = new VirtualFile(filename, fileData.content, fileData.metadata);
        if (fileData.createdAt) file.createdAt = new Date(fileData.createdAt);
        if (fileData.updatedAt) file.updatedAt = new Date(fileData.updatedAt);
        if (fileData.version) file.version = fileData.version;

        this.files.set(filename, file);
        this.totalSize += file.size;
        imported++;
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Failed to import ${filename}: ${error.message}`));
      }
    }

    this.emit('filesImported', { imported, skipped });
    return { imported, skipped };
  }

  // Private helper methods

  validateFile(filename, content) {
    // Check file extension
    if (this.config.allowedExtensions) {
      const ext = path.extname(filename).toLowerCase();
      if (!this.config.allowedExtensions.includes(ext)) {
        throw new Error(`File extension "${ext}" is not allowed`);
      }
    }

    // Check file size
    if (content.length > this.config.maxFileSize) {
      throw new Error(`File size (${content.length}) exceeds maximum (${this.config.maxFileSize})`);
    }

    // Check total files limit
    if (!this.exists(filename) && this.files.size >= this.config.maxFiles) {
      throw new Error(`Maximum number of files (${this.config.maxFiles}) reached`);
    }
  }

  checkLimits() {
    if (this.totalSize > this.config.maxTotalSize) {
      console.warn(chalk.yellow(`⚠️  Total size (${this.totalSize}) exceeds limit (${this.config.maxTotalSize})`));
      // Could implement auto-cleanup here
    }
  }

  async close() {
    this.files.clear();
    this.totalSize = 0;
    this.initialized = false;
    this.emit('closed');
  }
}

/**
 * Virtual File System Tools for Tool Registry
 */
export const VirtualFileSystemTools = {
  ls: {
    name: 'ls',
    description: 'List files in the virtual filesystem',
    parameters: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Optional pattern to filter files'
        }
      }
    },
    execute: async (args, context) => {
      const vfs = context.virtualFs;
      if (!vfs) throw new Error('Virtual filesystem not available');

      const files = vfs.listFiles();
      let result = Object.values(files);

      if (args.pattern) {
        const regex = new RegExp(args.pattern, 'i');
        result = result.filter(file => regex.test(file.name));
      }

      return result.map(file => 
        `${file.name} (${file.size} bytes, ${file.type}, ${file.updatedAt.toISOString()})`
      ).join('\n');
    }
  },

  read_file: {
    name: 'read_file',
    description: 'Read content from a file in the virtual filesystem',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to read'
        }
      },
      required: ['filename']
    },
    execute: async (args, context) => {
      const vfs = context.virtualFs;
      if (!vfs) throw new Error('Virtual filesystem not available');

      return vfs.readFile(args.filename);
    }
  },

  write_file: {
    name: 'write_file',
    description: 'Write content to a file in the virtual filesystem',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to write'
        },
        content: {
          type: 'string',
          description: 'Content to write to the file'
        },
        append: {
          type: 'boolean',
          description: 'Whether to append to existing content'
        }
      },
      required: ['filename', 'content']
    },
    execute: async (args, context) => {
      const vfs = context.virtualFs;
      if (!vfs) throw new Error('Virtual filesystem not available');

      const info = vfs.writeFile(args.filename, args.content, { append: args.append });
      return `File "${args.filename}" written successfully (${info.size} bytes)`;
    }
  },

  edit_file: {
    name: 'edit_file',
    description: 'Edit a file by replacing text in the virtual filesystem',
    parameters: {
      type: 'object',
      properties: {
        filename: {
          type: 'string',
          description: 'Name of the file to edit'
        },
        old_string: {
          type: 'string',
          description: 'Text to replace'
        },
        new_string: {
          type: 'string',
          description: 'Replacement text'
        }
      },
      required: ['filename', 'old_string', 'new_string']
    },
    execute: async (args, context) => {
      const vfs = context.virtualFs;
      if (!vfs) throw new Error('Virtual filesystem not available');

      const info = vfs.editFile(args.filename, args.old_string, args.new_string);
      return `File "${args.filename}" edited successfully (version ${info.version})`;
    }
  }
};

export default {
  VirtualFile,
  VirtualFileSystem,
  VirtualFileSystemTools
};
