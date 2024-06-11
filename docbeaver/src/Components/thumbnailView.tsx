import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageThumbnailPlugin } from "../utils/PDFThumbnail";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
interface ThumbnailViewProps {
  fileId: string;
  access_token: string;
}

export default function ThumbnailView({
  fileId,
  access_token
}: ThumbnailViewProps) {
  const thumbnailPluginInstance = thumbnailPlugin();
  const { Cover } = thumbnailPluginInstance;
  const pageThumbnailPluginInstance = pageThumbnailPlugin({
    PageThumbnail: <Cover width={300} getPageIndex={() => 0} />
  });
  const [file, setFile] = useState<string | null>(null);
  const [blobStorage, setBlobStorage] = useState<Blob | null>(null);

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
    <Worker workerUrl="pdf.worker.min.js">
      <Viewer
        fileUrl={file ? file : "android-chrome-512x512.pdf"}
        plugins={[pageThumbnailPluginInstance, thumbnailPluginInstance]}
      />
    </Worker>
  );
}
