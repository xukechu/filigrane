// Global variables to store image and watermark state
let originalImage = null;
let watermarkPosition = 'center'; // Default position
let repeatEnabled = false; // Default repeat state
let repeatSpacingX = 200; // Default horizontal spacing
let repeatSpacingY = 200; // Default vertical spacing
let isDragging = false; // Flag for drag operation
let isScaling = false; // Flag for scaling operation
let isRotating = false; // Flag for rotation operation
let lastX = 0; // Last X position for drag/gesture operations
let lastY = 0; // Last Y position for drag/gesture operations
let startDistance = 0; // Starting distance for pinch/zoom
let startAngle = 0; // Starting angle for rotation

// Global function to update canvas text when language changes
function updateCanvasText() {
    const canvas = document.getElementById('imageCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!originalImage) {
        // If no image is loaded, reinitialize the canvas with the new language
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999999';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(getTranslation('uploadPrompt'), canvas.width / 2, canvas.height / 2);
    } else {
        // If an image is loaded, redraw the watermark with the new language
        if (typeof applyWatermark === 'function') {
            applyWatermark();
        }
    }
}

// Function to update meta tags for SEO when language changes
function updateMetaTags() {
    const currentLang = getCurrentLanguage();

    // Update title
    document.title = getTranslation('pageTitle');

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]:not([lang])');
    if (metaDescription) {
        metaDescription.content = getTranslation('pageDescription');
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        metaKeywords.content = getTranslation('pageKeywords');
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.content = getTranslation('pageTitle');
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
        ogDescription.content = getTranslation('pageDescription');
    }

    // Update Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
        // Map language code to locale format
        const localeMap = {
            'en': 'en_US',
            'fr': 'fr_FR',
            'de': 'de_DE',
            'it': 'it_IT',
            'es': 'es_ES',
            'ja': 'ja_JP',
            'ru': 'ru_RU',
            'ar': 'ar_SA',
            'zh-CN': 'zh_CN',
            'zh-TW': 'zh_TW',
            'ko': 'ko_KR'
        };
        ogLocale.content = localeMap[currentLang] || 'en_US';
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
        twitterTitle.content = getTranslation('pageTitle');
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
        twitterDescription.content = getTranslation('pageDescription');
    }

    // Update canonical and alternate links
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        const baseUrl = canonical.href.split('/').slice(0, -1).join('/') || 'https://example.com';

        // Update hreflang links
        const alternateLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
        alternateLinks.forEach(link => {
            const lang = link.getAttribute('hreflang');
            if (lang === 'x-default') {
                link.href = baseUrl + '/';
            } else {
                link.href = baseUrl + '/' + lang + '/';
            }
        });
    }

    // Update html lang attribute
    document.documentElement.lang = currentLang;
}

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const imageInput = document.getElementById('imageInput');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const watermarkText = document.getElementById('watermarkText');
    const xOffset = document.getElementById('xOffset');
    const yOffset = document.getElementById('yOffset');
    const fontSize = document.getElementById('fontSize');
    const opacity = document.getElementById('opacity');
    const textColor = document.getElementById('textColor');
    const rotation = document.getElementById('rotation');
    const downloadBtn = document.getElementById('downloadBtn');
    const reuploadBtn = document.getElementById('reuploadBtn');
    const xOffsetValue = document.getElementById('xOffsetValue');
    const yOffsetValue = document.getElementById('yOffsetValue');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const opacityValue = document.getElementById('opacityValue');
    const rotationValue = document.getElementById('rotationValue');

    // Position buttons
    const posTopLeft = document.getElementById('posTopLeft');
    const posTopRight = document.getElementById('posTopRight');
    const posCenter = document.getElementById('posCenter');
    const posBottomLeft = document.getElementById('posBottomLeft');
    const posBottomRight = document.getElementById('posBottomRight');

    // Initialize canvas with a placeholder
    function initCanvas() {
        canvas.width = 600;
        canvas.height = 400;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#999999';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(getTranslation('uploadPrompt'), canvas.width / 2, canvas.height / 2);

        // Hide gesture hint when no image is loaded
        const gestureHint = document.getElementById('gestureHint');
        if (gestureHint) {
            gestureHint.style.display = 'none';
        }
    }

    // Load image when selected
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    originalImage = img;
                    resetCanvas();
                    drawImage();
                    applyWatermark();
                    downloadBtn.disabled = false;
                    document.getElementById('reuploadText').textContent = getTranslation('reuploadBtn');
                    reuploadBtn.style.display = 'block'; // Show re-upload button
                };
                img.src = event.target.result;
            };

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Re-upload button click handler
    reuploadBtn.addEventListener('click', function() {
        imageInput.click(); // Trigger the file input
    });

    // Reset canvas to fit the image
    function resetCanvas() {
        if (originalImage) {
            // Set canvas size to match image dimensions
            canvas.width = originalImage.width;
            canvas.height = originalImage.height;
        }
    }

