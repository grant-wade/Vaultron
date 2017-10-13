# Makes the latex files correctly #
all:
	pdflatex SRS
	bibtex SRS
	pdflatex SRS
	rm SRS-blx.bib SRS.aux SRS.bbl SRS.blg SRS.log SRS.out SRS.run.xml SRS.toc

clean:
	rm SRS-blx.bib SRS.aux SRS.bbl SRS.blg SRS.log SRS.out SRS.run.xml SRS.toc
