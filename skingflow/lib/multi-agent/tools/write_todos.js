/**
 * Write Todos Tool Implementation
 * Based on deepagents TodoWrite tool
 */

export async function execute(params, context) {
  const { todos } = params;
  
  if (!Array.isArray(todos) || todos.length === 0) {
    return "No todos provided";
  }

  // Validate and process todos
  const processedTodos = todos.map(todo => {
    // Generate ID if not provided
    if (!todo.id) {
      todo.id = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Set default values
    todo.status = todo.status || 'pending';
    todo.priority = todo.priority || 'medium';
    todo.created_at = new Date().toISOString();

    return todo;
  });

  // Store todos in context for framework access
  if (context.session) {
    context.session.todos = processedTodos;
  }

  // Generate summary
  const statusCounts = processedTodos.reduce((acc, todo) => {
    acc[todo.status] = (acc[todo.status] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = processedTodos.reduce((acc, todo) => {
    acc[todo.priority] = (acc[todo.priority] || 0) + 1;
    return acc;
  }, {});

  let summary = `Created task list with ${processedTodos.length} items:\n`;
  
  // Add status breakdown
  Object.entries(statusCounts).forEach(([status, count]) => {
    summary += `  - ${count} ${status}\n`;
  });

  // Add priority breakdown
  summary += `Priority breakdown: `;
  const priorityParts = Object.entries(priorityCounts).map(([priority, count]) => 
    `${count} ${priority}`
  );
  summary += priorityParts.join(', ');

  // Add task details
  summary += `\n\nTasks:\n`;
  processedTodos.forEach((todo, index) => {
    summary += `${index + 1}. [${todo.status.toUpperCase()}] ${todo.content}`;
    if (todo.priority !== 'medium') {
      summary += ` (${todo.priority} priority)`;
    }
    if (todo.assigned_agent) {
      summary += ` → ${todo.assigned_agent}`;
    }
    summary += '\n';
  });

  return summary;
}
