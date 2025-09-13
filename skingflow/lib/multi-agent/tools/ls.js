/**
 * List Files Tool Implementation
 * Based on deepagents virtual filesystem
 */

export async function execute(params, context) {
  const { pattern, show_details = false } = params;
  
  // Get virtual filesystem from context
  const virtualFs = context.virtualFs;
  if (!virtualFs) {
    throw new Error('Virtual filesystem not available');
  }

  try {
    // Get all files
    const files = virtualFs.listFiles();
    let fileList = Object.values(files);

    // Apply pattern filter if provided
    if (pattern) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
      fileList = fileList.filter(file => regex.test(file.name));
    }

    if (fileList.length === 0) {
      return pattern ? `No files found matching pattern: ${pattern}` : 'No files in virtual filesystem';
    }

    // Format output
    if (show_details) {
      return fileList.map(file => 
        `${file.name} (${file.size} bytes, ${file.type}, ${file.updatedAt.toISOString()})`
      ).join('\n');
    } else {
      return fileList.map(file => file.name).join('\n');
    }
    
  } catch (error) {
    return `Error listing files: ${error.message}`;
  }
}
