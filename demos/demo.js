const mode = document.body.dataset.demo;

if (mode === 'restaurant') {
  const menu = [
    { ar: ['مسبّحة كريمية', 'فطور', 'حمص دافي، طحينة، زيت زيتون وعيش محمص.'], en: ['Creamy hummus', 'Breakfast', 'Warm hummus, tahini, olive oil and toasted bread.'], price: 95, icon: '✿' },
    { ar: ['فتة بيتية', 'أطباق', 'طبقات رز وعيش وصوص زبادي بالثوم.'], en: ['Fatteh, our way', 'Mains', 'Layers of rice, toasted bread and garlic yogurt.'], price: 145, icon: '✺' },
    { ar: ['سلطة الموسم', 'أطباق', 'خضار طازة، أعشاب ودبس رمان.'], en: ['Seasonal salad', 'Mains', 'Fresh greens, herbs and pomegranate molasses.'], price: 110, icon: '❋' },
    { ar: ['كنافة بالقشطة', 'حلو', 'كنافة فرن وقشطة طازة وشربات خفيف.'], en: ['Kunafa with cream', 'Dessert', 'Oven-baked kunafa, fresh cream and light syrup.'], price: 85, icon: '✳' },
    { ar: ['قهوة تركي', 'مشروبات', 'قهوة مطحونة طازة على الرمل.'], en: ['Turkish coffee', 'Drinks', 'Fresh-ground coffee, slowly brewed.'], price: 45, icon: '☕' },
    { ar: ['ليمون بالنعناع', 'مشروبات', 'ليمون طازة ونعناع وسكر حسب الطلب.'], en: ['Mint lemonade', 'Drinks', 'Fresh lemon, mint and your choice of sweetness.'], price: 60, icon: '❋' },
  ];
  const copy = {
    ar: { title:'زعفران وحجر | نموذج مطعم',nav:['القائمة','قصتنا','زورونا'],footer:'© 2026 زعفران وحجر · نموذج تجريبي',categories: ['الكل', 'فطور', 'أطباق', 'حلو', 'مشروبات'], hero: 'أكل طيب،<br><em>ولمّة أحلى.</em>', location: 'نكهات من أرضنا · القاهرة', lead: 'مكونات موسمية، وصفات بيتية، ووقت حلو على مهل.', menuKicker: 'من مطبخنا', menuTitle: 'اختار اللي بتحبه', menuLink: 'اكتشف القائمة ↓', storyKicker: 'حكاية المكان', storyTitle: 'سفرة تجمعنا.', story: 'مطبخ بسيط يحتفي بالموسم وبالناس اللي حوالين السفرة. كل طبق معمول بمكونات طازة ولمسة من البيت.', gallery: 'معرض المكان', hours: 'ساعات العمل', daily: 'كل يوم', time: '١٢ ظهراً — ١٢ منتصف الليل', address: 'ميدان المعادي، القاهرة', map: 'مكانك هنا · خريطة توضيحية', reserve: 'احجز ترابيزتك', name: 'اسمك', guests: 'عدد الأفراد', date: 'التاريخ', submit: 'اطلب الحجز على واتساب', order: 'اطلب على واتساب ↗', confirmation: 'سيتم فتح واتساب لإرسال طلب الحجز.' },
    en: { title:'Saffron & Stone | Restaurant concept',nav:['Menu','Our story','Visit us'],footer:'© 2026 Saffron & Stone · Concept demo',categories: ['All', 'Breakfast', 'Mains', 'Dessert', 'Drinks'], hero: 'Good food,<br><em>better company.</em>', location: 'Seasonal food · Cairo', lead: 'Seasonal ingredients, home-style recipes and time well spent.', menuKicker: 'From our kitchen', menuTitle: 'Find your favorite', menuLink: 'Explore the menu ↓', storyKicker: 'Our story', storyTitle: 'A table brings us together.', story: 'A simple kitchen celebrating the season and the people around the table. Every dish is made with fresh ingredients and a touch of home.', gallery: 'A look around', hours: 'Opening hours', daily: 'Every day', time: '12 pm — 12 am', address: 'Maadi Square, Cairo', map: 'Map location placeholder', reserve: 'Reserve a table', name: 'Your name', guests: 'Guests', date: 'Date', submit: 'Request on WhatsApp', order: 'Order on WhatsApp ↗', confirmation: 'WhatsApp will open with your reservation request.' },
  };
  let language = 'ar';
  let category = 'الكل';
  const filters = document.querySelector('#filters');
  const dishes = document.querySelector('#dishes');
  const t = key => copy[language][key];
  function renderMenu() {
    filters.innerHTML = t('categories').map(label => `<button class="${category === label ? 'active' : ''}" type="button">${label}</button>`).join('');
    filters.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { category = button.textContent; renderMenu(); }));
    dishes.innerHTML = menu.filter(item => category === t('categories')[0] || item[language][1] === category).map(item => `<article class="dish"><div class="dish-art" aria-hidden="true">${item.icon}</div><h3>${item[language][0]}</h3><p>${item[language][2]}</p><b>${item.price} ${language === 'ar' ? 'ج.م' : 'EGP'}</b></article>`).join('');
  }
  function renderCopy() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    const set = (selector, value) => { const element = document.querySelector(selector); if (element) element.innerHTML = value; };
    set('.r-hero h1', t('hero')); set('.r-hero>small', t('location')); set('.r-hero>p', t('lead')); set('.r-cta', t('menuLink'));
    set('#menu>.eyebrow', t('menuKicker')); set('#menu>h2', t('menuTitle')); set('.story .eyebrow', t('storyKicker')); set('.story h2', t('storyTitle'));
    set('.story>div>p:not(.eyebrow)', t('story')); set('.story h3', t('gallery')); set('.story aside>p:first-child', t('hours')); set('.story aside>b', t('daily'));
    set('.story aside>p:nth-of-type(2)', t('time')); set('.story aside>p:nth-of-type(3)', t('address')); set('.map', t('map')); set('#reserve h3', t('reserve'));
    const form = document.querySelector('#reserve');
    form.elements.name.placeholder = t('name'); form.elements.name.setAttribute('aria-label', t('name'));
    form.elements.people.placeholder = t('guests'); form.elements.people.setAttribute('aria-label', t('guests'));
    form.elements.date.setAttribute('aria-label', t('date')); form.querySelector('button').textContent = t('submit');
    document.querySelector('.order').textContent = t('order');
    document.querySelectorAll('header nav a').forEach((link, index) => { link.textContent = t('nav')[index]; });
    document.querySelector('footer').textContent = t('footer'); document.title = t('title');
    document.querySelector('.lang').textContent = language === 'ar' ? 'EN' : 'عربي';
  }
  renderMenu(); renderCopy();
  document.querySelector('.lang').addEventListener('click', () => { language = language === 'ar' ? 'en' : 'ar'; category = copy[language].categories[0]; renderMenu(); renderCopy(); });
  document.querySelector('#reserve').addEventListener('submit', event => {
    event.preventDefault(); if (!event.currentTarget.reportValidity()) return;
    const form = new FormData(event.currentTarget);
    const message = language === 'ar' ? `حجز باسم ${form.get('name')}، عدد الأفراد ${form.get('people')}، التاريخ ${form.get('date')}` : `Reservation for ${form.get('name')}, ${form.get('people')} guests, date ${form.get('date')}`;
    window.open(`https://wa.me/201020599210?text=${encodeURIComponent(message)}`, '_blank');
    event.currentTarget.querySelector('output').textContent = t('confirmation');
  });
}

