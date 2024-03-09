all:
#	rsync -uvzr --exclude .git --exclude Makefile --delete ./ ivo.bloechliger@ofi:einmaleins/.
#	rsync -uvzr --exclude .git --exclude Makefile --delete ./ ivo@mx:/var/www/html/einmaleins/.
    rsync -uvzr --exclude .git --exclude Makefile --delete ./ simon@fginfo.ksbg.ch:/var/www/html/ks/ee/.
