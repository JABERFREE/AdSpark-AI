const ADMIN_EMAILS = ['emadjaber23@gmail.com', 'admin@gmail.com', 'owner@gmail.com'];
const GENERATION_COST = 250;

let user = JSON.parse(localStorage.getItem('adspark_user')) || null;
let uploadedProductImg = null;
let outputMediaType = 'video'; // 'video' or 'image' 
let lastDownloadUrl = null;

// مكتبة قوالب غنية ومتنوعة (صور عالية الدقة تظهر فوراً بدون شاشات سوداء)
const defaultTemplates = [
  {
    id: 1,
    title: 'إعلان سيروم العناية بالبشرة الفاخر',
    category: 'beauty',
    badge: 'GMV $24,000',
    prompt: 'اكتشفي سر الإشراقة الطبيعية مع تركيبتنا الجديدة • نتائج ملموسة',
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 2,
    title: 'ترويج حقائب وأزياء عصرية 1-Click',
    category: 'fashion',
    badge: '25k+ Likes',
    prompt: 'أناقة استثنائية تناسب كل إطلالاتك اليومية • خامات فاخرة',
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 3,
    title: 'إعلان ساعة ذكية وتقنية حديثة',
    category: 'tech',
    badge: '$35,000 GMV',
    prompt: 'تحكم في يومك بذكاء وأناقة • بطارية تدوم طويلاً وأداء فائق',
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 4,
    title: 'إعلان عطر كلاسيكي بإضاءة ذهبية',
    category: 'beauty',
    badge: 'Top Viral',
    prompt: 'عبير ساحر يدوم طويلاً ويترك بصمتك الخاصة في كل مكان',
    type: 'image',
    cover: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 5,
    title: 'تشكيلة عبايات وأزياء راقية',
    category: 'fashion',
    badge: '12k+ Sales',
    prompt: 'فستانك وحجابك تكتمل أناقتك • تصميم حصري لعشاق التميز',
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 6,
    title: 'قهوة مختصة ومشروبات طاقة طبيعية',
    category: 'food',
    badge: '400k+ Views',
    prompt: 'ابدأ صباحك بمذاق القهوة المحمصة بعناية فائقة وتركيز عالٍ',
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 7,
    title: 'سماعات رأس لاسلكية عازلة للضوضاء',
    category: 'tech',
    badge: 'Best Seller',
    prompt: 'انغمس في عالم الصوت النقي بدون أي تشويش • جودة استوديو',
    type: 'image',
    cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 8,
    title: 'برجر ووجبات سريعة شهية للمطاعم',
    category: 'food',
    badge: 'Hot Offer',
    prompt: 'الطعم الأصلي الذي لا يقاوم • اطلب وجبتك الآن وتصلك ساخنة',
    type: 'video',
    cover: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80'
  }
];

let templates = JSON.parse(localStorage.getItem('adspark_templates_v2')) || defaultTemplates;
let selectedTemplate = templates[0];
let previewingTemplate = null;

// عناصر الواجهة
const gmailLoginBtn = document.getElementById('gmailLoginBtn');
const creditPill = document.getElementById('creditPill');
const creditBalance = document.getElementById('creditBalance');
const openAdminBtn = document.getElementById('openAdminBtn');
const templatesGrid = document.getElementById('templatesGrid');
const promptInput = document.getElementById('promptInput');
const activeTemplateTitle = document.getElementById('activeTemplateTitle');
const productImageInput = document.getElementById('productImageInput');
const uploadFileName = document.getElementById('uploadFileName');
const clearProductBtn = document.getElementById('clearProductBtn');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const outputVideo = document.getElementById('outputVideo');
const outputImage = document.getElementById('outputImage');

function isAdmin() {
  if (!user || !user.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase().trim());
}

function updateUI() {
  if (user) {
    gmailLoginBtn.textContent = user.email;
    creditPill.classList.remove('hidden');
    creditBalance.textContent = user.credits;
  } else {
    gmailLoginBtn.textContent = 'تسجيل الدخول عبر Gmail';
    creditPill.classList.add('hidden');
  }
  openAdminBtn.classList.toggle('hidden', !isAdmin());
}

