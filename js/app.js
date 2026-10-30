// ==========================================
// 🚀 메인 애플리케이션 로직 (Clean Light Studio)
// ==========================================

let currentCategory = "all";
let currentSearchQuery = "";
let currentTag = "";

function safeCreateIcons() {
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    renderSiteConfig();
    renderCategoryTabs();
    renderItems();
    setupEventListeners();
    setupScrollEffects();
    safeCreateIcons();
  } catch (err) {
    console.error("Initialization error:", err);
  }
});

// 1. 헤더 스크롤 효과
function setupScrollEffects() {
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header?.classList.add("bg-white/95", "shadow-sm", "border-slate-200");
    } else {
      header?.classList.remove("shadow-sm");
    }
  });
}

// 2. 기본 사이트 정보 및 프로필 렌더링
function renderSiteConfig() {
  const config = window.siteConfig;
  if (!config) return;

  document.title = config.site.title || "HoHo earth";
  
  const brandTitle = document.getElementById("brand-title");
  if (brandTitle) brandTitle.innerText = config.site.title;

  const heroBadge = document.getElementById("hero-badge");
  if (heroBadge) heroBadge.innerText = config.site.badge;

  const heroTitle = document.getElementById("hero-title");
  if (heroTitle) heroTitle.innerText = config.site.subtitle;

  const heroDesc = document.getElementById("hero-desc");
  if (heroDesc) heroDesc.innerText = config.site.description;

  const authorName = document.getElementById("author-name");
  if (authorName) authorName.innerText = config.author.name;

  const authorRole = document.getElementById("author-role");
  if (authorRole) authorRole.innerText = config.author.role;

  const authorBio = document.getElementById("author-bio");
  if (authorBio) authorBio.innerText = config.author.bio;

  const authorAvatar = document.getElementById("author-avatar");
  if (authorAvatar && config.author.avatar) authorAvatar.src = config.author.avatar;

  // 통계 계산
  const items = window.archiveItems || [];
  const statClasses = items.filter(i => i.category === "class").length;
  const statProjects = items.filter(i => i.category === "project").length;
  const statTools = items.filter(i => i.category === "tools").length;
  const statTotal = items.length;

  const elClasses = document.getElementById("stat-classes");
  if (elClasses) elClasses.innerText = `${statClasses}`;
  const elProjects = document.getElementById("stat-projects");
  if (elProjects) elProjects.innerText = `${statProjects}`;
  const elTools = document.getElementById("stat-tools");
  if (elTools) elTools.innerText = `${statTools}`;
  const elTotal = document.getElementById("stat-total");
  if (elTotal) elTotal.innerText = `${statTotal}`;

  // 소셜 링크
  const socialLinksEl = document.getElementById("social-links");
  if (socialLinksEl) {
    let linksHtml = "";
    if (config.author.email) {
      linksHtml += `<a href="mailto:${config.author.email}" title="Email" class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-black hover:border-slate-400 transition shadow-sm"><i data-lucide="mail" class="w-4 h-4"></i></a>`;
    }
    if (config.author.github) {
      linksHtml += `<a href="${config.author.github}" target="_blank" rel="noopener" title="GitHub" class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-black hover:border-slate-400 transition shadow-sm"><i data-lucide="github" class="w-4 h-4"></i></a>`;
    }
    if (config.author.blog) {
      linksHtml += `<a href="${config.author.blog}" target="_blank" rel="noopener" title="Blog" class="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-black hover:border-slate-400 transition shadow-sm"><i data-lucide="rss" class="w-4 h-4"></i></a>`;
    }
    socialLinksEl.innerHTML = linksHtml;
  }
}

// 3. 카테고리 탭 렌더링
function renderCategoryTabs() {
  const tabsContainer = document.getElementById("category-tabs");
  if (!tabsContainer || !window.siteConfig) return;

  const categories = window.siteConfig.categories;
  tabsContainer.innerHTML = categories.map(cat => {
    const isActive = cat.id === currentCategory;
    return `
      <button 
        onclick="setCategory('${cat.id}')"
        class="category-btn px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-2 border ${
          isActive 
            ? 'bg-black text-white border-black shadow-md shadow-black/10' 
            : 'bg-white text-slate-600 border-slate-200 hover:text-black hover:border-slate-300'
        }"
        data-cat="${cat.id}"
      >
        <i data-lucide="${cat.icon}" class="w-3.5 h-3.5"></i>
        <span>${cat.name}</span>
      </button>
    `;
  }).join('');
}

