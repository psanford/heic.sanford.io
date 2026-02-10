BUCKET=heic.sanford.io

upload:
	aws s3 sync . s3://$(BUCKET)/ --exclude '*' --exclude '.claude/*' --exclude '.git/*' --include '*.js'  --include '*.css'  --include 'manifest.json' --include '*.png' --cache-control max-age=300
	aws s3 cp index.html s3://$(BUCKET)/ --content-type text/html --cache-control max-age=30
