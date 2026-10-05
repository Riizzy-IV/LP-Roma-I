// ===== Configuração de contato (preencher com os dados reais) =====
const CONTATO = {
  telefone: '15996698834',   // (15) 99669-8834 — DDD + número, só dígitos
  whatsapp: '5515996698834', // 55 + DDD + número
  mensagemWhatsapp: 'Olá! Gostaria de mais informações sobre o Condomínio Edifício Roma I.',
  formEndpoint: '',  // URL que recebe o POST do formulário (CRM, Formspree, webhook...)
};

(function () {
  // Ano do copyright sempre atualizado
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  const header = document.getElementById('header');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const navLinks = links.querySelectorAll('.nav__link');

  // Menu mobile
  function setMenu(open) {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  toggle.addEventListener('click', () => setMenu(!links.classList.contains('is-open')));
  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // Sombra no header ao rolar
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Link ativo conforme a seção visível
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
  }

  // ===== Galeria: abas + carrossel + lightbox =====
  const track = document.getElementById('galeria-track');
  if (track) {
    const slides = Array.from(track.querySelectorAll('.galeria__slide'));
    const tabs = document.querySelectorAll('.galeria__tab');
    const prev = document.getElementById('galeria-prev');
    const next = document.getElementById('galeria-next');

    function step() {
      const visible = slides.find((s) => !s.hidden);
      if (!visible) return track.clientWidth;
      return visible.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
    }

    function updateArrows() {
      const max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    }

    prev.addEventListener('click', () => track.scrollBy({ left: -step() }));
    next.addEventListener('click', () => track.scrollBy({ left: step() }));
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
        });
        slides.forEach((s) => {
          s.hidden = s.dataset.cat !== tab.dataset.filter;
        });
        track.scrollTo({ left: 0, behavior: 'auto' });
        updateArrows();
      });
    });

    updateArrows();

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');

    function openLightbox(img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    }

    track.addEventListener('click', (e) => {
      const btn = e.target.closest('.galeria__expand');
      if (btn) openLightbox(btn.parentElement.querySelector(':scope > img'));
    });
    const plantaZoom = document.getElementById('planta-zoom');
    if (plantaZoom) {
      plantaZoom.addEventListener('click', () => openLightbox(plantaZoom.querySelector('img')));
    }

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  // ===== Contato: links de telefone/WhatsApp =====
  document.querySelectorAll('[data-contact]').forEach((link) => {
    if (link.dataset.contact === 'telefone' && CONTATO.telefone) {
      link.href = 'tel:+55' + CONTATO.telefone;
    } else if (link.dataset.contact === 'whatsapp' && CONTATO.whatsapp) {
      link.href = 'https://wa.me/' + CONTATO.whatsapp + '?text=' + encodeURIComponent(CONTATO.mensagemWhatsapp);
    } else {
      // Sem número configurado: leva ao formulário
      link.href = '#contato-form';
      link.removeAttribute('target');
    }
  });

  // ===== Contato: formulário =====
  const form = document.getElementById('contato-form');
  if (form) {
    const feedback = document.getElementById('contato-feedback');
    const tel = form.elements.telefone;
    const submit = form.querySelector('.contato__submit');

    // Máscara (00) 00000-0000
    tel.addEventListener('input', () => {
      const d = tel.value.replace(/\D/g, '').slice(0, 11);
      let v = d;
      if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      tel.value = v;
    });

    const rules = {
      nome: (v) => v.trim().split(/\s+/).length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      telefone: (v) => v.replace(/\D/g, '').length >= 10,
    };

    form.querySelectorAll('.contato__input').forEach((input) => {
      input.addEventListener('input', () => input.classList.remove('is-invalid'));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let firstInvalid = null;
      Object.keys(rules).forEach((name) => {
        const input = form.elements[name];
        const ok = rules[name](input.value);
        input.classList.toggle('is-invalid', !ok);
        if (!ok && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        feedback.textContent = 'Confira os campos destacados: nome completo, e-mail e telefone com DDD.';
        firstInvalid.focus();
        return;
      }

      const data = Object.fromEntries(new FormData(form));

      // Sem endpoint configurado: envia os dados pelo WhatsApp
      if (!CONTATO.formEndpoint && CONTATO.whatsapp) {
        const texto = [
          'Olá! Gostaria de mais informações sobre o Condomínio Edifício Roma I.',
          '',
          '*Nome:* ' + data.nome.trim(),
          '*E-mail:* ' + data.email.trim(),
          '*Telefone:* ' + data.telefone,
          data.mensagem.trim() ? '*Mensagem:* ' + data.mensagem.trim() : '',
        ].filter((linha, i) => linha || i === 1).join('\n');
        window.open('https://wa.me/' + CONTATO.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
        form.reset();
        feedback.textContent = 'Obrigado! Abrimos o WhatsApp com seus dados — é só enviar a mensagem.';
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Enviando...';

      try {
        if (CONTATO.formEndpoint) {
          const res = await fetch(CONTATO.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
        }
        form.reset();
        feedback.textContent = 'Obrigado! Recebemos seus dados e em breve entraremos em contato.';
      } catch (err) {
        feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.';
      } finally {
        submit.disabled = false;
        submit.textContent = 'Solicitar contato';
      }
    });
  }
})();
