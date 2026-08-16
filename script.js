/**
 * Salina Shrestha - Modern CV Web App
 * Interactive Features: Profile Photo Manager, Crystal-Clear PDF Export, Theme Customizer, Native Print, Clipboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Core Elements
  const cvDocument = document.getElementById('cv-document');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const printBtn = document.getElementById('print-btn');
  const copyContactBtn = document.getElementById('copy-contact-btn');
  const themeButtons = document.querySelectorAll('.color-btn');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // Profile Photo Elements
  const photoUploadInput = document.getElementById('photo-upload-input');
  const profilePhotoImg = document.getElementById('profile-photo-img');
  const brandAvatarImg = document.querySelector('.brand-avatar-img');

  let isGeneratingPdf = false;

  /* ---------------------------------------------------------
     1. Toast Notification System
  --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message, iconClass = 'fa-circle-check') {
    if (!toast || !toastMessage) return;

    if (toastTimer) clearTimeout(toastTimer);

    const icon = toast.querySelector('.toast-icon');
    if (icon) {
      icon.className = `toast-icon fa-solid ${iconClass}`;
    }

    toastMessage.textContent = message;
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  /* ---------------------------------------------------------
     2. Profile Photo Live Upload & Persistence
  --------------------------------------------------------- */
  const savedPhoto = localStorage.getItem('salina_cv_photo');
  if (savedPhoto) {
    if (profilePhotoImg) profilePhotoImg.src = savedPhoto;
    if (brandAvatarImg) brandAvatarImg.src = savedPhoto;
  }

  if (photoUploadInput) {
    photoUploadInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', 'fa-triangle-exclamation');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        if (profilePhotoImg) profilePhotoImg.src = base64Data;
        if (brandAvatarImg) brandAvatarImg.src = base64Data;
        try {
          localStorage.setItem('salina_cv_photo', base64Data);
        } catch (storageErr) {
          console.warn('Image too large for localStorage, displayed for session only.');
        }
        showToast('Profile photo updated!', 'fa-camera');
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------------------------------------------------
     3. High-Fidelity, High-Resolution PDF Export
     Uses in-DOM capture mode with explicit dimensions & font readiness
  --------------------------------------------------------- */
  async function generatePDF() {
    if (isGeneratingPdf || !cvDocument) return;

    // Check if html2pdf is available
    if (typeof html2pdf === 'undefined') {
      showToast('Opening native browser print...', 'fa-print');
      window.print();
      return;
    }

    try {
      isGeneratingPdf = true;
      if (downloadPdfBtn) {
        downloadPdfBtn.disabled = true;
        downloadPdfBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> <span>Generating...</span>';
      }
      showToast('Preparing high-resolution PDF document...', 'fa-circle-info');

      // Scroll to top for coordinate accuracy
      window.scrollTo(0, 0);

      // Apply in-DOM desktop A4 export mode
      document.body.classList.add('pdf-export-mode');

      // Ensure fonts and icons are fully loaded and rendered
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // Small delay for DOM layout reflow
      await new Promise(resolve => setTimeout(resolve, 150));

      const opt = {
        margin: [6, 6, 6, 6], // margins in mm
        filename: 'Salina_Shrestha_CV.pdf',
        image: { 
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2.5, // 2.5x scale for sharp text without memory issues
          useCORS: true,
          letterRendering: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { 
          mode: ['avoid-all', 'css', 'legacy'] 
        }
      };

      // Generate PDF from the visible cvDocument
      await html2pdf().set(opt).from(cvDocument).save();

      showToast('CV downloaded successfully!', 'fa-circle-check');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showToast('PDF generator error. Launching browser print...', 'fa-triangle-exclamation');
      setTimeout(() => {
        window.print();
      }, 400);
    } finally {
      document.body.classList.remove('pdf-export-mode');
      if (downloadPdfBtn) {
        downloadPdfBtn.disabled = false;
        downloadPdfBtn.innerHTML = '<i class="fa-solid fa-download"></i> <span id="download-btn-text">Download PDF</span>';
      }
      isGeneratingPdf = false;
    }
  }

  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', (e) => {
      e.preventDefault();
      generatePDF();
    });
  }

  /* ---------------------------------------------------------
     4. Native Print Handler (Vector PDF Fallback)
  --------------------------------------------------------- */
  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }

  /* ---------------------------------------------------------
     5. Theme Accent Switcher & LocalStorage Persistence
  --------------------------------------------------------- */
  const savedTheme = localStorage.getItem('salina_cv_theme') || 'navy';
  applyTheme(savedTheme);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      applyTheme(theme);
      localStorage.setItem('salina_cv_theme', theme);
      showToast(`Style updated: ${capitalize(theme)}`, 'fa-palette');
    });
  });

  function applyTheme(themeName) {
    if (!themeName) return;

    if (themeName === 'navy') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }

    themeButtons.forEach(btn => {
      if (btn.getAttribute('data-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ---------------------------------------------------------
     6. Copy Contact Details to Clipboard
  --------------------------------------------------------- */
  if (copyContactBtn) {
    copyContactBtn.addEventListener('click', async () => {
      const contactData = [
        'SALINA SHRESTHA',
        'Promotions, Customer Service & Administration Specialist',
        '----------------------------------------',
        'Location: Siddhartha Chowk, Pokhara',
        'Phone: +977 9827124170',
        'Email: salina_stha1823@hotmail.com',
        'Nationality: Nepalese'
      ].join('\n');

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(contactData);
        } else {
          const tempTextArea = document.createElement('textarea');
          tempTextArea.value = contactData;
          tempTextArea.style.position = 'fixed';
          tempTextArea.style.left = '-999999px';
          document.body.appendChild(tempTextArea);
          tempTextArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempTextArea);
        }
        showToast('Contact copied to clipboard!', 'fa-copy');
      } catch (err) {
        console.error('Failed to copy text:', err);
        showToast('Could not copy text.', 'fa-triangle-exclamation');
      }
    });
  }

  /* ---------------------------------------------------------
     7. Keyboard Shortcut (Ctrl/Cmd + S -> Download PDF)
  --------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      generatePDF();
    }
  });
});
