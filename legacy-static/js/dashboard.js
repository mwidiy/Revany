/**
 * REVANI TUTORING MANAGEMENT SYSTEM - DASHBOARD JAVASCRIPT
 * Interaktivitas, visualisasi chart, presensi cepat, filter, dan dark/light mode
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inisialisasi Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // State Management
  const state = {
    theme: localStorage.getItem('revani-theme') || 'light',
    scheduleFilter: 'all',
    chartPeriod: 'week',
    trendChartInstance: null,
    jenjangChartInstance: null,
    schedules: [...revaniData.jadwalHariIni],
    activities: [...revaniData.aktivitasTerbaru]
  };

  // 1. Inisialisasi Tema
  applyTheme(state.theme);

  // 2. Realtime Clock & Greeting
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // 3. Render Komponen Dashboard
  renderKpiMetrics();
  renderSchedules();
  renderLeaderboard();
  renderActivities();
  populatePresensiSelect();

  // 4. Inisialisasi Charts
  initTrendChart();
  initJenjangChart();

  // 5. Setup Event Listeners
  setupEventListeners();
  setupCommandPalette();

  /* ==========================================================================
     Fungsi Tema (Dark / Light)
     ========================================================================== */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('revani-theme', theme);

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      if (window.lucide) lucide.createIcons();
    }

    // Update Chart themes jika chart sudah aktif
    updateChartTheme();
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    showToast(`Mode tampilan beralih ke ${nextTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'}`, 'success');
  }

  /* ==========================================================================
     Realtime Clock & Dinamika Greeting
     ========================================================================== */
  function updateDateTime() {
    const now = new Date();
    
    // Greeting berdasarkan jam
    const hours = now.getHours();
    let greeting = 'Selamat Datang';
    if (hours >= 4 && hours < 11) greeting = 'Selamat Pagi';
    else if (hours >= 11 && hours < 15) greeting = 'Selamat Siang';
    else if (hours >= 15 && hours < 18) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';

    const greetingElem = document.getElementById('greeting-text');
    if (greetingElem) {
      greetingElem.textContent = `${greeting}, ${revaniData.admin.name}! 👋`;
    }

    // Format Tanggal Indonesia
    const optionsDate = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const dateStr = now.toLocaleDateString('id-ID', optionsDate);
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';

    const datetimeElem = document.getElementById('current-datetime');
    if (datetimeElem) {
      datetimeElem.textContent = `${dateStr} • ${timeStr}`;
    }
  }

  /* ==========================================================================
     Render KPI Metrics & Animasi Counter
     ========================================================================== */
  function animateValue(elem, start, end, duration, prefix = '', suffix = '') {
    if (!elem) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start, end) + start);
      elem.textContent = `${prefix}${current}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        elem.textContent = `${prefix}${end}${suffix}`;
      }
    };
    window.requestAnimationFrame(step);
  }

  function renderKpiMetrics() {
    const kpi = revaniData.kpi;
    animateValue(document.getElementById('kpi-siswa-val'), 0, kpi.siswaAktif.total, 800);
    animateValue(document.getElementById('kpi-tentor-val'), 0, kpi.tentorAktif.total, 800);
    
    document.getElementById('kpi-presensi-val').textContent = `${kpi.sesiHariIni.kehadiranPersen}%`;
    
    // Format Rupiah Miliar/Juta ringkas
    const omzetJuta = (kpi.keuangan.estimasiOmzet / 1000000).toFixed(1);
    document.getElementById('kpi-omzet-val').textContent = `Rp ${omzetJuta}Jt`;

    document.getElementById('badge-siswa-count').textContent = kpi.siswaAktif.total;
    document.getElementById('badge-tentor-count').textContent = kpi.tentorAktif.total;
    document.getElementById('badge-jadwal-count').textContent = state.schedules.length;
  }

  /* ==========================================================================
     Render Jadwal Hari Ini & Filter
     ========================================================================== */
  function renderSchedules() {
    const container = document.getElementById('schedule-list-container');
    if (!container) return;

    let filtered = state.schedules;
    if (state.scheduleFilter === 'ongoing') {
      filtered = state.schedules.filter(s => s.status === 'ongoing');
    } else if (state.scheduleFilter === 'upcoming') {
      filtered = state.schedules.filter(s => s.status === 'upcoming');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 32px 16px; color: var(--text-muted);">
          <i data-lucide="calendar-x" style="width: 32px; height: 32px; margin-bottom: 8px; opacity: 0.6;"></i>
          <p style="font-size: 13px;">Tidak ada sesi les untuk kategori ini saat ini.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(item => {
      let badgeClass = 'badge-upcoming';
      let statusLabel = 'Mendatang';
      let pulseHtml = '';

      if (item.status === 'ongoing') {
        badgeClass = 'badge-ongoing';
        statusLabel = 'Sedang Berlangsung';
        pulseHtml = '<span class="pulse-dot" style="width: 6px; height: 6px;"></span>';
      } else if (item.status === 'completed') {
        badgeClass = 'badge-completed';
        statusLabel = 'Selesai';
      }

      return `
        <div class="schedule-card status-${item.status}">
          <div class="schedule-top">
            <div class="schedule-time">
              <i data-lucide="clock" style="width: 14px; height: 14px; color: var(--text-muted);"></i>
              <span>${item.waktu}</span>
            </div>
            <span class="status-badge ${badgeClass}">
              ${pulseHtml}
              ${statusLabel}
            </span>
          </div>

          <div>
            <div class="schedule-subject">${item.mapel}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
              ${item.jenjang} • <span style="color: var(--primary); font-weight: 600;">${item.metode}</span>
            </div>
          </div>

          <div class="schedule-meta">
            <div class="participant-pair">
              <img src="${item.siswa.avatar}" alt="${item.siswa.nama}" class="mini-avatar" title="Siswa: ${item.siswa.nama}">
              <span style="font-weight: 700; color: var(--text-main); font-size: 13px;">${item.siswa.nama}</span>
              <span style="color: var(--text-muted); font-size: 11px;">(Tentor: ${item.tentor.nama.split(',')[0]})</span>
            </div>

            <button class="quick-action-link btn-quick-checkin" data-id="${item.id}" data-nama="${item.siswa.nama}">
              <span>Presensi</span>
              <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();

    // Event listener untuk tombol presensi per kartu
    container.querySelectorAll('.btn-quick-checkin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openPresensiModal(id);
      });
    });
  }

  /* ==========================================================================
     Render Leaderboard Top Tentor
     ========================================================================== */
  function renderLeaderboard() {
    const container = document.getElementById('tentor-leaderboard-container');
    if (!container) return;

    container.innerHTML = revaniData.topTentor.map((tentor, idx) => {
      const rank = idx + 1;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';

      return `
        <div class="tentor-row">
          <div class="rank-badge ${rankClass}">#${rank}</div>
          <img src="${tentor.avatar}" alt="${tentor.nama}" class="tentor-avatar">
          <div class="tentor-details">
            <div class="tentor-name">${tentor.nama}</div>
            <div class="tentor-mapel">${tentor.mapel} • ${tentor.totalSesi} Sesi</div>
          </div>
          <div class="tentor-stats">
            <div class="tentor-hours">${tentor.jamMengajar} Jam</div>
            <div class="tentor-rating">★ ${tentor.rating}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     Render Log Aktivitas Terkini
     ========================================================================== */
  function renderActivities() {
    const container = document.getElementById('activity-feed-container');
    if (!container) return;

    container.innerHTML = state.activities.map(act => {
      let iconColorClass = 'kpi-icon-indigo';
      if (act.color === 'emerald') iconColorClass = 'kpi-icon-emerald';
      if (act.color === 'amber') iconColorClass = 'kpi-icon-amber';
      if (act.color === 'blue') iconColorClass = 'kpi-icon-blue';

      return `
        <div class="activity-item">
          <div class="activity-icon-badge ${iconColorClass}">
            <i data-lucide="${act.icon}" style="width: 16px; height: 16px;"></i>
          </div>
          <div class="activity-info">
            <h4>${act.judul}</h4>
            <p>${act.deskripsi}</p>
            <div class="activity-time">${act.waktu}</div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  }

  /* ==========================================================================
     Inisialisasi & Update Chart.js
     ========================================================================== */
  function getChartThemeColors() {
    const isDark = state.theme === 'dark';
    return {
      text: isDark ? '#94A3B8' : '#64748B',
      grid: isDark ? '#1E293B' : '#F1F5F9',
      tooltipBg: isDark ? '#161F36' : '#0F172A',
      tooltipText: '#FFFFFF'
    };
  }

  function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const themeColors = getChartThemeColors();
    const chartData = revaniData.chartData.trenPertemuan;

    state.trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Sesi Selesai',
            data: chartData.datasets[0].data,
            borderColor: '#6366F1',
            backgroundColor: (context) => {
              const bg = context.chart.ctx.createLinearGradient(0, 0, 0, 300);
              bg.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
              bg.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
              return bg;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366F1',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 7
          },
          {
            label: 'Target Sesi',
            data: chartData.datasets[1].data,
            borderColor: '#10B981',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: themeColors.text,
              usePointStyle: true,
              font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 }
            }
          },
          tooltip: {
            backgroundColor: themeColors.tooltipBg,
            titleColor: themeColors.tooltipText,
            bodyColor: themeColors.tooltipText,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 700 },
            bodyFont: { family: 'Plus Jakarta Sans', size: 12 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: themeColors.text,
              font: { family: 'Plus Jakarta Sans', size: 11 }
            }
          },
          y: {
            grid: { color: themeColors.grid },
            ticks: {
              color: themeColors.text,
              font: { family: 'Plus Jakarta Sans', size: 11 },
              stepSize: 5
            }
          }
        }
      }
    });
  }

  function initJenjangChart() {
    const ctx = document.getElementById('jenjangChart');
    if (!ctx) return;

    const data = revaniData.chartData.distribusiJenjang;

    state.jenjangChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: data.colors,
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (item) => ` ${item.label}: ${item.raw}% Siswa`
            }
          }
        }
      }
    });
  }

  function updateChartTheme() {
    const themeColors = getChartThemeColors();
    if (state.trendChartInstance) {
      state.trendChartInstance.options.scales.x.ticks.color = themeColors.text;
      state.trendChartInstance.options.scales.y.ticks.color = themeColors.text;
      state.trendChartInstance.options.scales.y.grid.color = themeColors.grid;
      state.trendChartInstance.options.plugins.legend.labels.color = themeColors.text;
      state.trendChartInstance.update();
    }
  }

  /* ==========================================================================
     Event Listeners & Filter Handling
     ========================================================================== */
  function setupEventListeners() {
    // Theme Switcher Button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    }

    // Schedule Filter Tabs
    const scheduleFilterGroup = document.getElementById('schedule-filter-group');
    if (scheduleFilterGroup) {
      scheduleFilterGroup.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          scheduleFilterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.scheduleFilter = btn.getAttribute('data-filter');
          renderSchedules();
        });
      });
    }

    // Chart Period Filter Tabs
    const chartFilterGroup = document.getElementById('chart-filter-group');
    if (chartFilterGroup) {
      chartFilterGroup.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          chartFilterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const period = btn.getAttribute('data-period');
          updateChartDataPeriod(period);
        });
      });
    }

    // Mobile Drawer Toggle
    const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggleBtn && sidebar) {
      mobileToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
      });

      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && e.target !== mobileToggleBtn) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }

    // Modal Triggers: Quick Presensi, Jadwal, Siswa
    document.getElementById('btn-quick-presensi')?.addEventListener('click', () => openModal('modal-presensi'));
    document.getElementById('btn-quick-jadwal')?.addEventListener('click', () => openModal('modal-jadwal'));
    document.getElementById('btn-quick-siswa')?.addEventListener('click', () => openModal('modal-siswa'));

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close');
        closeModal(modalId);
      });
    });

    // Close Modal on Backdrop Click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
      });
    });

    // Form Submissions
    setupFormPresensi();
    setupFormJadwal();
    setupFormSiswa();

    // Refresh Activity Button
    document.getElementById('refresh-activity-btn')?.addEventListener('click', () => {
      renderActivities();
      showToast('Log aktivitas telah diperbarui', 'success');
    });

    // Notification Button
    document.getElementById('notif-btn')?.addEventListener('click', () => {
      showToast('Semua notifikasi hari ini telah dibaca', 'success');
    });

    // Nav Item Click Simulation
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  function updateChartDataPeriod(period) {
    if (!state.trendChartInstance) return;

    if (period === 'week') {
      state.trendChartInstance.data.labels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
      state.trendChartInstance.data.datasets[0].data = [14, 18, 16, 21, 25, 28, 20];
      state.trendChartInstance.data.datasets[1].data = [12, 15, 15, 18, 20, 22, 18];
    } else if (period === 'month') {
      state.trendChartInstance.data.labels = ["Mgg 1", "Mgg 2", "Mgg 3", "Mgg 4"];
      state.trendChartInstance.data.datasets[0].data = [84, 98, 112, 128];
      state.trendChartInstance.data.datasets[1].data = [80, 90, 100, 110];
    } else if (period === 'semester') {
      state.trendChartInstance.data.labels = ["Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      state.trendChartInstance.data.datasets[0].data = [280, 310, 350, 420, 460, 490];
      state.trendChartInstance.data.datasets[1].data = [250, 300, 320, 380, 400, 450];
    }

    state.trendChartInstance.update();
    showToast(`Data grafik diperbarui untuk periode: ${period.toUpperCase()}`, 'success');
  }

  /* ==========================================================================
     Modal Handling
     ========================================================================== */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function populatePresensiSelect() {
    const select = document.getElementById('presensi-select-sesi');
    if (!select) return;

    select.innerHTML = '<option value="">-- Pilih Sesi Pertemuan Hari Ini --</option>' +
      state.schedules.map(s => `
        <option value="${s.id}">${s.siswa.nama} — ${s.mapel} (${s.waktu})</option>
      `).join('');
  }

  function openPresensiModal(scheduleId) {
    populatePresensiSelect();
    const select = document.getElementById('presensi-select-sesi');
    if (select && scheduleId) {
      select.value = scheduleId;
    }
    openModal('modal-presensi');
  }

  function setupFormPresensi() {
    const form = document.getElementById('form-presensi');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const sesiId = document.getElementById('presensi-select-sesi').value;
      const status = form.querySelector('input[name="presensiStatus"]:checked')?.value || 'Hadir';
      const catatan = document.getElementById('presensi-catatan').value;

      const schedule = state.schedules.find(s => s.id === sesiId);
      const studentName = schedule ? schedule.siswa.nama : 'Siswa';

      // Update state schedule jika ada
      if (schedule) {
        schedule.presensiStatus = status;
        schedule.status = 'completed';
      }

      // Tambahkan ke log aktivitas
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        waktu: 'Baru saja',
        tipe: 'presensi',
        judul: `Presensi Terverifikasi (${status})`,
        deskripsi: `Admin mencatat presensi untuk ${studentName} (${schedule?.mapel || 'Sesi Les'})`,
        icon: 'check-circle',
        color: status === 'Hadir' ? 'emerald' : status === 'Alpha' ? 'rose' : 'amber'
      });

      closeModal('modal-presensi');
      form.reset();
      renderSchedules();
      renderActivities();
      showToast(`Presensi berhasil dicatat untuk ${studentName} (${status})! 🎉`, 'success');
    });
  }

  function setupFormJadwal() {
    const form = document.getElementById('form-jadwal');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const namaSiswa = document.getElementById('jadwal-nama-siswa').value;
      const tentor = document.getElementById('jadwal-tentor').value;
      const mapel = document.getElementById('jadwal-mapel').value;
      const waktu = document.getElementById('jadwal-waktu').value;
      const metode = document.getElementById('jadwal-metode').value;

      const newSchedule = {
        id: `SCH-${String(state.schedules.length + 1).padStart(3, '0')}`,
        waktu: waktu,
        mapel: mapel,
        jenjang: "Siswa Terdaftar",
        siswa: {
          nama: namaSiswa,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          kelas: "Kelas Reguler"
        },
        tentor: {
          nama: tentor,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
        },
        metode: metode,
        status: "upcoming",
        presensiStatus: "Belum Dimulai",
        ruangan: metode.includes('Online') ? 'Online Room' : 'Rumah Siswa'
      };

      state.schedules.unshift(newSchedule);

      // Tambahkan log
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        waktu: 'Baru saja',
        tipe: 'jadwal',
        judul: 'Jadwal Baru Ditambahkan',
        deskripsi: `Sesi ${mapel} dijadwalkan untuk ${namaSiswa} bersama ${tentor.split(',')[0]}`,
        icon: 'calendar',
        color: 'indigo'
      });

      closeModal('modal-jadwal');
      form.reset();
      renderSchedules();
      renderActivities();
      renderKpiMetrics();
      populatePresensiSelect();
      showToast(`Jadwal les baru untuk ${namaSiswa} berhasil dibuat! 📅`, 'success');
    });
  }

  function setupFormSiswa() {
    const form = document.getElementById('form-siswa');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = document.getElementById('siswa-nama').value;
      const jenjang = document.getElementById('siswa-jenjang').value;
      const paket = document.getElementById('siswa-paket').value;

      // Update KPI
      revaniData.kpi.siswaAktif.total += 1;

      // Log aktivitas
      state.activities.unshift({
        id: `ACT-${Date.now()}`,
        waktu: 'Baru saja',
        tipe: 'siswa',
        judul: 'Pendaftaran Siswa Baru',
        deskripsi: `${nama} (${jenjang}) terdaftar dalam ${paket}`,
        icon: 'user-plus',
        color: 'blue'
      });

      closeModal('modal-siswa');
      form.reset();
      renderKpiMetrics();
      renderActivities();
      showToast(`Siswa baru ${nama} berhasil didaftarkan! 🎓`, 'success');
    });
  }

  /* ==========================================================================
     Command Palette (Ctrl + K Search)
     ========================================================================== */
  function setupCommandPalette() {
    const searchTrigger = document.getElementById('search-trigger-btn');
    const searchModal = document.getElementById('modal-search');
    const searchInput = document.getElementById('command-search-input');
    const searchResults = document.getElementById('command-search-results');

    if (!searchTrigger || !searchModal || !searchInput || !searchResults) return;

    searchTrigger.addEventListener('click', () => {
      openModal('modal-search');
      searchInput.focus();
      renderSearchResults('');
    });

    // Keyboard shortcut Ctrl + K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openModal('modal-search');
        searchInput.focus();
        renderSearchResults('');
      } else if (e.key === 'Escape') {
        closeModal('modal-search');
      }
    });

    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value.toLowerCase());
    });

    function renderSearchResults(query) {
      const items = [];

      // Cari di Siswa & Jadwal
      state.schedules.forEach(s => {
        if (!query || s.siswa.nama.toLowerCase().includes(query) || s.mapel.toLowerCase().includes(query)) {
          items.push({
            type: 'Siswa / Sesi Les',
            title: s.siswa.nama,
            subtitle: `${s.mapel} • ${s.waktu}`,
            icon: 'user',
            action: () => {
              closeModal('modal-search');
              openPresensiModal(s.id);
            }
          });
        }
      });

      // Cari di Tentor
      revaniData.topTentor.forEach(t => {
        if (!query || t.nama.toLowerCase().includes(query) || t.mapel.toLowerCase().includes(query)) {
          items.push({
            type: 'Tentor',
            title: t.nama,
            subtitle: `${t.mapel} (Rating: ${t.rating})`,
            icon: 'graduation-cap',
            action: () => {
              closeModal('modal-search');
              showToast(`Profil Tentor: ${t.nama}`, 'success');
            }
          });
        }
      });

      if (items.length === 0) {
        searchResults.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
            Tidak ditemukan data yang cocok dengan "${query}"
          </div>
        `;
        return;
      }

      searchResults.innerHTML = items.map((item, idx) => `
        <div class="search-result-item" data-idx="${idx}" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius-md); cursor: pointer; transition: background 0.2s;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="kpi-icon-wrap kpi-icon-indigo" style="width: 32px; height: 32px;">
              <i data-lucide="${item.icon}" style="width: 15px; height: 15px;"></i>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px; color: var(--text-main);">${item.title}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${item.subtitle}</div>
            </div>
          </div>
          <span style="font-size: 11px; background: var(--bg-surface-secondary); padding: 2px 8px; border-radius: 4px; color: var(--text-muted); font-weight: 600;">${item.type}</span>
        </div>
      `).join('');

      if (window.lucide) lucide.createIcons();

      searchResults.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('mouseenter', () => el.style.background = 'var(--bg-surface-secondary)');
        el.addEventListener('mouseleave', () => el.style.background = 'transparent');
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-idx'));
          items[idx].action();
        });
      });
    }
  }

  /* ==========================================================================
     Toast Notification System
     ========================================================================== */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle-2' : 'alert-circle'}" style="color: var(--${type}); width: 18px; height: 18px; flex-shrink: 0;"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
