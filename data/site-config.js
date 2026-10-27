// =====================================================================
// 🌟 사이트 기본 설정 파일 (data/site-config.js)
// 선생님의 프로필 정보, 사이트 이름, 상단 탭 메뉴 이름을 여기서 변경합니다!
// =====================================================================

const siteConfig = {
  // 1. 프로필 정보 (선생님의 성함과 소개글을 입력하세요)
  author: {
    name: "김호연",                           // 선생님 성함 또는 닉네임
    role: "지구과학 교사",         // 직책 또는 교과
    bio: "작은 아이디어와 교육 활동을 기록합니다.", // 한 줄 소개
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", // 프로필 사진 URL (또는 images/my-photo.jpg)
    email: "hoyeon1035@gmail.com",             // 이메일 주소
    github: "https://github.com",             // 깃허브 주소 (없으면 "" 빈칸)
    blog: "https://blog.naver.com"            // 블로그 주소 (없으면 "" 빈칸)
  },

  // 2. 사이트 메타데이터 (메인 화면에 크게 표시되는 문구)
  site: {
    title: "HoHo Earth",                 // 웹사이트 로고/타이틀
    subtitle: "교사로서의 과거와 미래", // 히어로 큰 제목
    description: "교육활동 전반을 기록하는 공간입니다.", // 부제목 설명
    badge: "Earth Science Education"    // 상단 반짝이는 뱃지 문구
  },

  // 3. 🎯 [탭 이름 수정하기]
  // 웹사이트에 표시되는 카테고리 탭 목록입니다.
  // 'name' 부분을 원하시는 이름으로 바꾸시거나, 순서를 바꾸거나, 새 탭을 추가하실 수 있습니다!
  categories: [
    { id: "all", name: "전체보기", icon: "layout-grid" },
    { id: "class", name: "수업 자료", icon: "book-open" },
    { id: "project", name: "주요 활동", icon: "flask-conical" },
    { id: "tools", name: "AI활용 도구", icon: "wrench" },
    { id: "lecture", name: "연수 자료", icon: "presentation" },
    { id: "essay", name: "교육 에세이", icon: "pen-tool" }
  ]
};

window.siteConfig = siteConfig;
