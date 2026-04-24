/* =========================================
   AuraX Earbuds — Landing Page JS
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ---- STICKY HEADER SHADOW ----
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // ---- QTY SELECTOR ----
  const qtyInput  = document.getElementById('qty-input');
  const qtyMinus  = document.getElementById('qty-minus');
  const qtyPlus   = document.getElementById('qty-plus');

  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', function () {
      const val = parseInt(qtyInput.value, 10);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', function () {
      const val = parseInt(qtyInput.value, 10);
      if (val < 10) qtyInput.value = val + 1;
    });
  }

  // ---- FAQ ACCORDION ----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = other.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = null;
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- ADD TO CART — ALL FORMS ----
  const atcForms = document.querySelectorAll('.atc-form, .atc-form-mini, .atc-form-final');

  atcForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Adding...</span>';

      const formData = new FormData(form);

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:       formData.get('id'),
          quantity: parseInt(formData.get('quantity') || '1', 10)
        })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Cart error');
          return res.json();
        })
        .then(function () {
          submitBtn.innerHTML = '✅ Added to Cart!';
          submitBtn.style.background = '#1a8a6a';
          setTimeout(function () {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
          }, 2500);
          // Update cart count if theme supports it
          updateCartCount();
        })
        .catch(function (err) {
          console.error('Cart error:', err);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          alert('Something went wrong. Please try again.');
        });
    });
  });

  // ---- BUY NOW (add then redirect) ----
  window.addAndCheckout = function (e, variantId) {
    e.preventDefault();
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    })
      .then(function () { window.location.href = '/checkout'; })
      .catch(function () { window.location.href = '/checkout'; });
  };

  // ---- UPDATE CART COUNT ----
  function updateCartCount() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        const badges = document.querySelectorAll('.cart-count');
        badges.forEach(function (el) { el.textContent = cart.item_count; });
      })
      .catch(function () {});
  }

  // ---- SCROLL REVEAL ----
  const revealEls = document.querySelectorAll(
    '.feature-card, .review-card, .trust-item, .gallery-item, .faq-item'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  // ---- VARIANT SELECTOR SYNC ----
  // If there's a variant select, sync hidden inputs across forms
  const variantSelect = document.getElementById('variant-select');
  if (variantSelect) {
    variantSelect.addEventListener('change', function () {
      const val = this.value;
      document.querySelectorAll('input[name="id"]').forEach(function (inp) {
        inp.value = val;
      });
    });
  }

});