function setCategory(catId) {
  currentCategory = catId;
  currentTag = "";
  renderCategoryTabs();
  renderItems();
  safeCreateIcons();
}

function filterAndScrollTo(catId) {
  setCategory(catId);
  const archiveSec = document.getElementById("archive");
  if (archiveSec) {
    archiveSec.scrollIntoView({ behavior: "smooth" });
  }
}

window.setCategory = setCategory;
window.filterAndScrollTo = filterAndScrollTo;

// 4. 아이템 목록 렌더링 (화이트 카드 갤러리)
function renderItems() {
  const gridContainer = document.getElementById("items-grid");
  const emptyState = document.getElementById("empty-state");
  if (!gridContainer) return;

  const items = window.archiveItems || [];

  const filtered = items.filter(item => {
    const matchCategory = currentCategory === "all" || item.category === currentCategory;
    const q = currentSearchQuery.toLowerCase().trim();
    const matchQuery = !q || (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
    const matchTag = !currentTag || item.tags.includes(currentTag);
    return matchCategory && matchQuery && matchTag;
  });

  // 태그 배너
  const activeTagBanner = document.getElementById("active-tag-banner");
  if (activeTagBanner) {
    if (currentTag) {
      activeTagBanner.classList.remove("hidden");
      activeTagBanner.classList.add("flex");
      activeTagBanner.innerHTML = `
        <span class="text-xs text-slate-500 uppercase tracking-wider font-semibold">선택된 태그:</span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
          #${currentTag}
          <button onclick="clearTag()" class="hover:text-indigo-900 ml-1">✕</button>
        </span>
      `;
    } else {
      activeTagBanner.classList.add("hidden");
      activeTagBanner.classList.remove("flex");
    }
  }

  if (filtered.length === 0) {
    gridContainer.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  gridContainer.innerHTML = filtered.map(item => {
    const catObj = window.siteConfig.categories.find(c => c.id === item.category) || { name: item.category };
    const isTool = item.category === "tools";

    return `
      <article class="group bg-white border border-slate-200/80 rounded-3xl overflow-hidden hover:border-slate-300 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-slate-200/50">
        
        <!-- 썸네일 -->
        <div class="relative h-56 overflow-hidden bg-slate-100 cursor-pointer" onclick="${item.lessonUrl ? `window.location.href='${item.lessonUrl}'` : `openDetailModal('${item.id}')`}">
          <img 
            src="${item.thumbnail}" 
            alt="${item.title}" 
            class="w-full h-full object-contain bg-white p-2 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <!-- 상단 뱃지 -->
          <div class="absolute top-4 left-4 flex items-center gap-2">
            <span class="px-3 py-1 text-[11px] font-bold tracking-wider uppercase rounded-full bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200 shadow-sm">
              ${item.unitMajor ? item.unitMajor.split('.')[0] + '단원' : catObj.name}
            </span>
            ${item.featured ? '<span class="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-600 text-white shadow-sm">핵심단원</span>' : ''}
          </div>
          <div class="absolute top-4 right-4 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white shadow-sm">
            ${item.date}
          </div>
        </div>

        <!-- 본문 내용 -->
        <div class="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <h3 
              class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
              onclick="${item.lessonUrl ? `window.location.href='${item.lessonUrl}'` : `openDetailModal('${item.id}')`}"
            >
              ${item.title}
            </h3>

            <p class="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
              ${item.summary}
            </p>
          </div>

          <!-- 태그 목록 -->
          <div class="flex flex-wrap gap-1.5 pt-2">
            ${item.tags.map(tag => `
              <button 
                onclick="event.stopPropagation(); filterByTag('${tag}')" 
                class="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition font-medium"
              >
                #${tag}
              </button>
            `).join('')}
          </div>

          <!-- 액션 푸터 -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
            ${
              isTool && item.toolAction
                ? `<button onclick="handleToolAction('${item.toolAction}')" class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-2 shadow-sm">
                    <i data-lucide="play" class="w-3.5 h-3.5 fill-white"></i> 웹 도구 바로 실행
                  </button>`
                : item.lessonUrl
                ? `<a href="${item.lessonUrl}" class="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="book-open" class="w-3.5 h-3.5"></i> 단원 수업자료 열기
                  </a>
                  <button onclick="openDetailModal('${item.id}')" class="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition" title="요약 미리보기">
                    요약
                  </button>`
                : `<button onclick="openDetailModal('${item.id}')" class="w-full py-2.5 px-4 bg-black text-white hover:bg-slate-800 text-xs font-bold tracking-wider uppercase rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
                    자세히 보기 <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                  </button>`
            }
          </div>
        </div>

      </article>
    `;
  }).join('');

  safeCreateIcons();
}

// 5. 검색 및 단축키
function setupEventListeners() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value;
      renderItems();
    });
  }

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDetailModal();
      ClassroomTools.closeModal();
    }
    // 단축키 '/' 누르면 검색창 포커스
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput?.focus();
    }
  });
}

