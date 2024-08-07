import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useRef, useState } from "react";
import axios from "../utils/axios";
import useMedia from "../utils/useMedia";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewProps {
  viewPdfId: string;
  access_token: string;
  setViewPdfId: Function;
}

export default function PdfView({
  viewPdfId,
  access_token,
  setViewPdfId,
}: PdfViewProps) {
  const [file, setFile] = useState<string | null>(null);
  const [blobStorage, setBlobStorage] = useState<Blob | null>(null);
  const [page, setPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const isMobile = useMedia("(max-width: 767px)");
  const [width, setWidth] = useState(
    isMobile ? window.innerWidth - 60 : window.innerWidth - 300,
  );
  const [scale, setScale] = useState<number>(1);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          handlePrevPage();
          break;
        case "ArrowRight":
          handleNextPage();
          break;
        case "Escape":
          setViewPdfId(null);
          break;
        case "f":
          handleFullscreen();
          break;
        case "ArrowUp":
          scrollUp();
          break;
        case "ArrowDown":
          scrollDown();
          break;
        default:
          break;
      }
    };

    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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
                Authorization: access_token,
              },
              responseType: "arraybuffer",
            },
          );
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setBlobStorage(blob);
          setFile(url);

          const arrayBuffer = response.data;
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

  const handleFullscreen = () => {
    const pdfContainer = document.getElementById("pdfContainer");
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
    } else if (pdfContainer) {
      pdfContainer.requestFullscreen();
      setIsFullScreen(true);
    }
  };

  const handleZoomIn = () => {
    if (scale < 2) {
      setScale(scale + 0.2);
    }
  };

  const handleZoomOut = () => {
    if (scale > 0.4) {
      setScale(scale - 0.2);
    }
  };

  const handleNextPage = () => {
    if (page < numPages!) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const scrollUp = () => {
    if (pdfContainerRef.current) {
      pdfContainerRef.current.scrollBy({ top: -200, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (pdfContainerRef.current) {
      pdfContainerRef.current.scrollBy({ top: 200, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isFullScreen) {
      setWidth(window.innerWidth);
    } else if (isMobile) {
      setWidth(window.innerWidth - 60);
    } else {
      setWidth(window.innerWidth - 300);
    }
  }, [isFullScreen, isMobile]);

  useEffect(() => {
    if (blobStorage) {
      const url = URL.createObjectURL(blobStorage);
      setFile(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blobStorage]);

  return (
    <div className="h-100 overflow-hidden">
      <nav className="bg-white shadow-xl shadow-blue-gray-900/5 bg-clip-border">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">PDF Viewer</div>
          <button
            className="block lg:hidden text-gray-800 focus:outline-none"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <svg
              className="w-6 h-6 text-slate-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <div
            className={`lg:flex lg:items-center lg:space-x-4 ${isNavOpen ? "block" : "hidden"}`}
          >
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none"
              onClick={handleZoomIn}
            >
              Zoom In
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none"
              onClick={handleZoomOut}
            >
              Zoom Out
            </button>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 focus:outline-none">
              Download
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none"
              onClick={handlePrevPage}
            >
              Prev Page
            </button>
            <span className="text-slate-800 p-2 border-slate-800 rounded-lg border-2">
              {page} / {numPages}
            </span>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none"
              onClick={handleNextPage}
            >
              Next Page
            </button>
            <button
              onClick={handleFullscreen}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 focus:outline-none"
            >
              Fullscreen
            </button>
          </div>
        </div>
      </nav>

      <div
        id="pdfContainer"
        ref={pdfContainerRef}
        className="container mx-auto my-0 h-100 overflow-auto bg-gray-200 flex"
      >
        <div className="bg-gray-200 text-center">
          <Document
            file={file ? file : "android-chrome-512x512.pdf"}
            className={"overflow-x-hidden"}
          >
            <Page
              width={width}
              pageNumber={page}
              className={"h-100 flex overflow-x-hidden"}
              renderTextLayer={false}
              scale={scale}
            ></Page>
          </Document>
        </div>
      </div>
    </div>
  );
}
