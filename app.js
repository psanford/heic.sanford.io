if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

var dropZone = document.getElementById('drop-zone');
var fileInput = document.getElementById('file-input');
var browseBtn = document.getElementById('browse-btn');
var status = document.getElementById('status');
var result = document.getElementById('result');
var preview = document.getElementById('preview');
var downloadLink = document.getElementById('download-link');

browseBtn.addEventListener('click', function () {
  fileInput.click();
});

fileInput.addEventListener('change', function () {
  if (fileInput.files.length > 0) {
    convertFile(fileInput.files[0]);
  }
});

dropZone.addEventListener('dragover', function (e) {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', function () {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', function (e) {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length > 0) {
    convertFile(e.dataTransfer.files[0]);
  }
});

function setStatus(msg, isError) {
  status.innerHTML = msg;
  status.className = isError ? 'error' : '';
}

function resetDropZone() {
  dropZone.classList.remove('converting');
  dropZone.innerHTML = '<p>Drop a HEIC file here</p><button class="browse-btn" id="browse-btn">Browse Files</button><input type="file" id="file-input" accept="image/heic,image/heif,.heic,.heif">';
  fileInput = document.getElementById('file-input');
  browseBtn = document.getElementById('browse-btn');
  browseBtn.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) convertFile(fileInput.files[0]);
  });
}

function convertFile(file) {
  var name = file.name.replace(/\.heic$/i, '').replace(/\.heif$/i, '') || 'converted';
  var jpegName = name + '.jpg';

  result.style.display = 'none';
  dropZone.innerHTML = '<p>Converting…</p>';
  dropZone.classList.add('converting');

  if (preview.src) {
    URL.revokeObjectURL(preview.src);
  }

  requestAnimationFrame(function () { requestAnimationFrame(function () {
  heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    .then(function (jpegBlob) {
      var url = URL.createObjectURL(jpegBlob);
      preview.src = url;
      downloadLink.href = url;
      downloadLink.download = jpegName;
      resetDropZone();
      result.style.display = 'block';
      setStatus('');
    })
    .catch(function (err) {
      resetDropZone();
      setStatus('Conversion failed: ' + err.message, true);
    });
  }); });
}

function checkShareTarget() {
  if (window.location.search.indexOf('share-target') === -1) return;

  history.replaceState(null, '', '/');

  caches.open('heic2jpeg-media').then(function (cache) {
    cache.match('/shared-file').then(function (response) {
      if (!response) return;
      cache.delete('/shared-file');

      var filename = response.headers.get('X-Filename') || 'shared.heic';
      response.blob().then(function (blob) {
        var file = new File([blob], filename, { type: blob.type || 'image/heic' });
        convertFile(file);
      });
    });
  });
}

checkShareTarget();