if (mode === 'clinic') {
  document.querySelector('#booking').addEventListener('submit', event => {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) event.currentTarget.querySelector('output').textContent = 'Thanks. Your appointment request is ready for the clinic to follow up.';
  });
}

if (mode === 'store') {
  const products = [
    { id: 1, name: 'Stoneware cup', category: 'Kitchen', price: 18, icon: '◒', description: 'A tactile everyday cup, formed in small batches.' },
    { id: 2, name: 'Linen tea towel', category: 'Textiles', price: 24, icon: '▤', description: 'Soft washed linen for daily kitchen rituals.' },
    { id: 3, name: 'Olive wood spoon', category: 'Kitchen', price: 12, icon: '⌁', description: 'A simple spoon cut from responsibly sourced wood.' },
    { id: 4, name: 'Woven market tote', category: 'Bags', price: 32, icon: '▱', description: 'Roomy, durable and ready for everyday errands.' },
    { id: 5, name: 'Speckled serving bowl', category: 'Kitchen', price: 42, icon: '◡', description: 'A generous serving bowl with a quiet glaze.' },
    { id: 6, name: 'Cotton cushion cover', category: 'Textiles', price: 36, icon: '▧', description: 'Textured cotton in a versatile, natural tone.' },
  ];
  let category = 'All';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('cg-cart') || '[]').filter(item => products.some(product => product.id === item.id) && Number.isInteger(item.qty) && item.qty > 0); } catch { cart = []; }
  const productGrid = document.querySelector('#products');
  const cartPanel = document.querySelector('#cart');
  const modalPanel = document.querySelector('#product-modal');
  let lastProductFocus = null;
  function draw() {
    let visible = category === 'All' ? [...products] : products.filter(product => product.category === category);
    const sort = document.querySelector('#sort').value;
    if (sort === 'low') visible.sort((a, b) => a.price - b.price);
    if (sort === 'high') visible.sort((a, b) => b.price - a.price);
    productGrid.innerHTML = visible.map(product => `<div class="product" data-id="${product.id}" tabindex="0" role="button"><div class="product-art" aria-hidden="true">${product.icon}</div><div class="product-info"><div><h3>${product.name}</h3><p>${product.category}</p></div><b>$${product.price}</b></div></div>`).join('');
    productGrid.querySelectorAll('.product').forEach(item => {
      item.addEventListener('click', () => openProduct(Number(item.dataset.id)));
      item.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openProduct(Number(item.dataset.id)); } });
    });
    document.querySelector('#cart-count').textContent = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelector('#cart-items').innerHTML = cart.map(item => { const product = products.find(entry => entry.id === item.id); return `<div class="cart-line"><span>${product.name} × ${item.qty}</span><b>$${product.price * item.qty}</b><button type="button" data-remove="${product.id}">Remove</button></div>`; }).join('');
    document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => { cart = cart.filter(item => item.id !== Number(button.dataset.remove)); save(); }));
    document.querySelector('#total').textContent = `$${cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.qty, 0)}`;
  }
  function save() { try { localStorage.setItem('cg-cart', JSON.stringify(cart)); } catch { /* Cart stays usable in memory without storage. */ } draw(); }
  function openProduct(id) {
    lastProductFocus = document.activeElement;
    const product = products.find(item => item.id === id);
    document.querySelector('#modal-title').textContent = product.name;
    document.querySelector('#modal-category').textContent = product.category;
    document.querySelector('#modal-desc').textContent = product.description;
    document.querySelector('#modal-price').textContent = `$${product.price}`;
    document.querySelector('.modal-art').textContent = product.icon;
    modalPanel.hidden = false;
    document.querySelector('#modal-add').onclick = () => { const existing = cart.find(item => item.id === id); if (existing) existing.qty += 1; else cart.push({ id, qty: 1 }); save(); closeModal(); };
    document.querySelector('.modal-close').focus();
  }
  function closeCart() { cartPanel.classList.remove('open'); cartPanel.setAttribute('aria-hidden', 'true'); cartPanel.inert = true; document.querySelector('.cart-toggle').setAttribute('aria-expanded', 'false'); document.querySelector('.backdrop').classList.remove('show'); document.querySelector('.cart-toggle').focus(); }
  function closeModal() { modalPanel.hidden = true; lastProductFocus?.focus(); }
  const categories = ['All', 'Kitchen', 'Textiles', 'Bags'];
  document.querySelector('#filters').innerHTML = categories.map(value => `<button type="button" class="${category === value ? 'active' : ''}">${value}</button>`).join('');
  document.querySelectorAll('#filters button').forEach(button => button.addEventListener('click', () => { category = button.textContent; document.querySelectorAll('#filters button').forEach(item => item.classList.toggle('active', item === button)); draw(); }));
  document.querySelector('#sort').addEventListener('change', draw);
  document.querySelector('.cart-toggle').addEventListener('click', () => { cartPanel.inert = false; cartPanel.classList.add('open'); cartPanel.setAttribute('aria-hidden', 'false'); document.querySelector('.cart-toggle').setAttribute('aria-expanded', 'true'); document.querySelector('.backdrop').classList.add('show'); document.querySelector('.cart-close').focus(); });
  document.querySelector('.cart-close').addEventListener('click', closeCart);
  document.querySelector('.backdrop').addEventListener('click', closeCart);
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (cartPanel.classList.contains('open')) closeCart(); if (!modalPanel.hidden) closeModal(); return; }
    if (event.key !== 'Tab') return;
    const dialog = !modalPanel.hidden ? modalPanel : cartPanel.classList.contains('open') ? cartPanel : null;
    if (!dialog) return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')].filter(control => control.getClientRects().length);
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.querySelector('#checkout').addEventListener('submit', event => { event.preventDefault(); if (event.currentTarget.reportValidity()) event.currentTarget.querySelector('output').textContent = 'Demo order complete. No payment was taken.'; });
  draw();
}

document.documentElement.classList.add('site-ready');
