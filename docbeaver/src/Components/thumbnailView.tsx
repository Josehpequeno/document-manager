import { Document, Thumbnail, pdfjs } from "react-pdf";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import useMedia from "../utils/useMedia";
interface ThumbnailViewProps {
  fileId: string;
  access_token: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function ThumbnailView({
  fileId,
  access_token
}: ThumbnailViewProps) {
  const [file, setFile] = useState<string | null>(null);
  const [blobStorage, setBlobStorage] = useState<Blob | null>(null);
  const is2xl = useMedia("(min-width: 1536px)");

  useEffect(() => {
    const getFile = async () => {
      try {
        if (blobStorage === null) {
          const response = await axios.get<ArrayBuffer>(
            `/documents/file/${fileId}`,
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
        }
      } catch (error) {
        console.error(error);
        setFile("android-chrome-512x512.pdf");
      }
    };
    getFile();
  }, [fileId, access_token, blobStorage]);

  useEffect(() => {
    if (blobStorage) {
      const url = URL.createObjectURL(blobStorage);
      setFile(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blobStorage]);

  return (
    <Document file={file ? file : "android-chrome-512x512.pdf"}>
      <Thumbnail
        pageNumber={1}
        scale={is2xl ? 1.05 : 0.7}
        height={400}
      ></Thumbnail>
    </Document>
  );
}
