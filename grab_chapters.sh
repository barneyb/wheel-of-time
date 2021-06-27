#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "book|chron|title" > chapters.csv
mkdir -p target/ewot
pushd target/ewot

curl http://www.encyclopaedia-wot.org/books/new_spring/index.html -o ns.txt
for k in `echo "teotw tgh tdr tsr tfoh loc acos tpod wh cot kod tgs tom amol"`; do
    curl http://www.encyclopaedia-wot.org/books/$k/index.html -o $k.txt
done

grep -i '<li><a ' *.txt \
    | grep -v 'novella.html' \
    | sed -e 's/<\/[aA]>.*$//' \
        -e 's/<\/\?[iI]>//g' \
        -e 's/A HREF/a href/' \
        -e 's/.txt: \?<li><a href="\(ch\)\?/|/' \
        -e 's/\.html">\(.*\)/|\1/' \
        -e 's/|earlier|/|-1|/' \
        -e 's/|prologue|/|0|/' \
        -e 's/|epilogue|/|99|/' \
    | sort -t '|' -k 2n \
    >> ../../chapters.csv
popd