// Global function to draw the image on canvas
function drawImage() {
    if (!originalImage) return;

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Show gesture hint when image is loaded
    const gestureHint = document.getElementById('gestureHint');
    if (gestureHint) {
        gestureHint.style.display = 'block';

        // Set different hint text based on device type
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            // Mobile device - show touch gesture hint
            gestureHint.textContent = getTranslation('touchGestureHint') || 
                'Drag to move, pinch to resize, rotate with two fingers. Double-tap to re-upload.';
        } else {
            // Desktop device - show mouse gesture hint
            gestureHint.textContent = getTranslation('mouseGestureHint') || 
                'Drag to move watermark. Hover to see re-upload option.';
        }
    }
}

// Global function to apply watermark to the image
function applyWatermark() {
    if (!originalImage) return;

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const watermarkText = document.getElementById('watermarkText');
    const fontSize = document.getElementById('fontSize');
    const opacity = document.getElementById('opacity');
    const textColor = document.getElementById('textColor');
    const xOffset = document.getElementById('xOffset');
    const yOffset = document.getElementById('yOffset');
    const rotation = document.getElementById('rotation');

    // Clear canvas and redraw image
    drawImage();

    // Get watermark parameters
    const text = watermarkText.value || getTranslation('watermarkDefault');
    const size = parseInt(fontSize.value);
    const alpha = parseInt(opacity.value) / 100;
    const color = textColor.value;
    const xPos = parseInt(xOffset.value);
    const yPos = parseInt(yOffset.value);
    const rotationAngle = parseInt(rotation.value);

    // Set font properties
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;

    // Calculate position based on selected position and offsets
    let x, y;
    let textAlign;

    switch (watermarkPosition) {
        case 'topLeft':
            x = 20 + xPos;
            y = 20 + size + yPos;
            textAlign = 'left';
            break;
        case 'topRight':
            x = canvas.width - 20 + xPos;
            y = 20 + size + yPos;
            textAlign = 'right';
            break;
        case 'center':
            x = canvas.width / 2 + xPos;
            y = canvas.height / 2 + yPos;
            textAlign = 'center';
            break;
        case 'bottomLeft':
            x = 20 + xPos;
            y = canvas.height - 20 + yPos;
            textAlign = 'left';
            break;
        case 'bottomRight':
        default:
            x = canvas.width - 20 + xPos;
            y = canvas.height - 20 + yPos;
            textAlign = 'right';
            break;
    }

    // Set text alignment for measuring
    ctx.textAlign = textAlign;

    // Measure the text to find its dimensions
    const textMetrics = ctx.measureText(text);
    // Calculate the width and height of the text
    const textWidth = textMetrics.width;
    // Approximate height based on font size
    const textHeight = size * 0.7;

    // Calculate the center point of the text based on alignment
    let textCenterX = 0;
    if (textAlign === 'left') {
        textCenterX = textWidth / 2;
    } else if (textAlign === 'right') {
        textCenterX = -textWidth / 2;
    }

    if (repeatEnabled) {
        // Draw repeated watermarks
        const spacingX = parseInt(repeatSpacingX);
        const spacingY = parseInt(repeatSpacingY);

        // Calculate how many watermarks we need in each direction
        const numX = Math.ceil(canvas.width / spacingX) + 1;
        const numY = Math.ceil(canvas.height / spacingY) + 1;

        // Calculate starting positions
        let startX, startY;

        if (watermarkPosition.includes('Left')) {
            startX = -spacingX;
        } else if (watermarkPosition.includes('Right')) {
            startX = canvas.width - spacingX;
        } else {
            startX = (canvas.width / 2) - (spacingX * Math.floor(numX / 2));
        }

        if (watermarkPosition.includes('top')) {
            startY = -spacingY;
        } else if (watermarkPosition.includes('bottom')) {
            startY = canvas.height - spacingY;
        } else {
            startY = (canvas.height / 2) - (spacingY * Math.floor(numY / 2));
        }

        // Adjust for offsets
        startX += xPos;
        startY += yPos;

        // Draw watermarks in a grid
        for (let i = 0; i < numX; i++) {
            for (let j = 0; j < numY; j++) {
                const posX = startX + (i * spacingX);
                const posY = startY + (j * spacingY);

                // Save the current canvas state
                ctx.save();

                // Move to the position where we want to draw the text
                ctx.translate(posX, posY);

                // Rotate the canvas around the center of the text
                ctx.rotate(rotationAngle * Math.PI / 180);

                // Draw the text with the center point offset
                ctx.fillText(text, textCenterX, textHeight / 2);

                // Restore the canvas state
                ctx.restore();
            }
        }
    } else {
        // Draw single watermark
        // Save the current canvas state
        ctx.save();

        // Move to the position where we want to draw the text
        ctx.translate(x, y);

        // Rotate the canvas around the center of the text
        ctx.rotate(rotationAngle * Math.PI / 180);

        // Draw the text with the center point offset
        ctx.fillText(text, textCenterX, textHeight / 2);

        // Restore the canvas state
        ctx.restore();
    }

    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

    // Event listeners for watermark customization
    watermarkText.addEventListener('input', applyWatermark);
    xOffset.addEventListener('input', function() {
        xOffsetValue.textContent = this.value;
        applyWatermark();
    });
    yOffset.addEventListener('input', function() {
        yOffsetValue.textContent = this.value;
        applyWatermark();
    });
    fontSize.addEventListener('input', function() {
        fontSizeValue.textContent = this.value + getTranslation('pixelUnit');
        applyWatermark();
    });
    opacity.addEventListener('input', function() {
        opacityValue.textContent = this.value + getTranslation('percentUnit');
        applyWatermark();
    });
    rotation.addEventListener('input', function() {
        rotationValue.textContent = this.value + getTranslation('degreeUnit');
        applyWatermark();
    });
    textColor.addEventListener('input', applyWatermark);

    // Event listeners for repeat controls
    const repeatEnabledCheckbox = document.getElementById('repeatEnabled');
    const repeatSpacingXInput = document.getElementById('repeatSpacingX');
    const repeatSpacingYInput = document.getElementById('repeatSpacingY');
    const repeatSpacingXValue = document.getElementById('repeatSpacingXValue');
    const repeatSpacingYValue = document.getElementById('repeatSpacingYValue');

    repeatEnabledCheckbox.addEventListener('change', function() {
        repeatEnabled = this.checked;
        repeatSpacingXInput.disabled = !this.checked;
        repeatSpacingYInput.disabled = !this.checked;
        applyWatermark();
    });

    repeatSpacingXInput.addEventListener('input', function() {
        repeatSpacingXValue.textContent = this.value + getTranslation('pixelUnit');
        repeatSpacingX = this.value;
        applyWatermark();
    });

    repeatSpacingYInput.addEventListener('input', function() {
        repeatSpacingYValue.textContent = this.value + getTranslation('pixelUnit');
        repeatSpacingY = this.value;
        applyWatermark();
    });

    // Position button event listeners
    posTopLeft.addEventListener('click', function() {
        watermarkPosition = 'topLeft';
        applyWatermark();
    });
    posTopRight.addEventListener('click', function() {
        watermarkPosition = 'topRight';
        applyWatermark();
    });
    posCenter.addEventListener('click', function() {
        watermarkPosition = 'center';
        applyWatermark();
    });
    posBottomLeft.addEventListener('click', function() {
        watermarkPosition = 'bottomLeft';
        applyWatermark();
    });
    posBottomRight.addEventListener('click', function() {
        watermarkPosition = 'bottomRight';
        applyWatermark();
    });

    // Download functionality
    downloadBtn.addEventListener('click', function() {
        if (!originalImage) return;

        // Get the image data URL
        const dataURL = canvas.toDataURL('image/png');

        // Check if it's a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // For mobile devices: open image in a new tab
            // This allows the user to save it using the browser's built-in functionality
            const newTab = window.open();
            if (newTab) {
                newTab.document.write('<html><head><title>' + getTranslation('downloadFilename') + '</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;background-color:#f0f0f0;">');
                newTab.document.write('<img src="' + dataURL + '" alt="Watermarked Image" style="max-width:100%;max-height:100vh;">');
                newTab.document.write('<div style="position:fixed;top:10px;left:0;right:0;text-align:center;font-family:Arial;color:#333;padding:10px;background-color:rgba(255,255,255,0.8);">' + getTranslation('saveImageInstructions') + '</div>');
                newTab.document.write('</body></html>');
                newTab.document.close();
            } else {
                // If popup is blocked, fallback to the desktop method
                const link = document.createElement('a');
                link.download = getTranslation('downloadFilename');
                link.href = dataURL;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else {
            // For desktop: use the standard download method
            const link = document.createElement('a');
            link.download = getTranslation('downloadFilename');
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    // Initialize drag and drop functionality for file upload
    initDragAndDrop();

    // Initialize gesture support for watermark manipulation
    // This function sets up event listeners for mouse and touch events to enable:
    // 1. Dragging the watermark to reposition it
    // 2. Pinch/zoom gestures to resize the watermark
    // 3. Rotation gestures to rotate the watermark
    function initWatermarkGestures() {
        const canvas = document.getElementById('imageCanvas');

        // Mouse events for desktop
        canvas.addEventListener('mousedown', startGesture);
        canvas.addEventListener('mousemove', moveGesture);
        canvas.addEventListener('mouseup', endGesture);
        canvas.addEventListener('mouseleave', endGesture);

        // Touch events for mobile
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);

        // Prevent context menu on right-click
        canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // Variables for double tap detection
        let lastTapTime = 0;
        let tapTimeout;

        // Function to handle touch start
        function handleTouchStart(e) {
            e.preventDefault();
            if (!originalImage) return;

            if (e.touches.length === 1) {
                // Single touch - check for double tap or start drag
                const touch = e.touches[0];
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTapTime;

                // Clear any existing tap timeout
                clearTimeout(tapTimeout);

                if (tapLength < 300 && tapLength > 0) {
                    // Double tap detected - show re-upload overlay
                    const canvasOverlay = document.querySelector('.canvas-overlay');
                    canvasOverlay.style.opacity = '1';

                    // Hide the overlay after 3 seconds
                    setTimeout(() => {
                        canvasOverlay.style.opacity = '0';
                    }, 3000);

                    // Prevent drag operation on double tap
                    return;
                } else {
                    // Start drag immediately for better responsiveness
                    isDragging = true;
                    lastX = touch.clientX;
                    lastY = touch.clientY;
                    canvas.classList.add('dragging');
                }

                lastTapTime = currentTime;
            } else if (e.touches.length === 2) {
                // Two touches - start pinch/zoom and rotation
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // Calculate initial distance for scaling
                startDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );

                // Calculate initial angle for rotation
                startAngle = Math.atan2(
                    touch2.clientY - touch1.clientY,
                    touch2.clientX - touch1.clientX
                ) * 180 / Math.PI;

                isScaling = true;
                isRotating = true;
                isDragging = true;  // Enable dragging with two fingers as well

                // Set center point for gesture
                lastX = (touch1.clientX + touch2.clientX) / 2;
                lastY = (touch1.clientY + touch2.clientY) / 2;

                // Add dragging class
                canvas.classList.add('dragging');
            }
        }

        // Function to handle touch move
        function handleTouchMove(e) {
            e.preventDefault();
            if (!originalImage) return;

            if (e.touches.length === 1 && isDragging) {
                // Single touch - drag
                const touch = e.touches[0];

                // Calculate delta movement
                const deltaX = touch.clientX - lastX;
                const deltaY = touch.clientY - lastY;

                // Update offsets
                const xOffset = document.getElementById('xOffset');
                const yOffset = document.getElementById('yOffset');
                xOffset.value = parseInt(xOffset.value) + deltaX;
                yOffset.value = parseInt(yOffset.value) + deltaY;

                // Update display values
                document.getElementById('xOffsetValue').textContent = xOffset.value;
                document.getElementById('yOffsetValue').textContent = yOffset.value;

                // Update last position
                lastX = touch.clientX;
                lastY = touch.clientY;

                // Apply changes
                applyWatermark();
            } else if (e.touches.length === 2) {
                // Two touches - pinch/zoom and rotation
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // Calculate current center point
                const currentX = (touch1.clientX + touch2.clientX) / 2;
                const currentY = (touch1.clientY + touch2.clientY) / 2;

                // Handle drag with two fingers
                if (isDragging) {
                    const deltaX = currentX - lastX;
                    const deltaY = currentY - lastY;

                    // Update offsets
                    const xOffset = document.getElementById('xOffset');
                    const yOffset = document.getElementById('yOffset');
                    xOffset.value = parseInt(xOffset.value) + deltaX;
                    yOffset.value = parseInt(yOffset.value) + deltaY;

                    // Update display values
                    document.getElementById('xOffsetValue').textContent = xOffset.value;
                    document.getElementById('yOffsetValue').textContent = yOffset.value;
                }

                // Handle scaling
                if (isScaling) {
                    const currentDistance = Math.hypot(
                        touch2.clientX - touch1.clientX,
                        touch2.clientY - touch1.clientY
                    );

                    const scale = currentDistance / startDistance;

                    // Update font size
                    const fontSize = document.getElementById('fontSize');
                    const newSize = Math.max(10, Math.min(300, parseInt(fontSize.value) * scale));
                    fontSize.value = newSize;
                    document.getElementById('fontSizeValue').textContent = newSize + getTranslation('pixelUnit');

                    // Reset for next move
                    startDistance = currentDistance;
                }

                // Handle rotation
                if (isRotating) {
                    const currentAngle = Math.atan2(
                        touch2.clientY - touch1.clientY,
                        touch2.clientX - touch1.clientX
                    ) * 180 / Math.PI;

                    const deltaAngle = currentAngle - startAngle;

                    // Update rotation
                    const rotation = document.getElementById('rotation');
                    let newRotation = (parseInt(rotation.value) + deltaAngle) % 360;
                    if (newRotation < 0) newRotation += 360;
                    rotation.value = newRotation;
                    document.getElementById('rotationValue').textContent = newRotation + getTranslation('degreeUnit');

                    // Reset for next move
                    startAngle = currentAngle;
                }

                // Update last position
                lastX = currentX;
                lastY = currentY;

                // Apply changes
                applyWatermark();
            }
        }

        // Function to handle touch end
        function handleTouchEnd(e) {
            // Make sure to reset all flags
            isDragging = false;
            isScaling = false;
            isRotating = false;

            // Remove dragging class
            canvas.classList.remove('dragging');
        }

        // Function to start gesture
        function startGesture(e) {
            if (!originalImage) return;
            e.preventDefault();

            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;

            // Add a class to indicate dragging state
            canvas.classList.add('dragging');
        }

        // Function to move during gesture
        function moveGesture(e) {
            if (!isDragging || !originalImage) return;
            e.preventDefault();

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            // Update offsets
            const xOffset = document.getElementById('xOffset');
            const yOffset = document.getElementById('yOffset');
            xOffset.value = parseInt(xOffset.value) + deltaX;
            yOffset.value = parseInt(yOffset.value) + deltaY;

            // Update display values
            document.getElementById('xOffsetValue').textContent = xOffset.value;
            document.getElementById('yOffsetValue').textContent = yOffset.value;

            // Update last position
            lastX = e.clientX;
            lastY = e.clientY;

            // Apply changes
            applyWatermark();
        }

        // Function to end gesture
        function endGesture() {
            isDragging = false;
            isScaling = false;
            isRotating = false;

            // Remove dragging class
            canvas.classList.remove('dragging');
        }
    }

    // Initialize the canvas
    initCanvas();

    // Show the reupload button with "Upload" text initially
    document.getElementById('reuploadText').textContent = getTranslation('uploadPrompt');
    reuploadBtn.style.display = 'block';

    // Initialize repeat spacing values
    document.getElementById('repeatSpacingXValue').textContent = repeatSpacingX + getTranslation('pixelUnit');
    document.getElementById('repeatSpacingYValue').textContent = repeatSpacingY + getTranslation('pixelUnit');

    // Initialize gesture support for watermark
    initWatermarkGestures();

    // Initialize drag and drop functionality
    function initDragAndDrop() {
        const uploadSection = document.querySelector('.upload-section');
        const canvasContainer = document.querySelector('.canvas-container');

        // Make upload section clickable
        uploadSection.addEventListener('click', function() {
            imageInput.click();
        });

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadSection.addEventListener(eventName, preventDefaults, false);
            canvasContainer.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadSection.addEventListener(eventName, highlight, false);
            canvasContainer.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadSection.addEventListener(eventName, unhighlight, false);
            canvasContainer.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        uploadSection.addEventListener('drop', handleDrop, false);
        canvasContainer.addEventListener('drop', handleDrop, false);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            this.classList.add('highlight');
        }

        function unhighlight(e) {
            this.classList.remove('highlight');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files && files.length) {
                handleFiles(files);
            }
        }

        function handleFiles(files) {
            if (files[0].type.match('image.*')) {
                const reader = new FileReader();

                reader.onload = function(event) {
                    const img = new Image();
                    img.onload = function() {
                        originalImage = img;
                        resetCanvas();
                        drawImage();
                        applyWatermark();
                        downloadBtn.disabled = false;
                        document.getElementById('reuploadText').textContent = getTranslation('reuploadBtn');
                        reuploadBtn.style.display = 'block';
                    };
                    img.src = event.target.result;
                };

                reader.readAsDataURL(files[0]);
            }
        }
    }
});
