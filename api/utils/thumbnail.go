package utils

import (
	"github.com/signintech/gopdf"
)

func GenerateThumbnail(filepath, filename string) {
	outputFilename := filename + "_thumbnail.png"

	pdf := gopdf.GoPdf{}
	pdf.Start(gopdf.Config{})

	tpl1 := pdf.ImportPage(filepath, 1, "/MediaBox")
	pdf.UseImportedTemplate(tpl1, 50, 100, 400, 0)

	pdf.WritePdf(outputFilename)

}
