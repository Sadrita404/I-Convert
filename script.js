const fileInput = document.getElementById('fileInput');
const actionBar = document.getElementById('actionBar');
const previewArea = document.getElementById('previewArea');
const imageWrapper = document.getElementById('imageWrapper');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('status');
const dropZone = document.getElementById('dropZone');

let originalImage = null;
let fileName = "converted-image";

// File Selection
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

// Drag & Drop Handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#eef6ff";
    dropZone.style.borderColor = "#2383e2";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = "transparent";
    dropZone.style.borderColor = "transparent";
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "transparent";
    dropZone.style.borderColor = "transparent";
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
                statusText.innerText = `✨ File Loaded: ${file.name.toUpperCase()}`;
                previewArea.style.display = 'none';
            };
        };
        reader.readAsDataURL(file);
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
    
    statusText.innerText = " PROCESSING...";

    if (format === 'application/pdf') {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'l' : 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
        
        imageWrapper.innerHTML = `<div style="padding: 50px; font-weight: 800;">PDF READY FOR DOWNLOAD</div>`;
        downloadBtn.onclick = () => pdf.save(`${fileName}.pdf`);
    } else {
        const dataUrl = canvas.toDataURL(format, 0.98);
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
    
    statusText.innerText = "✅ DONE!";
}