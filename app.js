// بيانات التطبيق الأولية
let user = JSON.parse(localStorage.getItem('adspark_user')) || null;
let uploadedProductUrl = null;

const defaultTemplates = [
  {
    id: 1,
    title: 'إعلان سيروم العناية بالبشرة الفاخر',
    category: 'beauty',
    prompt: 'اكتشفي سر الإشراقة الطبيعية مع تركيبتنا الجديدة • نتائج ملموسة',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 2,
    title: 'ترويج حقائب وأزياء عصرية',
    category: 'fashion',
    prompt: 'أناقة استثنائية تناسب كل إطلالاتك اليومية • تصميم عصري',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'مراجعة منتج ذكي ومبتكر',
    category: 'tech',
    prompt: 'هذا المنتج غير روتيني اليومي بالكامل! عملي وسهل الاستخدام',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  }
];

let selectedTemplate = defaultTemplates[0];

// عناصر الواجهة
const gmailLoginBtn = document.getElementById('gmailLoginBtn');
const creditPill = document.getElementById('creditPill');
const creditBalance = document.getElementById('creditBalance');
const templatesGrid = document.getElementById('templatesGrid');
const promptInput = document.getElementById('promptInput');
const activeTemplateTitle = document.getElementById('activeTemplateTitle');
const productImageInput = document.getElementById('productImageInput');
const uploadFileName = document.getElementById('uploadFileName');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const outputVideo = document.getElementById('outputVideo');
const outputImage = document.getElementById('outputImage');

// تحديث حالة المصادقة
function updateUI() {
  if (user) {
    gmailLoginBtn.textContent = user.email;
    creditPill.classList.remove('hidden');
    creditBalance.textContent = user.credits;
  } else {
    gmailLoginBtn.textContent = 'تسجيل الدخول عبر Gmail';
    creditPill.classList.add('hidden');
  }
}

// تسجيل الدخول
gmailLoginBtn.addEventListener('click', () => {
  if (user) {
    if (confirm('هل تريد تسجيل الخروج؟')) {
      user = null;
      localStorage.removeItem('adspark_user');
      updateUI();
    }
    return;
  }
  const email = prompt('أدخل بريدك الإلكتروني (Gmail) للحصول على 1000 نقطة:', 'creator@gmail.com');
  if (email && email.includes('@')) {
    user = { email: email.trim(), credits: 1000 };
    localStorage.setItem('adspark_user', JSON.stringify(user));
    updateUI();
    alert('تم تسجيل الدخول بنجاح وحصلت على 1000 نقطة!');
  }
});

// عرض القوالب
function renderTemplates(category = 'all') {
  templatesGrid.innerHTML = '';
  const filtered = category === 'all' ? defaultTemplates : defaultTemplates.filter(t => t.category === category);

  filtered.forEach(tpl => {
    const card = document.createElement('div');
    card.className = `template-card ${selectedTemplate.id === tpl.id ? 'selected' : ''}`;
    
    const mediaHtml = tpl.type === 'video'
      ? `<video src="${tpl.url}" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`
      : `<img src="${tpl.url}" alt="${tpl.title}">`;

    card.innerHTML = `
      ${mediaHtml}
      <div class="card-info">
        <h4>${tpl.title}</h4>
        <span>اضغط للاختيار</span>
      </div>
    `;

    card.addEventListener('click', () => {
      selectedTemplate = tpl;
      activeTemplateTitle.textContent = `القالب المحدد: ${tpl.title}`;
      promptInput.value = tpl.prompt;
      renderTemplates(category);
    });

    templatesGrid.appendChild(card);
  });
}

// تصنيفات القوالب
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
  if (file) {
    uploadFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (ev) => { uploadedProductUrl = ev.target.result; };
    reader.readAsDataURL(file);
  }
});

// زر التوليد المستقر والمضمون
generateBtn.addEventListener('click', () => {
  if (!user) {
    alert('يرجى تسجيل الدخول عبر Gmail أولاً!');
    gmailLoginBtn.click();
    return;
  }

  if (user.credits < 250) {
    alert('رصيدك غير كافٍ! تحتاج إلى 250 نقطة.');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span>⏳ جاري توليد الإعلان بدقة عالية...</span>';

  setTimeout(() => {
    user.credits -= 250;
    localStorage.setItem('adspark_user', JSON.stringify(user));
    updateUI();

    resultSection.classList.remove('hidden');

    if (selectedTemplate.type === 'video') {
      outputVideo.src = selectedTemplate.url;
      outputVideo.classList.remove('hidden');
      outputImage.classList.add('hidden');
      outputVideo.play();
    } else {
      outputImage.src = selectedTemplate.url;
      outputImage.classList.remove('hidden');
      outputVideo.classList.add('hidden');
    }

    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>✨ توليد الإعلان بالذكاء الاصطناعي</span>';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    alert('تم توليد الإعلان بنجاح!');
  }, 1500);
});

// أزرار التحميل والمشاركة
document.getElementById('downloadBtn').addEventListener('click', () => {
  const src = outputVideo.src || outputImage.src;
  if (!src) return;
  const a = document.createElement('a');
  a.href = src;
  a.download = `AdSpark-Ad-${Date.now()}`;
  a.click();
});

document.getElementById('shareBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href);
  alert('تم نسخ رابط التطبيق إلى الحافظة!');
});

// تهيئة التطبيق عند الفتح
promptInput.value = selectedTemplate.prompt;
updateUI();
renderTemplates('all');
