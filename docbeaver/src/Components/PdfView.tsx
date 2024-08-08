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
      pdfContainerRef.current.scrollBy({ top: -250, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (pdfContainerRef.current) {
      pdfContainerRef.current.scrollBy({ top: 250, behavior: "smooth" });
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
          <button
            className={`text-red-700 focus:outline-none ${isNavOpen ? "hidden" : "block"}`}
            onClick={() => setViewPdfId(null)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM13.92 16.13H9C8.59 16.13 8.25 15.79 8.25 15.38C8.25 14.97 8.59 14.63 9 14.63H13.92C15.2 14.63 16.25 13.59 16.25 12.3C16.25 11.01 15.21 9.97 13.92 9.97H8.85L9.11 10.23C9.4 10.53 9.4 11 9.1 11.3C8.95 11.45 8.76 11.52 8.57 11.52C8.38 11.52 8.19 11.45 8.04 11.3L6.47 9.72C6.18 9.43 6.18 8.95 6.47 8.66L8.04 7.09C8.33 6.8 8.81 6.8 9.1 7.09C9.39 7.38 9.39 7.86 9.1 8.15L8.77 8.48H13.92C16.03 8.48 17.75 10.2 17.75 12.31C17.75 14.42 16.03 16.13 13.92 16.13Z"
                  fill="currentColor"
                ></path>{" "}
              </g>
            </svg>
          </button>
          <div
            className={`text-2xl font-bold text-gray-800 ${isNavOpen ? "hidden" : "block"}`}
          >
            PDF Viewer
          </div>
          <button
            className="block lg:hidden text-slate-800 focus:outline-none"
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            <svg
              className="w-8 h-8"
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
            className={`lg:flex flex lg:items-center space-x-2 px-1 lg:space-x-4 ${isNavOpen ? "block" : "hidden"}`}
          >
            <button
              className="p-2 md:px-4 md:py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none"
              onClick={handleZoomIn}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M20.9992 21L14.9492 14.95"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M6 10H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M10 6V14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
            <button
              className="p-2 md:px-4 md:py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none"
              onClick={handleZoomOut}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M20.9992 21L14.9492 14.95"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M6 10H14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
            <button
              className="p-2 md:px-4 md:py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none"
              onClick={handlePrevPage}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.785 6.36699L10.095 10.667C9.72311 10.9319 9.50229 11.3604 9.50229 11.817C9.50229 12.2736 9.72311 12.702 10.095 12.967L15.785 17.667C16.2658 18.0513 16.9185 18.1412 17.4853 17.9012C18.052 17.6611 18.4416 17.1297 18.5 16.517V7.51699C18.4416 6.90427 18.052 6.37286 17.4853 6.1328C16.9185 5.89274 16.2658 5.98265 15.785 6.36699Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M6.5 6.01697L6.5 18.017"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
            <span className="text-slate-800 p-0.5 border-slate-800 rounded-lg border-2">
              {page} / {numPages}
            </span>
            <button
              className="p-2 md:px-4 md:py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none"
              onClick={handleNextPage}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.715 6.36694L14.405 10.6669C14.7769 10.9319 14.9977 11.3603 14.9977 11.8169C14.9977 12.2736 14.7769 12.702 14.405 12.9669L8.715 17.6669C8.23425 18.0513 7.58151 18.1412 7.01475 17.9011C6.44799 17.6611 6.05842 17.1297 6 16.5169V7.51694C6.05842 6.90422 6.44799 6.37281 7.01475 6.13275C7.58151 5.89269 8.23425 5.9826 8.715 6.36694Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>{" "}
                  <path
                    d="M18 6.01697V18.017"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  ></path>{" "}
                </g>
              </svg>
            </button>
            <button
              onClick={handleFullscreen}
              className="p-2 md:px-4 md:py-2 bg-purple-500 text-white rounded hover:bg-purple-700 focus:outline-none"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path
                    d="M4.75 9.233C4.75 9.64721 5.08579 9.983 5.5 9.983C5.91421 9.983 6.25 9.64721 6.25 9.233H4.75ZM6.25 5.5C6.25 5.08579 5.91421 4.75 5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5H6.25ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5C4.75 5.91421 5.08579 6.25 5.5 6.25V4.75ZM9.233 6.25C9.64721 6.25 9.983 5.91421 9.983 5.5C9.983 5.08579 9.64721 4.75 9.233 4.75V6.25ZM6.03033 4.96967C5.73744 4.67678 5.26256 4.67678 4.96967 4.96967C4.67678 5.26256 4.67678 5.73744 4.96967 6.03033L6.03033 4.96967ZM9.96967 11.0303C10.2626 11.3232 10.7374 11.3232 11.0303 11.0303C11.3232 10.7374 11.3232 10.2626 11.0303 9.96967L9.96967 11.0303ZM15.767 18.75C15.3528 18.75 15.017 19.0858 15.017 19.5C15.017 19.9142 15.3528 20.25 15.767 20.25V18.75ZM19.5 20.25C19.9142 20.25 20.25 19.9142 20.25 19.5C20.25 19.0858 19.9142 18.75 19.5 18.75V20.25ZM18.75 19.5C18.75 19.9142 19.0858 20.25 19.5 20.25C19.9142 20.25 20.25 19.9142 20.25 19.5H18.75ZM20.25 15.767C20.25 15.3528 19.9142 15.017 19.5 15.017C19.0858 15.017 18.75 15.3528 18.75 15.767H20.25ZM18.9697 20.0303C19.2626 20.3232 19.7374 20.3232 20.0303 20.0303C20.3232 19.7374 20.3232 19.2626 20.0303 18.9697L18.9697 20.0303ZM15.0303 13.9697C14.7374 13.6768 14.2626 13.6768 13.9697 13.9697C13.6768 14.2626 13.6768 14.7374 13.9697 15.0303L15.0303 13.9697ZM6.25 15.767C6.25 15.3528 5.91421 15.017 5.5 15.017C5.08579 15.017 4.75 15.3528 4.75 15.767H6.25ZM4.75 19.5C4.75 19.9142 5.08579 20.25 5.5 20.25C5.91421 20.25 6.25 19.9142 6.25 19.5H4.75ZM5.5 18.75C5.08579 18.75 4.75 19.0858 4.75 19.5C4.75 19.9142 5.08579 20.25 5.5 20.25V18.75ZM9.233 20.25C9.64721 20.25 9.983 19.9142 9.983 19.5C9.983 19.0858 9.64721 18.75 9.233 18.75V20.25ZM4.96967 18.9697C4.67678 19.2626 4.67678 19.7374 4.96967 20.0303C5.26256 20.3232 5.73744 20.3232 6.03033 20.0303L4.96967 18.9697ZM11.0303 15.0303C11.3232 14.7374 11.3232 14.2626 11.0303 13.9697C10.7374 13.6768 10.2626 13.6768 9.96967 13.9697L11.0303 15.0303ZM15.767 4.75C15.3528 4.75 15.017 5.08579 15.017 5.5C15.017 5.91421 15.3528 6.25 15.767 6.25V4.75ZM19.5 6.25C19.9142 6.25 20.25 5.91421 20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75V6.25ZM20.25 5.5C20.25 5.08579 19.9142 4.75 19.5 4.75C19.0858 4.75 18.75 5.08579 18.75 5.5H20.25ZM18.75 9.233C18.75 9.64721 19.0858 9.983 19.5 9.983C19.9142 9.983 20.25 9.64721 20.25 9.233H18.75ZM20.0303 6.03033C20.3232 5.73744 20.3232 5.26256 20.0303 4.96967C19.7374 4.67678 19.2626 4.67678 18.9697 4.96967L20.0303 6.03033ZM13.9697 9.96967C13.6768 10.2626 13.6768 10.7374 13.9697 11.0303C14.2626 11.3232 14.7374 11.3232 15.0303 11.0303L13.9697 9.96967ZM6.25 9.233V5.5H4.75V9.233H6.25ZM5.5 6.25H9.233V4.75H5.5V6.25ZM4.96967 6.03033L9.96967 11.0303L11.0303 9.96967L6.03033 4.96967L4.96967 6.03033ZM15.767 20.25H19.5V18.75H15.767V20.25ZM20.25 19.5V15.767H18.75V19.5H20.25ZM20.0303 18.9697L15.0303 13.9697L13.9697 15.0303L18.9697 20.0303L20.0303 18.9697ZM4.75 15.767V19.5H6.25V15.767H4.75ZM5.5 20.25H9.233V18.75H5.5V20.25ZM6.03033 20.0303L11.0303 15.0303L9.96967 13.9697L4.96967 18.9697L6.03033 20.0303ZM15.767 6.25H19.5V4.75H15.767V6.25ZM18.75 5.5V9.233H20.25V5.5H18.75ZM18.9697 4.96967L13.9697 9.96967L15.0303 11.0303L20.0303 6.03033L18.9697 4.96967Z"
                    fill="currentColor"
                  ></path>{" "}
                </g>
              </svg>
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
              className={"h-100 md:flex overflow-x-hidden"}
              renderTextLayer={false}
              scale={scale}
            ></Page>
          </Document>
        </div>
      </div>
    </div>
  );
}
