const fileInput = document.getElementById('fileInput');
const actionBar = document.getElementById('actionBar');
const previewArea = document.getElementById('previewArea');
const imageWrapper = document.getElementById('imageWrapper');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('status');
const dropZone = document.getElementById('dropZone');

let originalImage = null;
let fileName = "converted-image";

// File Selection Handler
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// Drag & Drop animations
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.transform = "scale(0.98)";
    dropZone.style.backgroundColor = "#f0f7ff";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.transform = "scale(1)";
    dropZone.style.backgroundColor = "transparent";
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.transform = "scale(1)";
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        fileName = file.name.split('.')[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.src = event.target.result;
            originalImage.onload = () => {
                actionBar.style.display = 'flex';
                statusText.innerText = ` Ready to transform: ${file.name}`;
                previewArea.style.display = 'none';
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
}

async function convertImage() {
    const format = document.getElementById('formatSelect').value;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    previewArea.style.display = 'block';
    imageWrapper.innerHTML = '';
    
    // Simple visual feedback
    statusText.innerText = "Converting... Please wait.";

    if (format === 'application/pdf') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        
        imageWrapper.innerHTML = `
            <div style="padding: 80px; background: #f8f9fa; border: 3px dashed #cbd5e0; border-radius: 20px;">
                <p style="font-size: 48px;">📄</p>
                <p style="font-weight: 800; font-size: 24px; margin-top:20px;">PDF Document Ready</p>
                <p style="color: #718096; margin-top: 10px;">High Quality Vector Container</p>
            </div>`;
        
        downloadBtn.onclick = () => pdf.save(`${fileName}.pdf`);
    } else {
        const dataUrl = canvas.toDataURL(format, 0.95);
        const imgPreview = new Image();
        imgPreview.src = dataUrl;
        imageWrapper.appendChild(imgPreview);

        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = `${fileName}.${format.split('/')[1] === 'jpeg' ? 'jpg' : format.split('/')[1]}`;
            link.href = dataUrl;
            link.click();
        };
    }
    
    statusText.innerText = "✅ Conversion Successful!";
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}