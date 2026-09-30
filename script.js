const landing = document.querySelector('#landing');
const invitation = document.querySelector('#invitation');
const openInvite = document.querySelector('#openInvite');
const musicButton = document.querySelector('#musicButton');
const musicHint = document.querySelector('#musicHint');
const backgroundMusic = document.querySelector('#backgroundMusic');
const openingBurst = document.querySelector('#openingBurst');
const params = new URLSearchParams(window.location.search);

const guest = params.get('guest')?.trim().toLocaleUpperCase();
document.querySelectorAll('[data-guest]').forEach((element) => {
  element.textContent = guest ? `Thân mời: ${guest}` : 'Thân Mời';
});

document.querySelectorAll('[data-guest-in]').forEach((element) => {
  element.textContent = guest ? `Thân mời: ${guest}` : '';
});

const guestInput = document.querySelector('input[name="guest"]');
if (guestInput && guest) {
  guestInput.value = guest;
}

backgroundMusic.volume = 0.5;

function setMusicState(isPlaying) {
  musicButton.classList.toggle('music-button--active', isPlaying);
  musicButton.setAttribute('aria-label', isPlaying ? 'Tắt nhạc nền' : 'Phát nhạc');
  musicHint.classList.remove('music-hint--visible');
}

async function playMusic() {
  try {
    await backgroundMusic.play();
    setMusicState(true);
    return true;
  } catch {
    setMusicState(false);
    musicHint.classList.add('music-hint--visible');
    return false;
  }
}

function pauseMusic() {
  backgroundMusic.pause();
  setMusicState(false);
}

backgroundMusic.addEventListener('play', () => setMusicState(true));
backgroundMusic.addEventListener('pause', () => setMusicState(false));
backgroundMusic.addEventListener('error', () => {
  musicHint.textContent = 'Không thể tải nhạc';
  musicHint.classList.add('music-hint--visible');
});

musicButton.addEventListener('click', () => {
  if (backgroundMusic.paused) playMusic();
  else pauseMusic();
});

let autoScrollFrame;
let autoScrollTimer;
let autoScrollEnabled = false;
let autoScrollLastTime = 0;

function stopAutoScroll() {
  autoScrollEnabled = false;
  window.clearTimeout(autoScrollTimer);
  window.cancelAnimationFrame(autoScrollFrame);
}

function createOpeningBurst() {
  const burst = [
    [-170, -115], [-128, -82], [-88, -132], [-48, -95], [0, -142], [48, -102], [92, -130], [135, -78], [176, -112],
    [-182, -30], [-136, -12], [-92, -42], [-44, -18], [0, -55], [46, -20], [96, -42], [141, -10], [184, -31],
    [-126, 56], [-74, 70], [-24, 48], [30, 70], [80, 46], [132, 60],
  ];
  const colors = ['#ffc107', '#ff6b6b', '#ffe066', '#ffd700'];
  openingBurst.replaceChildren(...burst.map(([x, y], index) => {
    const character = document.createElement('span');
    character.textContent = '囍';
    character.style.setProperty('--burst-x', `${x}px`);
    character.style.setProperty('--burst-y', `${y}px`);
    character.style.setProperty('--burst-rotation', `${(index % 2 ? -1 : 1) * (50 + index * 13)}deg`);
    character.style.setProperty('--burst-delay', `${Math.min(index * 18, 240)}ms`);
    character.style.setProperty('--burst-size', `${11 + (index % 4) * 4}px`);
    character.style.setProperty('--burst-color', colors[index % colors.length]);
    return character;
  }));
}

function startAutoScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  stopAutoScroll();
  autoScrollTimer = window.setTimeout(() => {
    autoScrollEnabled = true;
    autoScrollLastTime = performance.now();

    const scroll = (now) => {
      if (!autoScrollEnabled) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      // A background tab can resume with a very large animation-frame delta.
      // Cap it so reopening the tab never jumps several sections at once.
      const distance = (Math.min(now - autoScrollLastTime, 100) / 1000) * 50;
      autoScrollLastTime = now;

      if (window.scrollY >= maxScroll - 1) {
        stopAutoScroll();
        return;
      }

      window.scrollTo({ top: Math.min(maxScroll, window.scrollY + distance), behavior: 'instant' });
      autoScrollFrame = window.requestAnimationFrame(scroll);
    };

    autoScrollFrame = window.requestAnimationFrame(scroll);
  }, 2000);
}