// 6. 상세 모달 열기
function openDetailModal(itemId) {
  const items = window.archiveItems || [];
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const modal = document.getElementById("detail-modal");
  const modalBody = document.getElementById("detail-modal-body");
  if (!modal || !modalBody) return;

  const catObj = window.siteConfig.categories.find(c => c.id === item.category) || { name: item.category };
  const renderedContent = window.marked ? window.marked.parse(item.content || "") : item.content;

  modalBody.innerHTML = `
    <!-- 상단 헤더 이미지 -->
    <div class="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-100">
      <img src="${item.thumbnail}" alt="${item.title}" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
      <div class="absolute bottom-6 left-6 right-6 text-white space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono">
          <span class="px-2.5 py-1 rounded-full bg-white text-slate-900 font-bold uppercase tracking-wider">${catObj.name}</span>
          <span class="text-slate-200">${item.date}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">${item.title}</h2>
      </div>
    </div>

    <!-- 모달 상세 본문 -->
    <div class="p-6 sm:p-10 space-y-8 bg-white">
      
      <!-- 요약 콜아웃 -->
      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm sm:text-base leading-relaxed">
        <span class="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">핵심 요약</span>
        ${item.summary}
      </div>

      <!-- 관련 링크 버튼 바 -->
      ${item.links && item.links.length > 0 ? `
        <div class="space-y-3">
          <div class="text-xs font-bold uppercase tracking-widest text-slate-400">자료 링크 및 바로가기</div>
          <div class="flex flex-wrap gap-2.5">
            ${item.links.map(l => {
              if (l.action) {
                return `
                  <button onclick="handleToolAction('${l.action}')" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm">
                    <i data-lucide="${l.icon || 'link'}" class="w-3.5 h-3.5"></i> ${l.label}
                  </button>
                `;
              }
              return `
                <a href="${l.url}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider border border-slate-200 transition">
                  <i data-lucide="${l.icon || 'link'}" class="w-3.5 h-3.5"></i> ${l.label}
                </a>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 마크다운 상세 텍스트 -->
      <div class="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-6">
        ${renderedContent}
      </div>

      <!-- 태그 모음 -->
      <div class="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
        ${item.tags.map(tag => `
          <span class="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono border border-slate-200">
            #${tag}
          </span>
        `).join('')}
      </div>

    </div>
  `;

  safeCreateIcons();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeDetailModal() {
  const modal = document.getElementById("detail-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

// 7. 태그 필터링
function filterByTag(tag) {
  currentTag = tag;
  renderItems();
  const archiveSec = document.getElementById("archive");
  if (archiveSec) {
    archiveSec.scrollIntoView({ behavior: "smooth" });
  }
}

function clearTag() {
  currentTag = "";
  renderItems();
}

window.openDetailModal = openDetailModal;
window.closeDetailModal = closeDetailModal;
window.filterByTag = filterByTag;
window.clearTag = clearTag;
