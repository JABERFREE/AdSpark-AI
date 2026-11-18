// ==================== OWNER / ADMIN CONFIGURATION ====================
// ضع هنا بريدك الإلكتروني بصفتك مالك التطبيق لكي يظهر زر لوحة المشرف لك فقط
const ADMIN_EMAILS = [
  'emadjaber23@gmail.com',
  'admin@gmail.com',
  'owner@gmail.com',
  'jaber@gmail.com'
];

const GENERATION_COST = 250;
let user = JSON.parse(localStorage.getItem('adspark_user')) || null;
let uploadedProductImg = null;
let lastGeneratedBlobUrl = null;

// التنقل بين الصفحات في التذييل السفلي (الرئيسية، التعليمات، الخصوصية، الشروط)
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

// القوالب الافتراضية
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
let uploadedProductUrl = null; // لتخزين رابط صورة المنتج المرفوعة

// عناصر الواجهة
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
const outputImage = document.getElementById('outputImage');

// التحقق هل المستخدم الحالي هو مالك الصفحة
function isOwnerLoggedIn() {
  if (!user || !user.email) return false;
  const emailLower = user.email.toLowerCase().trim();
  const isSecretAdminUrl = new URLSearchParams(window.location.search).get('admin') === '1';
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(emailLower) || isSecretAdminUrl;
}