['wheel', 'touchstart', 'mousedown', 'keydown'].forEach((eventName) => {
  document.addEventListener(eventName, stopAutoScroll, { passive: true });
});

function revealInvitation({ withAnimation = true } = {}) {
  if (withAnimation) {
    createOpeningBurst();
    landing.classList.add('landing--opening');
  }
  else landing.classList.add('landing--hidden');

  if (withAnimation) {
    const openedUrl = new URL(window.location.href);
    openedUrl.searchParams.set('open', '1');
    window.history.pushState({}, '', openedUrl);
  }

  // Calling play() in the button event's call stack preserves the browser user gesture.
  playMusic();

  window.setTimeout(() => {
    landing.classList.add('landing--hidden');
    document.body.classList.add('is-open');
    invitation.scrollIntoView({ block: 'start' });
    startAutoScroll();
  }, withAnimation ? 520 : 0);
}

openInvite.addEventListener('click', () => revealInvitation());

if (params.get('open') === '1') {
  revealInvitation({ withAnimation: false });
}

// A first interaction retries playback when the browser rejected non-gesture autoplay.
document.addEventListener('pointerdown', () => {
  if (backgroundMusic.paused && document.body.classList.contains('is-open')) playMusic();
}, { once: true, passive: true });

const photos = [
  'assets/wedding-2.jpg',  
  'assets/wedding-3.jpg',
  'assets/wedding-4.jpg',
  'assets/wedding-5.jpg',
  'assets/wedding-6.jpg',
  'assets/wedding-8.jpg',
  'assets/wedding-9.jpg',
  'assets/wedding-10.jpg',
  'assets/wedding-11.jpg',
  'assets/wedding-12.jpg',
  'assets/wedding-13.jpg',
  'assets/wedding-14.jpg',
  'assets/wedding-15.jpg',
  'assets/wedding-16.jpg',
  'assets/wedding-17.jpg',
  'assets/wedding-1.jpg',
];
const galleryStage = document.querySelector('#galleryStage');
let activePhoto = photos.length - 1;

const galleryCards = photos.map((photo, index) => {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = `gallery__card ${photo.endsWith('wedding-1.jpg') ? 'gallery__card--square' : 'gallery__card--portrait'}`;
  card.setAttribute('aria-label', `Xem ảnh cưới ${index + 1}`);
  const image = document.createElement('img');
  image.src = photo;
  image.alt = `Ảnh cưới ${index + 1}`;
  card.append(image);
  card.addEventListener('click', () => showPhoto(index));
  galleryStage.append(card);
  return card;
});

function showPhoto(index) {
  activePhoto = (index + photos.length) % photos.length;
  console.log(activePhoto);
  galleryCards.forEach((card, cardIndex) => {
    let distance = cardIndex - activePhoto;
    if (distance > photos.length / 2) distance -= photos.length;
    if (distance < -photos.length / 2) distance += photos.length;
    const depth = Math.abs(distance);
    const scale = depth === 0 ? 1 : depth === 1 ? .85 : .7;
    const opacity = depth === 0 ? 1 : depth === 1 ? .75 : depth === 2 ? .5 : .3;
    card.style.transform = `translateX(${distance * 60}%) translateZ(${-depth * 150}px) rotateY(${distance * 45}deg) scale(${scale})`;
    card.style.opacity = opacity;
    card.style.zIndex = String(100 - depth);
    card.setAttribute('aria-current', String(cardIndex === activePhoto));
  });
}

document.querySelector('#previousPhoto').addEventListener('click', () => showPhoto(activePhoto - 1));
document.querySelector('#nextPhoto').addEventListener('click', () => showPhoto(activePhoto + 1));
showPhoto(activePhoto);

