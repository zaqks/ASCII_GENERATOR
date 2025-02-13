document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let currentImage = null;

    const charSets = [
        '.:-=+*#%@',
        '.:;+=*#%@',
        ':-+*#%@',
        '.+#@',
        '.#@',
        '.@'
    ];

    function getAsciiChars(density) {
        const index = Math.min(charSets.length - 1, 
                             Math.floor((10 - density) / 2));
        return charSets[index];
    }

    function createAsciiArt(image, width, density) {
        const asciiChars = getAsciiChars(density);
        
        let height = Math.floor((width / image.width) * image.height);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height).data;
        let asciiArt = '';

        const imageAspectRatio = image.width / image.height;
        const spacesNeeded = Math.ceil(2 / imageAspectRatio) - 1;
        const spaces = ' '.repeat(spacesNeeded);

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                const offset = (i * width + j) * 4;
                const r = imageData[offset];
                const g = imageData[offset + 1];
                const b = imageData[offset + 2];
                
                const brightness = (r + g + b) / 3;
                const charIndex = Math.floor(brightness / 255 * (asciiChars.length - 1));
                asciiArt += asciiChars[charIndex] + spaces;
            }
            asciiArt += '\n';
        }

        const outputElement = document.getElementById('ascii-output');
        const containerWidth = outputElement.clientWidth - 40;
        const containerHeight = outputElement.clientHeight - 40;
        
        const fontSizeWidth = containerWidth / (width * (1 + spacesNeeded));
        const fontSizeHeight = containerHeight / height;
        const fontSize = Math.min(fontSizeWidth, fontSizeHeight);
        
        outputElement.style.fontSize = `${fontSize}px`;
        outputElement.style.lineHeight = `${fontSize}px`;
        
        return asciiArt;
    }

    function updateAsciiArt() {
        if (!currentImage) return;
        
        const width = parseInt(document.getElementById('widthRange').value);
        const density = parseInt(document.getElementById('densityRange').value);
        const ascii = createAsciiArt(currentImage, width, density);
        document.getElementById('ascii-output').textContent = ascii;
    }

    function handleImageUrl(url) {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        
        image.onload = function() {
            currentImage = image;
            updateAsciiArt();
        };
        
        image.onerror = function() {
            console.error('Failed to load image from URL');
            document.getElementById('ascii-output').textContent = 'Failed to load image. Please try another URL.';
        };
        
        // Try loading the image directly first
        image.src = url;
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            document.getElementById('imageUrl').value = '';
            const reader = new FileReader();
            reader.onload = function(e) {
                const image = new Image();
                image.onload = function() {
                    currentImage = image;
                    updateAsciiArt();
                };
                image.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    async function copyToClipboard() {
        const asciiOutput = document.getElementById('ascii-output').textContent;
        try {
            await navigator.clipboard.writeText(asciiOutput);
            const feedback = document.getElementById('copyFeedback');
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    function downloadAsText() {
        const asciiOutput = document.getElementById('ascii-output').textContent;
        if (asciiOutput.trim() === 'Upload an image to generate ASCII art') {
            return;
        }
        
        const blob = new Blob([asciiOutput], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ascii-art.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    
    document.getElementById('widthRange').addEventListener('input', (e) => {
        document.getElementById('widthValue').textContent = e.target.value;
        updateAsciiArt();
    });

    document.getElementById('densityRange').addEventListener('input', (e) => {
        document.getElementById('densityValue').textContent = e.target.value;
        updateAsciiArt();
    });

    document.getElementById('actionButton').addEventListener('click', () => {
        document.getElementById('actionDropdown').classList.toggle('show');
    });

    window.addEventListener('click', (e) => {
        if (!e.target.matches('.dropdown-button')) {
            const dropdown = document.getElementById('actionDropdown');
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    });

    document.getElementById('copyAction').addEventListener('click', copyToClipboard);
    document.getElementById('downloadTextAction').addEventListener('click', downloadAsText);

    document.getElementById('imageUrl').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const url = e.target.value.trim();
            if (url) {
                handleImageUrl(url);
            }
        }
    });

    document.getElementById('imageUrl').addEventListener('blur', (e) => {
        const url = e.target.value.trim();
        if (url) {
            handleImageUrl(url);
        }
    });
}); 