/**
 * Edit File Tool Implementation
 * Based on deepagents virtual filesystem
 */

export async function execute(params, context) {
  const { filename, old_string, new_string } = params;
  
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename is required and must be a string');
  }
  
  if (old_string === undefined || old_string === null) {
    throw new Error('old_string is required');
  }
  
  if (new_string === undefined || new_string === null) {
    throw new Error('new_string is required');
  }

  // Get virtual filesystem from context
  const virtualFs = context.virtualFs;
  if (!virtualFs) {
    throw new Error('Virtual filesystem not available');
  }

  try {
    // Check if file exists
    if (!virtualFs.exists(filename)) {
      return `Error: File "${filename}" does not exist`;
    }

    // Edit file
    const fileInfo = virtualFs.editFile(filename, String(old_string), String(new_string));
    
    // Update session files context
    if (context.session && context.session.files && context.session.files[filename]) {
      try {
        const updatedContent = virtualFs.readFile(filename);
        context.session.files[filename].content = updatedContent;
        context.session.files[filename].size = fileInfo.size;
        context.session.files[filename].updatedAt = fileInfo.updatedAt;
      } catch (error) {
        // Handle read-only session files gracefully
        console.warn('Could not update session files context:', error.message);
      }
    }

    return `File "${filename}" edited successfully (version ${fileInfo.version})`;
    
  } catch (error) {
    if (error.message.includes('not found')) {
      return `Error: Text "${old_string}" not found in file "${filename}"`;
    }
    return `Error editing file "${filename}": ${error.message}`;
  }
}