gmailLoginBtn.addEventListener('click', () => {
  if (user) {
    if (confirm(`هل ترغب بتسجيل الخروج من ${user.email}؟`)) {
      user = null;
      localStorage.removeItem('adspark_user');
      updateUI();
    }
    return;
  }
  const email = prompt('أدخل بريدك الإلكتروني (Gmail) للحصول على 1000 نقطة مجانية:', 'emadjaber23@gmail.com');
  if (email && email.includes('@')) {
    user = { email: email.trim(), credits: 1000 };
    localStorage.setItem('adspark_user', JSON.stringify(user));
    updateUI();
  }
});

// التبديل بين الفيديو والصورة
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    outputMediaType = btn.dataset.type;
  });
});

// عرض القوالب
function renderTemplates(category = 'all') {
  templatesGrid.innerHTML = '';
  const list = category === 'all' ? templates : templates.filter(t => t.category === category);

  list.forEach(tpl => {
    const card = document.createElement('div');
    card.className = `template-card ${selectedTemplate && selectedTemplate.id === tpl.id ? 'selected' : ''}`;

    const isVidFile = tpl.isUploadedVideo;
    const mediaTag = isVidFile
      ? `<video src="${tpl.cover}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`
      : `<img src="${tpl.cover}" alt="${tpl.title}" crossorigin="anonymous">`;

    const deleteBtnHtml = isAdmin()
      ? `<button type="button" class="delete-tpl-btn" onclick="event.stopPropagation(); deleteTemplate(${tpl.id})">🗑️ حذف</button>`
      : '';

    card.innerHTML = `
      <div class="card-media-box">
        <span class="card-badge">${tpl.badge}</span>
        <button type="button" class="preview-pill-btn" onclick="event.stopPropagation(); openPreview(${tpl.id})">👁️ معاينة</button>
        ${mediaTag}
        ${deleteBtnHtml}
      </div>
      <div class="card-info">
        <h4>${tpl.title}</h4>
        <p>${tpl.prompt}</p>
      </div>
    `;

    card.addEventListener('click', () => selectTemplate(tpl, category));
    templatesGrid.appendChild(card);
  });
}

function selectTemplate(tpl, currentCat = 'all') {
  selectedTemplate = tpl;
  activeTemplateTitle.textContent = tpl.title;
  promptInput.value = tpl.prompt;
  renderTemplates(currentCat);
}

window.deleteTemplate = function(id) {
  if (!confirm('هل تريد حذف هذا القالب؟')) return;
  templates = templates.filter(t => t.id !== id);
  localStorage.setItem('adspark_templates_v2', JSON.stringify(templates));
  renderTemplates('all');
};

window.openPreview = function(id) {
  const tpl = templates.find(t => t.id === id);
  if (!tpl) return;
  previewingTemplate = tpl;
  document.getElementById('previewModalTitle').textContent = tpl.title;
  document.getElementById('previewModalPrompt').textContent = tpl.prompt;

  const v = document.getElementById('previewModalVideo');
  const img = document.getElementById('previewModalImg');

  if (tpl.isUploadedVideo) {
    v.src = tpl.cover;
    v.classList.remove('hidden');
    img.classList.add('hidden');
  } else {
    img.src = tpl.cover;
    img.classList.remove('hidden');
    v.classList.add('hidden');
  }
  document.getElementById('previewModal').classList.remove('hidden');
};

document.getElementById('usePreviewTemplateBtn').addEventListener('click', () => {
  if (previewingTemplate) {
    selectTemplate(previewingTemplate);
  }
  document.getElementById('previewModal').classList.add('hidden');
  document.getElementById('previewModalVideo').pause();
});

// التصنيفات
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderTemplates(tab.dataset.cat);
  });
});

// رفع صورة المنتج
productImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadFileName.textContent = `✅ ${file.name.slice(0, 22)}`;
  clearProductBtn.classList.remove('hidden');
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => { uploadedProductImg = img; };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

clearProductBtn.addEventListener('click', () => {
  uploadedProductImg = null;
  productImageInput.value = '';
  uploadFileName.textContent = 'استخدام صورة القالب الافتراضية';
  clearProductBtn.classList.add('hidden');
});

