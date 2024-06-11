import { useRef, useState } from "react";

interface UploadViewProps {
  setSuccess: Function;
  setSelectedFile: Function;
  handleUpload: Function;
}

export default function UploadView({
  setSuccess,
  setSelectedFile,
  handleUpload
}: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccess(null);
    const files = e.target.files;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (files && files.length > 0) {
      if (files[0].type === "application/pdf") {
        console.log(files[0]);
        setSelectedFile(files[0]);
        handleUpload(files[0]);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type === "application/pdf") {
        console.log(files[0]);
        setSelectedFile(files[0]);
        handleUpload(files[0]);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  };

  return (
    <div className="h-100 w-100 p-4 m-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label
          className={`flex justify-center h-svh w-100 px-4 transition bg-slate-950 border-2  border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none ${
            dragging ? "border-sky-300" : "border-gray-200"
          }`}
        >
          <span className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="font-medium text-gray-200">
              Drop files to Attach, or{" "}
              <span className="text-primary underline">browse</span>
            </span>
          </span>
          <input
            type="file"
            name="file_upload"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}
