import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import useMedia from "../utils/useMedia";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewProps {
  viewPdfId: string;
  access_token: string;
  setViewPdfId: Function;
}

export default function PdfView({
  viewPdfId,
  access_token,
  setViewPdfId
}: PdfViewProps) {
  const [file, setFile] = useState<string | null>(null);
  const [blobStorage, setBlobStorage] = useState<Blob | null>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const isMobile = useMedia("(max-width: 767px)");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          if (page > 1) {
            setPage(page - 1);
          }
          break;
        case "ArrowRight":
          if (page < numPages!) {
            setPage(page + 1);
          }
          break;
        case "Escape":
          setViewPdfId(null);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    const getFile = async () => {
      try {
        if (blobStorage === null) {
          const response = await axios.get<ArrayBuffer>(
            `/documents/file/${viewPdfId}`,
            {
              headers: {
                Authorization: access_token
              },
              responseType: "arraybuffer"
            }
          );
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setBlobStorage(blob);
          setFile(url);

          const arrayBuffer = await response.data;
          const typedArray = new Uint8Array(arrayBuffer);
          const loadingTask = pdfjs.getDocument(typedArray);
          const pdf = await loadingTask.promise;

          setNumPages(pdf.numPages);
        }
      } catch (error) {
        console.error(error);
        setFile("android-chrome-512x512.pdf");
      }
    };
    getFile();
  }, [viewPdfId, access_token, blobStorage]);

  useEffect(() => {
    if (blobStorage) {
      const url = URL.createObjectURL(blobStorage);
      setFile(url);
      return () => URL.revokeObjectURL(url);
    }
    console.log(window.innerHeight, window.innerWidth);
  }, [blobStorage]);

  return (
    <Document
      className={"flex justify-center h-100"}
      file={file ? file : "android-chrome-512x512.pdf"}
    >
      <Page
        width={isMobile ? window.innerWidth - 55 : window.innerWidth - 200}
        pageNumber={page}
        renderTextLayer={false}
      ></Page>
    </Document>
  );
}
