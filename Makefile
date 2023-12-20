all:
	rsync -uvzr --exclude --delete ./.git ./ ivo.bloechliger@ofi:einmaleins/.
	rsync -uvzr --exclude --delete ./.git ./ ivo@mx:/var/www/html/einmaleins/.

