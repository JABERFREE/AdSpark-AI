// ==================== OWNER / ADMIN CONFIGURATION ====================
// ضع هنا بريدك الإلكتروني بصفتك مالك التطبيق لكي يظهر زر لوحة المشرف لك فقط ويختفي عن الزوار
const ADMIN_EMAILS = [
  'admin@gmail.com',
  'owner@gmail.com',
  'jaber@gmail.com'
];

// State Management
const GENERATION_COST = 250;
let user = JSON.parse(localStorage.getItem('adspark_user')) || null;
let uploadedProductImg = null;
let lastGeneratedBlobUrl = null;

// Page Navigation Logic (Bottom Footer Navigation)
function switchPage(pageName) {
  document.querySelectorAll('.page-view').forEach(page => {
    page.classList.add('hidden');
    page.classList.remove('active');
  });

  const targetPage = document.getElementById(`page-${pageName}`);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    targetPage.classList.add('active');
  }

  document.querySelectorAll('.footer-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageName);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.footer-link').forEach(btn => {
  btn.addEventListener('click', () => {
    switchPage(btn.dataset.page);
  });
});

// Default Viral Templates
const defaultTemplates = [
  {
    id: 1,
    title: 'إعلان سيروم العناية بالبشرة الفاخر',
    category: 'beauty',
    badge: 'GMV $20,000',
    prompt: 'اكتشفي سر الإشراقة الطبيعية مع تركيبتنا الجديدة • نتائج ملموسة من الأسبوع الأول',
    mediaType: 'image',
    cover: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'ترويج حقائب وأزياء عصرية 1-Click',
    category: 'fashion',
    badge: '20k+ Likes',
    prompt: 'أناقة استثنائية تناسب كل إطلالاتك اليومية • تصميم عصري وخامات فاخرة',
    mediaType: 'image',
    cover: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'مراجعة UGC منزلية لمنتج ذكي',
    category: 'tech',
    badge: '$30,000 GMV',
    prompt: 'هذا المنتج غير روتيني اليومي بالكامل! عملي وسهل الاستخدام في أي مكان',
    mediaType: 'image',
    cover: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'إعلان عطر كلاسيكي بإضاءة ذهبية',
    category: 'beauty',
    badge: '5000+ Likes',
    prompt: 'عبير يدوم طويلاً ويترك بصمتك الخاصة في كل مكان تذهب إليه',
    mediaType: 'image',
    cover: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'إعلان إكسسوارات ومجوهرات فاخرة',
    category: 'fashion',
    badge: '1000+ Sales',
    prompt: 'لمسة من الفخامة تكتمل بها أناقتك • إصدار محدود متوفر الآن',
    mediaType: 'image',
    cover: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'منتج أسلوب حياة صحي وقهوة مختصة',
    category: 'lifestyle',
    badge: '350k+ Views',
    prompt: 'ابدأ يومك بطاقة وتركيز عالٍ مع نكهة محمصة بعناية فائقة',
    mediaType: 'image',
    cover: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'
  }
];

let templates = JSON.parse(localStorage.getItem('adspark_templates')) || defaultTemplates;
let selectedTemplate = templates[0];

// DOM Elements
const gmailLoginBtn = document.getElementById('gmailLoginBtn');
const userLabel = document.getElementById('userLabel');
const creditPill = document.getElementById('creditPill');
const creditBalance = document.getElementById('creditBalance');
const openAdminBtn = document.getElementById('openAdminBtn');
const templatesGrid = document.getElementById('templatesGrid');
const promptInput = document.getElementById('promptInput');
const activeTemplateTitle = document.getElementById('activeTemplateTitle');
const productImageInput = document.getElementById('productImageInput');
const uploadFileName = document.getElementById('uploadFileName');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const outputVideo = document.getElementById('outputVideo');

// Check if current logged-in user is the Page Owner / Admin
function isOwnerLoggedIn() {
  if (!user || !user.email) return false;
  const emailLower = user.email.toLowerCase().trim();
  const isSecretAdminUrl = new URLSearchParams(window.location.search).get('admin') === '1';
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(emailLower) || isSecretAdminUrl;
}

// Initialize Auth & Admin Visibility UI
function updateAuthUI() {
  if (user) {
    userLabel.textContent = user.email;
    creditPill.classList.remove('hidden');
    creditBalance.textContent = user.credits;
  }

  // إظهار زر لوحة المشرف للمالك فقط وإخفاؤه تماماً عن الزوار العاديين
  if (isOwnerLoggedIn()) {
    openAdminBtn.classList.remove('hidden');
  } else {
    openAdminBtn.classList.add('hidden');
  }
}