function updateAuthUI() {
  if (user) {
    userLabel.textContent = user.email;
    creditPill.classList.remove('hidden');
    creditBalance.textContent = user.credits;
  }

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

// تسجيل الدخول عبر Gmail
gmailLoginBtn.addEventListener('click', () => {
  if (user) {
    const logout = confirm(`أنت مسجل الدخول بحساب: ${user.email} - هل ترغب بتسجيل الخروج؟`);
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

// عرض القوالب مع تفعيل زر المعاينة المحسّن
function renderTemplates(filterCat = 'all') {
  templatesGrid.innerHTML = '';
  const filtered = filterCat === 'all' ? templates : templates.filter(t => t.category === filterCat);

  filtered.forEach(tpl => {
    const card = document.createElement('div');
    card.className = `template-card ${selectedTemplate && selectedTemplate.id === tpl.id ? 'selected' : ''}`;

    const isVideo = tpl.mediaType === 'video';
    const mediaHtml = isVideo
      ? `<video src="${tpl.cover}" muted loop playsinline preload="metadata" onmouseover="this.play()" onmouseout="this.pause()"></video>`
      : `<img src="${tpl.cover}" alt="${tpl.title}" crossorigin="anonymous" />`;

    card.innerHTML = `
      <span class="card-badge">${tpl.badge}</span>
      <button type="button" class="video-tag-badge" onclick="event.stopPropagation(); previewTemplateFull('${tpl.id}')">👁️ معاينة</button>
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

// دالة المعاينة الكاملة والمصححة لعرض الفيديوهات والصور بشكل سليم وبدون مشاكل في الحجم
window.previewTemplateFull = function(tplId) {
  const tpl = templates.find(t => t.id == tplId);
  if (!tpl) return;
  
  document.getElementById('previewTplTitle').textContent = tpl.title;
  const v = document.getElementById('previewTplVideo');
  const modal = document.getElementById('templatePreviewModal');
  
  const mediaSource = tpl.mediaUrl || tpl.cover || '';
  
  if (tpl.mediaType === 'image' || (!mediaSource.includes('.mp4') && !mediaSource.includes('.webm') && !mediaSource.startsWith('blob:'))) {
    v.style.display = 'none';
  } else {
    v.style.display = 'block';
    v.src = mediaSource;
    v.load();
    v.play().catch(e => console.log("Autoplay prevented:", e));
  }
  
  modal.classList.remove('hidden');
};

// زر استخدام القالب من نافذة المعاينة
const usePreviewBtn = document.getElementById('usePreviewTplBtn');
if (usePreviewBtn) {
  usePreviewBtn.onclick = () => {
    document.getElementById('templatePreviewModal').classList.add('hidden');
    const v = document.getElementById('previewTplVideo');
    if (v) v.pause();
  };
}

// تصنيفات القوالب
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTemplates(tab.dataset.cat);
  });
});

// رفع صورة المنتج وتجهيز رابطها
productImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadFileName.textContent = file.name.slice(0, 18);
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => { 
      uploadedProductImg = img;
      uploadedProductUrl = ev.target.result; // تخزين رابط الـ Data URL لاستخدامه في Replicate
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// --- دالة دمج صورة المنتج مع القالب وتوليد الفيديو الإعلاني محلياً ---
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
  generateBtn.innerHTML = '<span>⏳ جاري دمج وتصيير الإعلان بالذكاء الاصطناعي...</span>';

  const canvas = document.getElementById('renderCanvas');
  const ctx = canvas.getContext('2d');
  const adText = promptInput.value.trim() || selectedTemplate.prompt;
  const ctaText = document.getElementById('ctaInput').value.trim() || 'اطلبه الآن';

  // استخدام صورة المنتج المرفوعة، أو صورة القالب الافتراضية إذا لم يرفع المستخدم صورة
  let activeImg = uploadedProductImg;
  if (!activeImg) {
    activeImg = new Image();
    activeImg.crossOrigin = 'anonymous';
    activeImg.src = selectedTemplate.cover;
    await new Promise(r => { activeImg.onload = r; activeImg.onerror = r; });
  }

  // إعداد الصوت التفاعلي للإعلان
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

    // خصم النقاط وتحديث رصيد المستخدم
    user.credits -= GENERATION_COST;
    saveUser();

    const blob = new Blob(chunks, { type: 'video/webm' });
    if (lastGeneratedBlobUrl) URL.revokeObjectURL(lastGeneratedBlobUrl);
    lastGeneratedBlobUrl = URL.createObjectURL(blob);

    outputVideo.src = lastGeneratedBlobUrl;
    resultSection.classList.remove('hidden');
    outputVideo.play();

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ توليد الإعلان تلقائياً</span>';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    alert("تم دمج صورة المنتج وتوليد الفيديو الإعلاني بنجاح!");
  };

  recorder.start();

  let frame = 0;
  const totalFrames = 150; // مدة الفيديو (حوالي 5 ثوانٍ)

  function drawFrame() {
    const progress = frame / totalFrames;
    ctx.fillStyle = '#0e0f13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم صورة المنتج مع تأثير حركة تفاعلي (Zoom-in)
    if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
      const scale = 1 + progress * 0.15;
      const w = canvas.width * scale;
      const h = canvas.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(activeImg, x, y, w, h);
      ctx.globalAlpha = 1.0;
    }

    // تدرج لوني خلف النصوص لجعلها واضحة
    const grad = ctx.createLinearGradient(0, canvas.height * 0.5, 0, canvas.height);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم شارة القالب (Badge)
    ctx.fillStyle = '#ff5b5b';
    ctx.fillRect(40, 50, 230, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillText(selectedTemplate.badge, 60, 80);

    // كتابة النص الترويجي
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Cairo, sans-serif';
    const shortText = adText.slice(0, 45);
    ctx.fillText(shortText, 40, canvas.height - 220);

    // زر الدعوة لاتخاذ إجراء (CTA) المتحرك
    const pulse = 1 + Math.sin(frame * 0.2) * 0.03;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height - 110);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#7c5cff';
    ctx.fillRect(-220, -32, 440, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ctaText, 0, 9);
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

// ربط زر التوليد بالدالة
generateBtn.removeEventListener('click', generateWithReplicate); // إزالة أي ربط قديم فاشل
generateBtn.addEventListener('click', generateRealAdVideo);

// ربط زر التوليد بدالة Replicate الجديدة
async function handleGenerateAd() {
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
  generateBtn.innerHTML = '<span>⏳ جاري توليد الإعلان عبر Replicate...</span>';

  const userPrompt = promptInput.value.trim() || (selectedTemplate && selectedTemplate.prompt) || "Professional fashion advertisement";
  const productImageUrl = uploadedProductUrl || null;

  const outputUrl = await generateWithReplicate(userPrompt, productImageUrl);

  if (outputUrl) {
    // خصم النقاط وتحديث رصيد المستخدم
    user.credits -= GENERATION_COST;
    saveUser();

    resultSection.classList.remove('hidden');
    
    // عرض النتيجة (سواء كانت صورة أو فيديو ناتج)
    if (outputImage && outputVideo) {
      if (Array.isArray(outputUrl)) {
        outputImage.src = outputUrl[0];
        outputImage.classList.remove('hidden');
        outputVideo.classList.add('hidden');
      } else if (typeof outputUrl === 'string') {
        if (outputUrl.endsWith('.mp4') || outputUrl.endsWith('.webm')) {
          outputVideo.src = outputUrl;
          outputVideo.classList.remove('hidden');
          outputImage.classList.add('hidden');
          outputVideo.play().catch(e => console.log("Autoplay prevented:", e));
        } else {
          outputImage.src = outputUrl;
          outputImage.classList.remove('hidden');
          outputVideo.classList.add('hidden');
        }
      }
    }

    resultSection.scrollIntoView({ behavior: 'smooth' });
    alert("تم توليد الإعلان بنجاح!");
  }

  generateBtn.disabled = false;
  generateBtn.innerHTML = '<span>✨ توليد الإعلان تلقائياً</span>';
}

generateBtn.addEventListener('click', handleGenerateAd);
const regenerateBtn = document.getElementById('regenerateBtn');
if (regenerateBtn) {
  regenerateBtn.addEventListener('click', handleGenerateAd);
}

// تحميل ومشاركة الفيديو أو الصورة الناتجة
document.getElementById('downloadVideoBtn').addEventListener('click', () => {
  const targetSrc = outputVideo.src || outputImage.src;
  if (!targetSrc) return;
  const a = document.createElement('a');
  a.href = targetSrc;
  a.download = `AdSpark-Ad-${Date.now()}`;
  a.click();
});

document.getElementById('shareVideoBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href);
  alert('تم نسخ رابط مشاركة الإعلان إلى الحافظة!');
});

// نافذة الباقات والاشتراكات
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

// لوحة المشرف (للمالك فقط)
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
      cover: mediaUrl,
      mediaUrl: mediaUrl
    };
    templates.unshift(newTpl);
    try {
      localStorage.setItem('adspark_templates', JSON.stringify(templates));
    } catch (err) {
      console.warn('حجم الملف كبير للتخزين الدائم، سيبقى متاحاً في الجلسة الحالية.');
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

// إغلاق النوافذ المنبثقة
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.close;
    document.getElementById(modalId).classList.add('hidden');
    if (modalId === 'templatePreviewModal') {
      const v = document.getElementById('previewTplVideo');
      if (v) v.pause();
    }
  });
});

// تشغيل التطبيق
promptInput.value = selectedTemplate.prompt;
updateAuthUI();
renderTemplates('all');
