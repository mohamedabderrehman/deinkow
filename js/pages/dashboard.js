/**
 * Dashboard Page
 * Example page component
 */
export default async function loadDashboard() {
  const token = API?.getAuthToken?.();
  
  if (!token) {
    return `
      <div class="empty-state">
        <h2 class="empty-state-title">يرجى تسجيل الدخول</h2>
        <p class="empty-state-description">يجب تسجيل الدخول للوصول إلى لوحة التحكم</p>
        <button class="btn btn-primary" onclick="Router.navigate('/login')">تسجيل الدخول</button>
      </div>
    `;
  }

  // Show loading skeleton
  const skeleton = `
    <div class="dashboard-stats">
      ${Array(4).fill(0).map(() => `
        <div class="stat-card">
          <div class="skeleton-title" style="width: 60%;"></div>
          <div class="skeleton-text"></div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    // Load dashboard data
    const ticketsResponse = await API.support.getMyTickets();
    
    if (!ticketsResponse.success) {
      throw new Error('فشل تحميل البيانات');
    }

    const tickets = ticketsResponse.data.tickets || [];
    
    // Calculate stats
    const stats = {
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      completed: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      total: tickets.length
    };

    // Get user info
    let userName = 'مستخدم';
    try {
      const userResponse = await API.auth.getCurrentUser();
      if (userResponse?.success && userResponse?.data?.user) {
        userName = userResponse.data.user.username || userName;
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }

    return `
      <div class="page-container">
        <div style="margin-bottom: var(--spacing-xl);">
          <h1 style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-extrabold); margin-bottom: var(--spacing-sm);">
            مرحباً، ${escapeHtml(userName)}
          </h1>
          <p style="color: var(--text-gray); font-size: var(--font-size-lg);">
            نظرة عامة على مشاريعك
          </p>
        </div>

        <div class="dashboard-stats">
          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="3" width="7" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
            <div class="stat-card-value">${stats.total}</div>
            <div class="stat-card-label">إجمالي المشاريع</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <div class="stat-card-value">${stats.open}</div>
            <div class="stat-card-label">مشاريع مفتوحة</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V6M12 18V22M4 12H8M16 12H20M19.07 19.07L16.24 16.24M19.07 4.93L16.24 7.76M4.93 19.07L7.76 16.24M4.93 4.93L7.76 7.76" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            <div class="stat-card-value">${stats.inProgress}</div>
            <div class="stat-card-label">قيد التنفيذ</div>
          </div>

          <div class="stat-card">
            <div class="stat-card-header">
              <div class="stat-card-icon" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div class="stat-card-value">${stats.completed}</div>
            <div class="stat-card-label">مكتملة</div>
          </div>
        </div>

        <div class="card" style="margin-top: var(--spacing-xl);">
          <div class="card-header">
            <h2 class="card-title">مشاريعي الأخيرة</h2>
            <a href="#" class="btn btn-sm btn-primary" onclick="Router.navigate('/projects'); return false;">
              عرض الكل
            </a>
          </div>
          <div class="card-body">
            ${tickets.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${tickets.slice(0, 5).map(ticket => `
                  <div style="padding: var(--spacing-md); border: 1px solid var(--border-light); border-radius: var(--radius-lg); transition: all var(--transition-fast);" 
                       onmouseover="this.style.borderColor='var(--primary-blue)'; this.style.boxShadow='var(--shadow-md)'"
                       onmouseout="this.style.borderColor='var(--border-light)'; this.style.boxShadow='none'">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
                      <div style="flex: 1;">
                        <h3 style="font-size: var(--font-size-lg); font-weight: var(--font-weight-extrabold); margin-bottom: var(--spacing-xs);">
                          ${escapeHtml(ticket.subject)}
                        </h3>
                        <p style="font-size: var(--font-size-sm); color: var(--text-gray); margin: 0;">
                          #${ticket.id} • ${formatDate(ticket.created_at)}
                        </p>
                      </div>
                      <span class="status-badge status-${ticket.status.replace('_', '-')}">
                        ${getStatusText(ticket.status)}
                      </span>
                    </div>
                    <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-md);">
                      <a href="#" class="btn btn-sm btn-primary" onclick="Router.navigate('/workroom?id=${ticket.id}'); return false;">
                        فتح المشروع
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state" style="padding: var(--spacing-2xl);">
                <p style="color: var(--text-gray); margin-bottom: var(--spacing-lg);">لا توجد مشاريع بعد</p>
                <a href="#" class="btn btn-primary" onclick="Router.navigate('/request-project'); return false;">
                  طلب مشروع جديد
                </a>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Dashboard load error:', error);
    return `
      <div class="empty-state">
        <h2 class="empty-state-title">خطأ في التحميل</h2>
        <p class="empty-state-description">${error.message || 'حدث خطأ أثناء تحميل لوحة التحكم'}</p>
        <button class="btn btn-primary" onclick="location.reload()">إعادة التحميل</button>
      </div>
    `;
  }
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

function getStatusText(status) {
  const statusMap = {
    'open': 'مفتوح',
    'agreed': 'متفق عليه',
    'in_progress': 'قيد التنفيذ',
    'delivery': 'تسليم',
    'resolved': 'مكتمل',
    'closed': 'مغلق'
  };
  return statusMap[status] || status;
}
