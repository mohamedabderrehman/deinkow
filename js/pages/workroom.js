/**
 * Workroom Page - Redesigned Layout
 * Left: Project info + status + progress
 * Right: Chat area
 * Bottom: Project files
 */
export default async function loadWorkroom() {
  // Get ticket ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  
  if (!ticketId) {
    return `
      <div class="empty-state">
        <h2 class="empty-state-title">معرف المشروع مطلوب</h2>
        <p class="empty-state-description">يرجى تحديد معرف المشروع في الرابط.</p>
        <button class="btn btn-primary" onclick="Router.navigate('/projects')">العودة للمشاريع</button>
      </div>
    `;
  }

  // Show loading skeleton
  const skeleton = `
    <div class="workroom-container">
      <div class="workroom-sidebar">
        <div class="skeleton skeleton-card">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text" style="width: 80%;"></div>
        </div>
      </div>
      <div class="workroom-main">
        <div class="skeleton skeleton-card" style="height: 100%;"></div>
      </div>
      <div class="workroom-files">
        <div class="skeleton skeleton-card"></div>
      </div>
    </div>
  `;

  try {
    // Load ticket data
    const ticketResponse = await API.support.getTicket(ticketId);
    
    if (!ticketResponse.success) {
      throw new Error('فشل تحميل بيانات المشروع');
    }

    const ticket = ticketResponse.data.ticket;
    const replies = ticketResponse.data.replies || [];
    
    // Calculate progress based on status
    const progressMap = {
      'open': 10,
      'agreed': 25,
      'in_progress': 60,
      'delivery': 85,
      'resolved': 100,
      'closed': 100
    };
    const progress = progressMap[ticket.status] || 10;

    // Get status text in Arabic
    const statusText = {
      'open': 'مفتوح',
      'agreed': 'متفق عليه',
      'in_progress': 'قيد التنفيذ',
      'delivery': 'تسليم',
      'resolved': 'مكتمل',
      'closed': 'مغلق'
    }[ticket.status] || ticket.status;

    // Extract project details from message
    const projectDetails = parseProjectMessage(ticket.message);

    // Build HTML
    return `
      <div class="workroom-container">
        <!-- Left Sidebar: Project Info -->
        <div class="workroom-sidebar">
          <div class="project-info-card">
            <div class="project-header">
              <h2 class="project-title">${escapeHtml(ticket.subject)}</h2>
              <div class="project-id">طلب #${ticket.id}</div>
            </div>
            
            <div class="project-status-section">
              <div class="status-label">حالة المشروع</div>
              <div class="status-badge status-${ticket.status.replace('_', '-')}">${statusText}</div>
              
              <div style="margin-top: var(--spacing-lg);">
                <div class="status-label">التقدم</div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
                <div class="progress-text">${progress}%</div>
              </div>
            </div>
            
            <div class="project-meta">
              ${projectDetails.type ? `
                <div class="meta-item">
                  <span class="meta-label">النوع:</span>
                  <span class="meta-value">${escapeHtml(projectDetails.type)}</span>
                </div>
              ` : ''}
              
              ${projectDetails.budget ? `
                <div class="meta-item">
                  <span class="meta-label">الميزانية:</span>
                  <span class="meta-value">${escapeHtml(projectDetails.budget)}</span>
                </div>
              ` : ''}
              
              ${projectDetails.telegram ? `
                <div class="meta-item">
                  <span class="meta-label">Telegram:</span>
                  <span class="meta-value">${escapeHtml(projectDetails.telegram)}</span>
                </div>
              ` : ''}
              
              <div class="meta-item">
                <span class="meta-label">تاريخ الإنشاء:</span>
                <span class="meta-value">${formatDate(ticket.created_at)}</span>
              </div>
              
              <div class="meta-item">
                <span class="meta-label">آخر تحديث:</span>
                <span class="meta-value">${formatDate(ticket.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Right Main: Chat Area -->
        <div class="workroom-main">
          <div class="chat-container">
            <div class="chat-header">
              <h3 class="chat-title">المحادثة</h3>
              <a href="https://t.me/Deinkow" target="_blank" class="btn btn-sm btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-left: 4px;">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0077 10.4582 14.0077 10.4246 14 10.393C13.97 10.29 13.89 10.23 13.8 10.18C13.68 10.12 13.55 10.15 13.44 10.18C13.28 10.24 11.95 11.16 9.4 12.61C8.89 12.88 8.42 13.02 8 13.02C7.54 13.02 6.63 12.8 5.95 12.61C5.25 12.41 4.68 12.3 4.73 11.94C4.75 11.79 5.01 11.63 5.5 11.45C8.11 10.44 10.25 9.65 11.93 9.08C14.49 8.2 15.25 7.95 15.54 7.95C15.63 7.95 15.83 7.98 15.96 8.09C16.07 8.18 16.1 8.3 16.11 8.38C16.12 8.46 16.14 8.63 16.13 8.79L16.64 8.8Z" fill="currentColor"/>
                </svg>
                Telegram
              </a>
            </div>
            
            <div class="chat-messages" id="chatMessages">
              ${renderInitialMessage(ticket)}
              ${replies.map(reply => renderMessage(reply)).join('')}
            </div>
            
            <div class="chat-input-area">
              <form class="chat-input-form" id="chatForm" onsubmit="return sendMessage(event, ${ticketId})">
                <div class="chat-input-wrapper">
                  <textarea 
                    class="chat-input" 
                    id="chatInput" 
                    placeholder="اكتب رسالتك هنا..."
                    rows="2"
                    required
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M18 2L9 11M18 2L12 18L9 11M18 2L2 9L9 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Bottom: Files Section -->
        <div class="workroom-files">
          <div class="files-section">
            <div class="files-header">
              <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-extrabold); margin: 0;">ملفات المشروع</h3>
              <button class="btn btn-sm btn-primary" onclick="uploadFile(${ticketId})">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style="margin-left: 4px;">
                  <path d="M10 3V17M3 10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                رفع ملف
              </button>
            </div>
            <div class="files-list" id="filesList">
              ${await renderFiles(ticketId)}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Workroom load error:', error);
    return `
      <div class="empty-state">
        <h2 class="empty-state-title">خطأ في التحميل</h2>
        <p class="empty-state-description">${error.message || 'حدث خطأ أثناء تحميل المشروع'}</p>
        <button class="btn btn-primary" onclick="Router.navigate('/projects')">العودة للمشاريع</button>
      </div>
    `;
  }
}

function renderInitialMessage(ticket) {
  return `
    <div class="chat-message">
      <div class="avatar">${ticket.username ? ticket.username.charAt(0).toUpperCase() : 'U'}</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="message-text">${escapeHtml(ticket.message)}</div>
          <div class="message-time">${formatTime(ticket.created_at)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderMessage(reply) {
  const isAdmin = reply.is_admin;
  return `
    <div class="chat-message ${isAdmin ? 'admin' : ''}">
      <div class="avatar">${isAdmin ? 'A' : (reply.username ? reply.username.charAt(0).toUpperCase() : 'U')}</div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="message-text">${escapeHtml(reply.message)}</div>
          <div class="message-time">${formatTime(reply.created_at)}</div>
        </div>
      </div>
    </div>
  `;
}

async function renderFiles(ticketId) {
  try {
    const response = await API.files.getFiles(ticketId);
    if (response.success && response.data.files && response.data.files.length > 0) {
      return response.data.files.map(file => `
        <a href="${file.url}" target="_blank" class="file-item">
          <div class="file-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="file-name">${escapeHtml(file.name || 'ملف')}</div>
        </a>
      `).join('');
    }
    return '<p style="text-align: center; color: var(--text-gray); padding: var(--spacing-lg);">لا توجد ملفات بعد</p>';
  } catch (error) {
    return '<p style="text-align: center; color: var(--text-gray); padding: var(--spacing-lg);">لا توجد ملفات</p>';
  }
}

function parseProjectMessage(message) {
  const details = {};
  
  // Extract type
  const typeMatch = message.match(/نوع المشروع[:\s]+([^\n]+)/i);
  if (typeMatch) details.type = typeMatch[1].trim();
  
  // Extract budget
  const budgetMatch = message.match(/الميزانية[:\s]+([^\n]+)/i);
  if (budgetMatch) details.budget = budgetMatch[1].trim();
  
  // Extract Telegram
  const telegramMatch = message.match(/Telegram[:\s]+([^\n]+)/i);
  if (telegramMatch) details.telegram = telegramMatch[1].trim();
  
  return details;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-DZ', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-DZ', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Global functions for inline event handlers
window.sendMessage = async function(event, ticketId) {
  event.preventDefault();
  
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return false;
  
  try {
    const response = await API.support.replyToTicket(ticketId, message);
    
    if (response.success) {
      input.value = '';
      
      // Reload workroom to show new message
      if (window.Router) {
        window.Router.navigate(`/workroom?id=${ticketId}`);
      } else {
        location.reload();
      }
      
      Toast.success('تم إرسال الرسالة بنجاح');
    } else {
      Toast.error(response.message || 'فشل إرسال الرسالة');
    }
  } catch (error) {
    console.error('Send message error:', error);
    Toast.error('حدث خطأ أثناء إرسال الرسالة');
  }
  
  return false;
};

window.uploadFile = async function(ticketId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  
  input.onchange = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        const response = await API.files.uploadFile(ticketId, file);
        if (response.success) {
          Toast.success(`تم رفع ${file.name} بنجاح`);
        } else {
          Toast.error(`فشل رفع ${file.name}`);
        }
      } catch (error) {
        Toast.error(`خطأ في رفع ${file.name}`);
      }
    }
    
    // Reload files
    const filesList = document.getElementById('filesList');
    if (filesList) {
      filesList.innerHTML = await renderFiles(ticketId);
    }
  };
  
  input.click();
};
