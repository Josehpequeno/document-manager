import { NavigateFunction } from "react-router-dom";
import ThumbnailView from "./thumbnailView";
import { useEffect, useState } from "react";
import { Document } from "../Interfaces/Document";
import axios from "../utils/axios";
import { User } from "../Interfaces/User";

interface FileViewProps {
  navigate: NavigateFunction;
  success: boolean | null;
  user: User | null;
}

export default function FilesView({ navigate, success, user }: FileViewProps) {
  const [files, setFiles] = useState<Document[]>([]);

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get("/documents", {
          headers: {
            Authorization: user!.access_token
          }
        });
        setFiles(response.data.documents);
      } catch (error) {
        console.error(error);
      }
    };
    getFiles();
  }, [navigate, success, user]);

  return (
    <div className="h-100 w-full p-0 md:p-4">
      {files.length === 0 ? (
        <div className="h-100 text-center">
          <h6>No items found</h6>
        </div>
      ) : (
        // items
        <div className="w-100 h-100 mt-4 px-3 items-center grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-col-6 3xl:grid-col-8 gap-4 gap-y-8 md:gap-2 md:gap-y-8 mb-6">
          {/* item */}
          {files.map((file) => (
            <div
              key={file.id}
              className=" h-full w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 bg-white mx-auto rounded-xl m-4 border shadow-lg shadow-gray-600 overflow-hidden"
            >
              <div className="h-3/4 bg-gray-100 justify-center flex group">
                <ThumbnailView
                  access_token={user!.access_token}
                  fileId={file.id}
                />
                <div className="absolute hidden group-hover:flex w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 justify-end">
                  <div className="w-8 hover:bg-red-600 fill-red-600 hover:fill-white rounded m-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="current"
                      xmlns="http://www.w3.org/2000/svg"
                      stroke=""
                      className="m-1"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          d="M3 6.38597C3 5.90152 3.34538 5.50879 3.77143 5.50879L6.43567 5.50832C6.96502 5.49306 7.43202 5.11033 7.61214 4.54412C7.61688 4.52923 7.62232 4.51087 7.64185 4.44424L7.75665 4.05256C7.8269 3.81241 7.8881 3.60318 7.97375 3.41617C8.31209 2.67736 8.93808 2.16432 9.66147 2.03297C9.84457 1.99972 10.0385 1.99986 10.2611 2.00002H13.7391C13.9617 1.99986 14.1556 1.99972 14.3387 2.03297C15.0621 2.16432 15.6881 2.67736 16.0264 3.41617C16.1121 3.60318 16.1733 3.81241 16.2435 4.05256L16.3583 4.44424C16.3778 4.51087 16.3833 4.52923 16.388 4.54412C16.5682 5.11033 17.1278 5.49353 17.6571 5.50879H20.2286C20.6546 5.50879 21 5.90152 21 6.38597C21 6.87043 20.6546 7.26316 20.2286 7.26316H3.77143C3.34538 7.26316 3 6.87043 3 6.38597Z"
                          fill="current"
                        ></path>{" "}
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.5956 22.0001H12.4044C15.1871 22.0001 16.5785 22.0001 17.4831 21.1142C18.3878 20.2283 18.4803 18.7751 18.6654 15.8686L18.9321 11.6807C19.0326 10.1037 19.0828 9.31524 18.6289 8.81558C18.1751 8.31592 17.4087 8.31592 15.876 8.31592H8.12404C6.59127 8.31592 5.82488 8.31592 5.37105 8.81558C4.91722 9.31524 4.96744 10.1037 5.06788 11.6807L5.33459 15.8686C5.5197 18.7751 5.61225 20.2283 6.51689 21.1142C7.42153 22.0001 8.81289 22.0001 11.5956 22.0001ZM10.2463 12.1886C10.2051 11.7548 9.83753 11.4382 9.42537 11.4816C9.01321 11.525 8.71251 11.9119 8.75372 12.3457L9.25372 17.6089C9.29494 18.0427 9.66247 18.3593 10.0746 18.3159C10.4868 18.2725 10.7875 17.8856 10.7463 17.4518L10.2463 12.1886ZM14.5746 11.4816C14.9868 11.525 15.2875 11.9119 15.2463 12.3457L14.7463 17.6089C14.7051 18.0427 14.3375 18.3593 13.9254 18.3159C13.5132 18.2725 13.2125 17.8856 13.2537 17.4518L13.7537 12.1886C13.7949 11.7548 14.1625 11.4382 14.5746 11.4816Z"
                          fill="current"
                        ></path>{" "}
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="h-1/4 mt-2 px-4 pb-4 w-full">
                <div className="flex justify-between">
                  <div className="w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 text-ellipsis overflow-hidden truncate">
                    <h1 className="text-sm md:text-sm 2xl:text-xl font-semibold text-gray-800 mt-2">
                      {file.title.replace(/[-_]/g, " ")}
                    </h1>
                    <p className="text-sm text-gray-600">{file.description}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-2">
                      Owner: {file.owner_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* item */}
        </div>
      )}
    </div>
  );
}
