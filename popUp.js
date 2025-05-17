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
  