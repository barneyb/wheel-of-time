#!/usr/bin/env bash

curl http://www.encyclopaedia-wot.org/books/new_spring/index.html -o ns.txt
curl http://www.encyclopaedia-wot.org/books/teotw/index.html -o teotw.txt
curl http://www.encyclopaedia-wot.org/books/tgh/index.html -o tgh.txt
curl http://www.encyclopaedia-wot.org/books/tdr/index.html -o tdr.txt
curl http://www.encyclopaedia-wot.org/books/tsr/index.html -o tsr.txt
curl http://www.encyclopaedia-wot.org/books/tfoh/index.html -o tfoh.txt
curl http://www.encyclopaedia-wot.org/books/loc/index.html -o loc.txt
curl http://www.encyclopaedia-wot.org/books/acos/index.html -o acos.txt
curl http://www.encyclopaedia-wot.org/books/tpod/index.html -o tpod.txt
curl http://www.encyclopaedia-wot.org/books/wh/index.html -o wh.txt
curl http://www.encyclopaedia-wot.org/books/cot/index.html -o cot.txt
curl http://www.encyclopaedia-wot.org/books/kod/index.html -o kod.txt
curl http://www.encyclopaedia-wot.org/books/tgs/index.html -o tgs.txt
curl http://www.encyclopaedia-wot.org/books/tom/index.html -o tom.txt
curl http://www.encyclopaedia-wot.org/books/amol/index.html -o amol.txt

echo "book,chron,title" > chapters.csv
grep -i '<li><a ' ns.txt teotw.txt tgh.txt tdr.txt tsr.txt tfoh.txt loc.txt acos.txt tpod.txt wh.txt cot.txt kod.txt tgs.txt tom.txt amol.txt \
    | grep -v 'novella.html' \
    | sed -e 's/<\/[aA]>.*$//' \
        -e 's/<\/\?[iI]>//g' \
        -e 's/A HREF/a href/' \
        -e 's/.txt: \?<li><a href="\(ch\)\?/,/' \
        -e 's/\.html">\([^|]*,.*\)/,"\1"/' \
        -e 's/\.html">\(.*\)/,\1/' \
        -e 's/,earlier,/,-1,/' \
        -e 's/,prologue,/,0,/' \
        -e 's/,epilogue,/,99,/' \
    | sort -t ',' -k 2n \
    >> chapters.csv
