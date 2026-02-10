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

function convertFile(file) {
  var name = file.name.replace(/\.heic$/i, '').replace(/\.heif$/i, '') || 'converted';
  var jpegName = name + '.jpg';

  setStatus('<span class="spinner"></span> Converting…');
  result.style.display = 'none';

  if (preview.src) {
    URL.revokeObjectURL(preview.src);
  }

  heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    .then(function (jpegBlob) {
      var url = URL.createObjectURL(jpegBlob);
      preview.src = url;
      downloadLink.href = url;
      downloadLink.download = jpegName;
      result.style.display = 'block';
      setStatus('');
    })
    .catch(function (err) {
      setStatus('Conversion failed: ' + err.message, true);
    });
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