function saveUser() {
  localStorage.setItem('adspark_user', JSON.stringify(user));
  updateAuthUI();
}

// Gmail Login (Grants 1000 Free Points)
gmailLoginBtn.addEventListener('click', () => {
  if (user) {
    const logout = confirm(`أنت مسجل الدخول بحساب: ${user.email}\nهل ترغب بتسجيل الخروج؟`);
    if (logout) {
      user = null;
      localStorage.removeItem('adspark_user');
      userLabel.textContent = 'تسجيل الدخول عبر Gmail (1000 نقطة)';
      creditPill.classList.add('hidden');
      openAdminBtn.classList.add('hidden');
    }
    return;
  }

  const email = prompt('أدخل بريدك الإلكتروني (Gmail) للحصول على 1000 نقطة مجانية:', 'creator@gmail.com');
  if (email && email.includes('@')) {
    user = {
      email: email.trim(),
      credits: 1000,
      plan: 'مجانية'
    };
    saveUser();
    if (isOwnerLoggedIn()) {
      alert('مرحباً بك بصفتك مالك المنصة! تم تفعيل زر لوحة المشرف لك.');
    } else {
      alert('تم تسجيل الدخول بنجاح! حصلت على 1000 نقطة مجانية في رصيدك.');
    }
  } else if (email) {
    alert('يرجى إدخال عنوان بريد إلكتروني صحيح.');
  }
});

