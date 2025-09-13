/**
 * Read File Tool Implementation
 * Based on deepagents virtual filesystem
 */

export async function execute(params, context) {
  const { filename } = params;
  
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename is required and must be a string');
  }

  // Get virtual filesystem from context
  const virtualFs = context.virtualFs;
  if (!virtualFs) {
    throw new Error('Virtual filesystem not available');
  }

  try {
    // Check if file exists
    if (!virtualFs.exists(filename)) {
      return `Error: File '${filename}' does not exist`;
    }

    // Read file content
    const content = virtualFs.readFile(filename);
    
    return content;
    
  } catch (error) {
    return `Error reading file "${filename}": ${error.message}`;
  }
}
