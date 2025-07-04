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

    // Variables to store image and watermark state
    let originalImage = null;
    let watermarkPosition = 'center'; // Default position

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

    // Draw the image on canvas
    function drawImage() {
        if (originalImage) {
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        }
    }

    // Apply watermark to the image
    function applyWatermark() {
        if (!originalImage) return;

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

        // Save the current canvas state
        ctx.save();

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

        // Move to the position where we want to draw the text
        ctx.translate(x, y);

        // Rotate the canvas around the center of the text
        ctx.rotate(rotationAngle * Math.PI / 180);

        // Draw the text with the center point offset
        ctx.fillText(text, textCenterX, textHeight / 2);

        // Restore the canvas state
        ctx.restore();

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

        // Create a temporary link element
        const link = document.createElement('a');
        link.download = getTranslation('downloadFilename');
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initialize drag and drop functionality
    initDragAndDrop();

    // Initialize the canvas
    initCanvas();

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
                        reuploadBtn.style.display = 'block';
                    };
                    img.src = event.target.result;
                };

                reader.readAsDataURL(files[0]);
            }
        }
    }
});