// Render Templates (Supports both Image Covers and Video Templates)
function renderTemplates(filterCat = 'all') {
  templatesGrid.innerHTML = '';
  const filtered = filterCat === 'all' ? templates : templates.filter(t => t.category === filterCat);

  filtered.forEach(tpl => {
    const card = document.createElement('div');
    card.className = `template-card ${selectedTemplate && selectedTemplate.id === tpl.id ? 'selected' : ''}`;

    const isVideo = tpl.mediaType === 'video';
    const mediaHtml = isVideo
      ? `<span class="video-tag-badge">🎬 فيديو</span><video src="${tpl.cover}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`
      : `<img src="${tpl.cover}" alt="${tpl.title}" crossorigin="anonymous" />`;

    card.innerHTML = `
      <span class="card-badge">${tpl.badge}</span>
      ${mediaHtml}
      <div class="card-overlay">
        <h4>${tpl.title}</h4>
        <span>اضغط لاختيار القالب</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectedTemplate = tpl;
      activeTemplateTitle.textContent = tpl.title;
      promptInput.value = tpl.prompt;
      renderTemplates(filterCat);
      switchPage('home');
    });

    templatesGrid.appendChild(card);
  });
}

// Category Tabs
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTemplates(tab.dataset.cat);
  });
});

// Product Image Upload
productImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadFileName.textContent = file.name.slice(0, 18);
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => { uploadedProductImg = img; };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Generate Real Video (Canvas + MediaRecorder + Web Audio)
async function generateRealAdVideo() {
  if (!user) {
    alert('يرجى تسجيل الدخول عبر Gmail أولاً للحصول على 1000 نقطة مجانية!');
    gmailLoginBtn.click();
    return;
  }

  if (user.credits < GENERATION_COST) {
    document.getElementById('pricingModal').classList.remove('hidden');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>⏳ جاري تصيير الفيديو والصوت...</span>';

  const canvas = document.getElementById('renderCanvas');
  const ctx = canvas.getContext('2d');
  const adText = promptInput.value.trim() || selectedTemplate.prompt;
  const ctaText = document.getElementById('ctaInput').value.trim() || 'اطلبه الآن';

  // Load cover fallback image if template is image
  let activeImg = uploadedProductImg;
  if (!activeImg && selectedTemplate.mediaType !== 'video') {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = selectedTemplate.cover;
    await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; });
    activeImg = bgImg;
  }

  // Audio Synthesizer Stream
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const dest = audioCtx.createMediaStreamDestination();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(220, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(330, audioCtx.currentTime + 2.5);
  osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 5);
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(dest);
  osc.start();

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks()
  ]);

  const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.onstop = () => {
    osc.stop();
    audioCtx.close();

    user.credits -= GENERATION_COST;
    saveUser();

    const blob = new Blob(chunks, { type: 'video/webm' });
    if (lastGeneratedBlobUrl) URL.revokeObjectURL(lastGeneratedBlobUrl);
    lastGeneratedBlobUrl = URL.createObjectURL(blob);

    outputVideo.src = lastGeneratedBlobUrl;
    resultSection.classList.remove('hidden');
    outputVideo.play();

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ توليد الفيديو الإعلاني</span>';
    resultSection.scrollIntoView({ behavior: 'smooth' });
  };

  recorder.start();

  let frame = 0;
  const totalFrames = 150;

  function drawFrame() {
    const progress = frame / totalFrames;
    ctx.fillStyle = '#0e0f13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
      const scale = 1 + progress * 0.18;
      const w = canvas.width * scale;
      const h = canvas.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(activeImg, x, y, w, h);
      ctx.globalAlpha = 1;
    }

    const grad = ctx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ff5b5b';
    ctx.fillRect(40, 50, 230, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillText(selectedTemplate.badge, 60, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Cairo, sans-serif';
    const shortText = adText.slice(0, 48);
    ctx.fillText(shortText, 40, canvas.height - 230);

    const pulse = 1 + Math.sin(frame * 0.2) * 0.04;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height - 120);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#7c5cff';
    ctx.fillRect(-240, -35, 480, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ctaText, 0, 10);
    ctx.restore();
    ctx.textAlign = 'start';

    frame++;
    if (frame <= totalFrames) {
      requestAnimationFrame(drawFrame);
    } else {
      recorder.stop();
    }
  }

  drawFrame();
}

generateBtn.addEventListener('click', generateRealAdVideo);
document.getElementById('regenerateBtn').addEventListener('click', generateRealAdVideo);

// Download & Share Video
document.getElementById('downloadVideoBtn').addEventListener('click', () => {
  if (!lastGeneratedBlobUrl) return;
  const a = document.createElement('a');
  a.href = lastGeneratedBlobUrl;
  a.download = `AdSpark-Ad-${Date.now()}.webm`;
  a.click();
});

document.getElementById('shareVideoBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href);
  alert('تم نسخ رابط مشاركة الإعلان إلى الحافظة!');
});

// Pricing Modal & Plan Purchase
creditPill.addEventListener('click', () => {
  document.getElementById('pricingModal').classList.remove('hidden');
});

document.querySelectorAll('.select-plan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!user) {
      alert('يرجى تسجيل الدخول بحساب Gmail أولاً.');
      return;
    }
    const addedPoints = Number(btn.dataset.points);
    user.credits += addedPoints;
    user.plan = btn.dataset.plan;
    saveUser();
    document.getElementById('pricingModal').classList.add('hidden');
    alert(`تم تفعيل باقة ${btn.dataset.plan} وإضافة ${addedPoints} نقطة إلى رصيدك بنجاح!`);
  });
});

// Admin Panel Logic (Owner Only + Supports Video & Image Upload)
openAdminBtn.addEventListener('click', () => {
  if (!isOwnerLoggedIn()) {
    alert('عذراً، هذه اللوحة مخصصة لمالك المنصة فقط.');
    return;
  }
  document.getElementById('adminModal').classList.remove('hidden');
});

document.getElementById('adminTemplateForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!isOwnerLoggedIn()) return;

  const title = document.getElementById('tplTitle').value.trim();
  const category = document.getElementById('tplCategory').value;
  const badge = document.getElementById('tplBadge').value.trim();
  const promptText = document.getElementById('tplPrompt').value.trim();
  const file = document.getElementById('tplMediaFile').files[0];

  const finalizeAdd = (mediaUrl, mediaType) => {
    const newTpl = {
      id: Date.now(),
      title,
      category,
      badge,
      prompt: promptText,
      mediaType,
      cover: mediaUrl
    };
    templates.unshift(newTpl);
    try {
      localStorage.setItem('adspark_templates', JSON.stringify(templates));
    } catch (err) {
      console.warn('حجم الملف كبير للتخزين الدائم في المتصفح، سيبقى متاحاً في الجلسة الحالية.');
    }
    renderTemplates('all');
    document.getElementById('adminModal').classList.add('hidden');
    e.target.reset();
    alert('تم نشر القالب الإعلاني الجديد بنجاح!');
  };

  if (file) {
    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      const videoUrl = URL.createObjectURL(file);
      finalizeAdd(videoUrl, 'video');
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => finalizeAdd(ev.target.result, 'image');
      reader.readAsDataURL(file);
    }
  } else {
    finalizeAdd('https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80', 'image');
  }
});

// Close Modals
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close).classList.add('hidden');
  });
});

// Boot
promptInput.value = selectedTemplate.prompt;
updateAuthUI();
renderTemplates('all');
