/* popUp.js - Combined popup functionality */
document.addEventListener('DOMContentLoaded', function() {
    // Logo process popup
    const popup = document.getElementById('imagePopup');
    const openBtn = document.getElementById('openPopup');
    const closeBtn = document.getElementById('closePopup');
    
    if (openBtn && popup && closeBtn) {
      openBtn.addEventListener('click', function() {
        popup.style.display = 'flex';
      });
      
      closeBtn.addEventListener('click', function() {
        popup.style.display = 'none';
      });
      
      popup.addEventListener('click', function(event) {
        if (event.target === popup) {
          popup.style.display = 'none';
        }
      });
    }
  
    // Animation process popup
    const animatiePopup = document.getElementById('animatiePopup');
    const openAnimatieBtn = document.getElementById('openAnimatiePopup');
    const closeAnimatieBtn = document.getElementById('closeAnimatiePopup');
    
    if (openAnimatieBtn && animatiePopup && closeAnimatieBtn) {
      // Use the same styling approach as the first popup for consistency
      openAnimatieBtn.addEventListener('click', function() {
        animatiePopup.style.display = 'flex';
      });
      
      closeAnimatieBtn.addEventListener('click', function() {
        animatiePopup.style.display = 'none';
      });
      
      animatiePopup.addEventListener('click', function(event) {
        if (event.target === animatiePopup) {
          animatiePopup.style.display = 'none';
        }
      });
    }
  });
  
  /* dropdown menu voor links */

  const menuButton = document.getElementById('menuButton');
  const menuContent = document.getElementById('menuContent');
  
  menuButton.addEventListener('click', () => {
      menuContent.classList.toggle('show'); // Toggle de 'show'-class om het menu te tonen of te verbergen
  });
  
  // Sluit het menu als je buiten het menu klikt
  window.addEventListener('click', (event) => {
      if (!menuButton.contains(event.target) && !menuContent.contains(event.target)) {
          menuContent.classList.remove('show');
      }
  });

  /* dropdown 2 */

  const menuButton2 = document.getElementById('menuButton2');
  const menuContent2 = document.getElementById('menuContent2');
  
  menuButton2.addEventListener('click', () => {
      menuContent2.classList.toggle('show'); // Toggle de 'show'-class om het menu te tonen of te verbergen
  });
  
  // Sluit het menu als je buiten het menu klikt
  window.addEventListener('click', (event) => {
      if (!menuButton2.contains(event.target) && !menuContent2.contains(event.target)) {
          menuContent2.classList.remove('show');
      }
  });