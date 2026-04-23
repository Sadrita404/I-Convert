const fileInput = document.getElementById('fileInput');
const actionBar = document.getElementById('actionBar');
const previewArea = document.getElementById('previewArea');
const imageWrapper = document.getElementById('imageWrapper');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('status');
const dropZone = document.getElementById('dropZone');

let originalImage = null;
let fileName = "converted-image";

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#f0f7ff";
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
                statusText.innerText = `READY TO PROCESS: ${file.name.toUpperCase()}`;
                previewArea.style.display = 'none';
                
                document.body.style.overflowY = "auto";
                document.documentElement.style.overflowY = "auto";

                window.scrollTo({
                    top: actionBar.offsetTop - 100,
                    behavior: 'smooth'
                });
            };
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please select a valid image file (JPG, PNG, WEBP).");
    }
}

async function convertImage() {
    if (!originalImage) return;

    const format = document.getElementById('formatSelect').value;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);

    previewArea.style.display = 'block';
    imageWrapper.innerHTML = '';
    
    statusText.innerText = "⚡ ENGINE RUNNING: TRANSFORMING DATA...";

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
            <div style="padding: 60px; border: 3px solid #eee; border-radius: 20px; background: white;">
                <p style="font-size: 100px;">📄</p>
                <p style="font-weight: 900; font-size: 28px; margin-top: 20px; color: #111;">PDF PACKAGE GENERATED</p>
                <p style="color: #666;">High-resolution vector-wrapped document ready.</p>
            </div>`;
            
        downloadBtn.onclick = () => pdf.save(`${fileName}-converted.pdf`);
    } 
    else {
        const dataUrl = canvas.toDataURL(format, 0.98);
        const imgPreview = new Image();
        imgPreview.src = dataUrl;
        imageWrapper.appendChild(imgPreview);

        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = `${fileName}-converted.${format.split('/')[1] === 'jpeg' ? 'jpg' : format.split('/')[1]}`;
            link.href = dataUrl;
            link.click();
        };
    }
    
    statusText.innerText = " CONVERSION COMPLETE. ENJOY YOUR FILE!";
    
    setTimeout(() => {
        const yOffset = -50; 
        const y = previewArea.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
    }, 200);
}