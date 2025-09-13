/**
 * Write File Tool Implementation
 * Based on deepagents virtual filesystem
 */

export async function execute(params, context) {
  const { filename, content, metadata = {} } = params;
  
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename is required and must be a string');
  }
  
  if (content === undefined || content === null) {
    throw new Error('Content is required');
  }

  // Get virtual filesystem from context
  const virtualFs = context.virtualFs;
  if (!virtualFs) {
    throw new Error('Virtual filesystem not available');
  }

  try {
    // Write file to virtual filesystem
    const fileInfo = virtualFs.writeFile(filename, String(content), { metadata });
    
    // Update session files context
    if (context.session && context.session.files) {
      try {
        context.session.files[filename] = {
          content: String(content),
          size: fileInfo.size,
          type: fileInfo.type,
          createdAt: fileInfo.createdAt,
          metadata
        };
      } catch (error) {
        // Handle read-only session files gracefully
        console.warn('Could not update session files context:', error.message);
      }
    }

    return `File "${filename}" written successfully (${fileInfo.size} bytes)`;
    
  } catch (error) {
    throw new Error(`Failed to write file "${filename}": ${error.message}`);
  }
}
