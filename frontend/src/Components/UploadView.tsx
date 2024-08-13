import { useRef, useState } from "react";

interface UploadViewProps {
  setSuccess: Function;
  setSelectedFile: Function;
  handleUpload: Function;
  description: string;
  setDescription: Function;
}

export default function UploadView({
  setSuccess,
  setSelectedFile,
  handleUpload,
  description,
  setDescription,
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
      <div className="mb-4 mt-4">
        <label
          className="block text-white text-sm font-bold mb-2"
          htmlFor="description"
        >
          Description:
        </label>

        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="textarea"
          id="description"
          value={description}
          placeholder="(optional)"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label
          className={`flex justify-center h-svh w-100 px-4 transition bg-slate-950 border-2  border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none ${
            dragging ? "border-sky-300" : "border-gray-200"
          }`}
          htmlFor="file"
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
            id="file"
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
