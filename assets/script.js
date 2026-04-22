/* ============================================================
   TECHZONE HYD — SHOPIFY THEME JAVASCRIPT
   ============================================================ */

// ── IMAGE SWITCHER ──────────────────────────────────────────
function changeImage(el) {
  var src = el.getAttribute('data-src');
  if (!src) return;
  var mainImg = document.getElementById('mainProductImage');
  if (mainImg) {
    mainImg.src = src;
  }
  document.querySelectorAll('.thumb').forEach(function(t) {
    t.classList.remove('active');
  });
  el.classList.add('active');
}

// ── VARIANT SELECTOR ────────────────────────────────────────
function selectOption(el, optionName, optionValue) {
  // Update visual selection
  var siblings = el.parentElement.querySelectorAll('.color-opt, .size-opt');
  siblings.forEach(function(s) { s.classList.remove('selected'); });
  el.classList.add('selected');

  // Update displayed label
  var parentSection = el.closest('.option-section');
  if (parentSection) {
    var label = parentSection.querySelector('.option-label span');
    if (label) label.textContent = optionValue;
  }

  // Find matching variant
  if (typeof productVariants === 'undefined') return;
  updateSelectedOptions(optionName, optionValue);
}

var currentOptions = {};

function updateSelectedOptions(changedOption, changedValue) {
  currentOptions[changedOption] = changedValue;

  if (typeof productVariants === 'undefined') return;

  var matchedVariant = null;
  for (var i = 0; i < productVariants.length; i++) {
    var variant = productVariants[i];
    var matches = true;
    var optionKeys = Object.keys(currentOptions);
    for (var j = 0; j < optionKeys.length; j++) {
      var key = optionKeys[j];
      var val = currentOptions[key];
      if (variant['option' + (j + 1)] !== val) {
        // Try matching by option position
        var optFound = false;
        for (var k = 1; k <= 3; k++) {
          if (variant['option' + k] === val) {
            optFound = true;
            break;
          }
        }
        if (!optFound) { matches = false; break; }
      }
    }
    if (matches) { matchedVariant = variant; break; }
  }

  // Fall back to first available variant matching the changed option
  if (!matchedVariant) {
    for (var i = 0; i < productVariants.length; i++) {
      var variant = productVariants[i];
      if (variant.option1 === changedValue ||
          variant.option2 === changedValue ||
          variant.option3 === changedValue) {
        matchedVariant = variant;
        break;
      }
    }
  }

  if (matchedVariant) {
    updateVariantUI(matchedVariant);
  }
}

function updateVariantUI(variant) {
  // Update hidden variant ID input
  var variantInput = document.getElementById('variantId');
  if (variantInput) variantInput.value = variant.id;

  // Update price display
  var priceEl = document.getElementById('productPrice');
  if (priceEl && variant.price) {
    priceEl.textContent = formatMoney(variant.price);
  }

  // Update add to cart button
  var addToCartBtn = document.getElementById('addToCart');
  if (addToCartBtn) {
    if (variant.available) {
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = 'Confirm Order — Pay Rs.99 Now';
    } else {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Out of Stock';
    }
  }
}

function formatMoney(cents) {
  var rupees = (cents / 100).toFixed(0);
  return 'Rs.' + parseInt(rupees).toLocaleString('en-IN');
}

// ── ADD TO CART HANDLER ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('product-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = document.getElementById('addToCart');
      if (btn) {
        var original = btn.textContent;
        btn.textContent = 'Adding to cart...';
        btn.disabled = true;
      }

      var formData = new FormData(form);
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.get('id'),
          quantity: 1
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.id) {
          window.location.href = '/cart';
        } else {
          if (btn) {
            btn.textContent = original;
            btn.disabled = false;
          }
          alert('Unable to add to cart. Please try again.');
        }
      })
      .catch(function() {
        if (btn) {
          btn.textContent = original;
          btn.disabled = false;
        }
        alert('Something went wrong. Please try again.');
      });
    });
  }
});

// ── FAQ TOGGLE ───────────────────────────────────────────────
function toggleFaq(el) {
  var item = el.parentElement;
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(f) {
    f.classList.remove('open');
  });
  if (!isOpen) {
    item.classList.add('open');
  }
}

// ── WHATSAPP HANDLER ─────────────────────────────────────────
function handleWhatsapp() {
  var productTitle = document.querySelector('.p-title')
    ? document.querySelector('.p-title').textContent.trim()
    : 'your product';
  var msg = encodeURIComponent(
    'Hi TechZone! I want to order ' + productTitle + '. Please confirm availability and delivery time.'
  );
  // Replace with your actual WhatsApp number
  window.open('https://wa.me/919000000000?text=' + msg, '_blank');
}

// ── INTERSECTION OBSERVER (Fade-Up Animations) ───────────────
document.addEventListener('DOMContentLoaded', function() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(function(el) {
    observer.observe(el);
  });
});