let lastModalTrigger = null;

function openModal(id) {
  stopAutoScroll();
  const modal = document.querySelector(id);
  lastModalTrigger = document.activeElement;
  modal.classList.add('modal--open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  window.setTimeout(() => modal.querySelector('.modal__close').focus(), 80);
}

function closeModal(modal) {
  modal.classList.remove('modal--open');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal--open')) document.body.classList.remove('modal-open');
  if (lastModalTrigger instanceof HTMLElement) lastModalTrigger.focus();
}

// document.querySelector('#giftButton').addEventListener('click', () => openModal('#giftModal'));
document.querySelector('#rsvpButton').addEventListener('click', () => openModal('#rsvpModal'));
document.querySelectorAll('[data-close-modal]').forEach((button) => {
  button.addEventListener('click', () => closeModal(button.closest('.modal')));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') document.querySelectorAll('.modal--open').forEach(closeModal);
});

document.querySelector('#guestbookForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const article = document.createElement('article');
  article.className = 'wish';
  const name = document.createElement('strong');
  name.textContent = form.get('name');
  const stamp = document.createElement('time');
  stamp.textContent = 'Vừa xong';
  const heading = document.createElement('p');
  heading.append(name, stamp);
  const message = document.createElement('span');
  message.textContent = form.get('wish');
  article.append(heading, message);
  document.querySelector('#wishes').prepend(article);
  event.currentTarget.reset();
});

const magicWishButton = document.querySelector('.guestbook-form__magic');
const wishField = document.querySelector('#wishText');
const suggestedWishes = [
  'Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương và đồng hành cùng nhau trên mọi chặng đường!',
  'Chúc mừng ngày vui của hai bạn. Chúc tổ ấm nhỏ luôn đầy ắp tiếng cười và bình an!',
  'Chúc Ngọc Dung và Ngọc Ánh mãi nắm tay nhau, viết nên thật nhiều kỷ niệm đẹp trong hành trình mới!',
];
let suggestedWishIndex = 0;

magicWishButton.addEventListener('click', () => {
  wishField.value = suggestedWishes[suggestedWishIndex];
  suggestedWishIndex = (suggestedWishIndex + 1) % suggestedWishes.length;
  wishField.dispatchEvent(new Event('input', { bubbles: true }));
  wishField.focus();
  magicWishButton.classList.remove('guestbook-form__magic--used');
  window.requestAnimationFrame(() => magicWishButton.classList.add('guestbook-form__magic--used'));
});

document.querySelector('#rsvpForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.textContent = 'ĐÃ GỬI LỜI XÁC NHẬN';
  button.disabled = true;
  window.setTimeout(() => closeModal(form.closest('.modal')), 900);
});


document.addEventListener('DOMContentLoaded', () => {
  const rsvpForm = document.getElementById('rsvpForm');
  if (!rsvpForm) return;

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(rsvpForm);
    const data = {
      guest: formData.get('guest'),
      attendance: formData.get('attendance')
    };
    
    // Dán link Web App của bạn vào trong dấu nháy kép dưới đây:
    const scriptURL = 'https://script.google.com/macros/s/AKfycbzXlC9dlKx1fKZi_xVthEUuS8VydLhr7s84qkyjQLSa9gA_v5mYab3gfnBf24kt7Lwu/exec ';
    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    
    try {
      submitBtn.textContent = 'ĐANG GỬI...';
      submitBtn.disabled = true;

      await fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      alert('Cảm ơn bạn! Xác nhận tham dự đã được gửi thành công.');
      rsvpForm.reset();
      
      // Tự động đóng modal
      const closeModalBtn = document.querySelector('[data-close-modal]');
      if (closeModalBtn) closeModalBtn.click();

    } catch (error) {
      console.error('Lỗi:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại sau nhé!');
    } finally {
      submitBtn.textContent = 'GỬI XÁC NHẬN';
      submitBtn.disabled = false;
    }
  });
});