// تحميل صورة القالب بأمان للرسم على Canvas
function loadImageSafe(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// رسم إطار الإعلان (دمج الخلفية + صورة المنتج المرفوعة + النصوص + زر CTA)
function renderAdFrame(ctx, canvas, bgImg, prodImg, progress, frameNum) {
  const w = canvas.width;
  const h = canvas.height;
  const motion = document.getElementById('motionEffectSelect').value;
  const adText = promptInput.value.trim() || selectedTemplate.prompt;
  const ctaText = document.getElementById('ctaInput').value.trim() || 'اطلبه الآن';

  ctx.fillStyle = '#0b0c10';
  ctx.fillRect(0, 0, w, h);

  // 1. رسم خلفية القالب مع حركة الكاميرا
  if (bgImg) {
    let scale = 1;
    if (motion === 'zoom-in') scale = 1 + progress * 0.14;
    if (motion === 'zoom-out') scale = 1.14 - progress * 0.14;
    if (motion === 'pulse') scale = 1.04 + Math.sin(frameNum * 0.12) * 0.03;

    const dw = w * scale;
    const dh = h * scale;
    ctx.save();
    ctx.filter = prodImg ? 'brightness(0.55) blur(3px)' : 'brightness(0.9)';
    ctx.drawImage(bgImg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  // 2. دمج صورة المنتج المرفوعة في منتصف الإعلان بإطار احترافي وحركة
  if (prodImg) {
    const floatY = Math.sin(frameNum * 0.1) * 8;
    const boxSize = Math.min(w, h) * 0.52;
    const ratio = Math.min(boxSize / prodImg.width, boxSize / prodImg.height);
    const pw = prodImg.width * ratio;
    const ph = prodImg.height * ratio;
    const px = (w - pw) / 2;
    const py = (h * 0.42) - (ph / 2) + floatY;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.drawImage(prodImg, px, py, pw, ph);
    ctx.restore();
  }

  // 3. تدرج سفلي لوضوح النصوص
  const grad = ctx.createLinearGradient(0, h * 0.48, 0, h);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.92)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 4. شارة العرض
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(w - 230, 36, 195, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(selectedTemplate.badge, w - 132, 62);

  // 5. النص الترويجي
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Cairo, sans-serif';
  ctx.textAlign = 'center';
  const lines = wrapArabicText(adText, 34);
  lines.slice(0, 2).forEach((line, idx) => {
    ctx.fillText(line, w / 2, h - 185 + (idx * 38));
  });

  // 6. زر الدعوة لاتخاذ إجراء (CTA)
  const btnPulse = 1 + Math.sin(frameNum * 0.18) * 0.025;
  ctx.save();
  ctx.translate(w / 2, h - 85);
  ctx.scale(btnPulse, btnPulse);
  ctx.fillStyle = '#7c5cff';
  ctx.beginPath();
  ctx.roundRect(-210, -28, 420, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Cairo, sans-serif';
  ctx.fillText(ctaText, 0, 8);
  ctx.restore();
}

function wrapArabicText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach(word => {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

// التوليد الفعلي (فيديو بصوت وحركة أو صورة عالية الدقة)
generateBtn.addEventListener('click', async () => {
  if (!user) {
    alert('يرجى تسجيل الدخول عبر Gmail أولاً للحصول على 1000 نقطة!');
    gmailLoginBtn.click();
    return;
  }

  if (user.credits < GENERATION_COST) {
    if (confirm('انتهى رصيد النقاط! هل ترغب بشحن 1000 نقطة مجانية الآن؟')) {
      user.credits += 1000;
      localStorage.setItem('adspark_user', JSON.stringify(user));
      updateUI();
    }
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>⏳ جاري دمج المنتج وتصيير الإعلان...</span>';

  const canvas = document.getElementById('renderCanvas');
  const ctx = canvas.getContext('2d');
  const ratio = document.getElementById('aspectRatioSelect').value;

  if (ratio === '9:16') { canvas.width = 720; canvas.height = 1280; }
  if (ratio === '1:1')  { canvas.width = 1080; canvas.height = 1080; }
  if (ratio === '16:9') { canvas.width = 1280; canvas.height = 720; }

  const bgImg = await loadImageSafe(selectedTemplate.cover);

  // إذا اختار المستخدم توليد صورة
  if (outputMediaType === 'image') {
    renderAdFrame(ctx, canvas, bgImg, uploadedProductImg, 0.5, 15);
    lastDownloadUrl = canvas.toDataURL('image/png');

    user.credits -= GENERATION_COST;
    localStorage.setItem('adspark_user', JSON.stringify(user));
    updateUI();

    outputImage.src = lastDownloadUrl;
    outputImage.classList.remove('hidden');
    outputVideo.classList.add('hidden');
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ دمج المنتج وتوليد الإعلان الآن (250 نقطة)</span>';
    return;
  }

  // إذا اختار المستخدم توليد فيديو إعلاني
  const audioStyle = document.getElementById('audioStyleSelect').value;
  let audioCtx = null;
  let osc = null;
  const tracks = [...canvas.captureStream(30).getVideoTracks()];

  if (audioStyle !== 'none') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = audioCtx.createMediaStreamDestination();
    osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = audioStyle === 'luxury' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(audioStyle === 'luxury' ? 196 : 261, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(audioStyle === 'luxury' ? 293 : 392, audioCtx.currentTime + 4);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();
    tracks.push(...dest.stream.getAudioTracks());
  }

  const recorder = new MediaRecorder(new MediaStream(tracks), { mimeType: 'video/webm' });
  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.onstop = () => {
    if (osc) osc.stop();
    if (audioCtx) audioCtx.close();

    user.credits -= GENERATION_COST;
    localStorage.setItem('adspark_user', JSON.stringify(user));
    updateUI();

    const blob = new Blob(chunks, { type: 'video/webm' });
    if (lastDownloadUrl) URL.revokeObjectURL(lastDownloadUrl);
    lastDownloadUrl = URL.createObjectURL(blob);

    outputVideo.src = lastDownloadUrl;
    outputVideo.classList.remove('hidden');
    outputImage.classList.add('hidden');
    resultSection.classList.remove('hidden');
    outputVideo.play();
    resultSection.scrollIntoView({ behavior: 'smooth' });

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ دمج المنتج وتوليد الإعلان الآن (250 نقطة)</span>';
  };

  recorder.start();
  let frame = 0;
  const totalFrames = 120; // 4 ثوانٍ

  function step() {
    renderAdFrame(ctx, canvas, bgImg, uploadedProductImg, frame / totalFrames, frame);
    frame++;
    if (frame <= totalFrames) {
      requestAnimationFrame(step);
    } else {
      recorder.stop();
    }
  }
  step();
});

// التحميل والمشاركة
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!lastDownloadUrl) return;
  const a = document.createElement('a');
  a.href = lastDownloadUrl;
  a.download = outputMediaType === 'image' ? `AdSpark-Poster-${Date.now()}.png` : `AdSpark-Video-${Date.now()}.webm`;
  a.click();
});

document.getElementById('shareBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href);
  alert('تم نسخ رابط الاستوديو بنجاح!');
});

// لوحة المشرف لإضافة قوالب جديدة
openAdminBtn.addEventListener('click', () => {
  document.getElementById('adminModal').classList.remove('hidden');
});

document.getElementById('addTemplateForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('newTplTitle').value.trim();
  const category = document.getElementById('newTplCategory').value;
  const badge = document.getElementById('newTplBadge').value.trim();
  const promptText = document.getElementById('newTplPrompt').value.trim();
  const file = document.getElementById('newTplFile').files[0];

  if (!file) return;
  const isVid = file.type.startsWith('video/');

  const saveNewTpl = (url) => {
    templates.unshift({
      id: Date.now(),
      title,
      category,
      badge,
      prompt: promptText,
      isUploadedVideo: isVid,
      cover: url
    });
    try {
      localStorage.setItem('adspark_templates_v2', JSON.stringify(templates));
    } catch (_) {}
    renderTemplates('all');
    document.getElementById('adminModal').classList.add('hidden');
    e.target.reset();
  };

  if (isVid) {
    saveNewTpl(URL.createObjectURL(file));
  } else {
    const reader = new FileReader();
    reader.onload = ev => saveNewTpl(ev.target.result);
    reader.readAsDataURL(file);
  }
});

// إغلاق النوافذ
document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target) target.classList.add('hidden');
    const v = document.getElementById('previewModalVideo');
    if (v) v.pause();
  });
});

// تشغيل أولي
promptInput.value = selectedTemplate.prompt;
updateUI();
renderTemplates('all');
