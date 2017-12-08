# Makes the latex files correctly #
all:
	pdflatex final_report
	bibtex final_report
	pdflatex final_report
	rm final_report-blx.bib final_report.aux final_report.bbl final_report.blg 
	rm final_report.log final_report.out final_report.run.xml final_report.toc

clean:
	rm final_report-blx.bib final_report.aux final_report.bbl final_report.blg 
	rm final_report.log final_report.out final_report.run.xml final_report.toc
