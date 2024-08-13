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
  setViewPdfId: Function;
}

export default function FilesView({
  navigate,
  success,
  user,
  setViewPdfId,
}: FileViewProps) {
  const [files, setFiles] = useState<Document[]>([]);
  const [removeModeFileId, setRemoveModeFileId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleRemove = async () => {
    await axios.delete(`/documents/${removeModeFileId}`, {
      headers: {
        Authorization: user!.access_token,
      },
    });
    setFiles(files.filter((file) => file.id !== removeModeFileId));
  };

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get(
          `/documents/?sort=created_at&dir=desc&page=${currentPage}`,
          {
            headers: {
              Authorization: user!.access_token,
            },
          },
        );
        setTotalPages(response.data.total_pages);
        setFiles(response.data.documents);
      } catch (error) {
        console.error(error);
      }
    };
    getFiles();
  }, [navigate, success, user, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

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
              className="h-full w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 bg-white mx-auto rounded-xl m-4 border shadow-lg shadow-gray-600 overflow-hidden"
            >
              {file.id !== removeModeFileId ? (
                <>
                  <div className="bg-transparent justify-center flex group">
                    <ThumbnailView
                      access_token={user!.access_token}
                      fileId={file.id}
                    />
                    <div
                      className="absolute hidden group-hover:flex w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 justify-end"
                      onClick={() => setRemoveModeFileId(file.id)}
                    >
                      <div className="w-8 hover:bg-red-600 fill-red-600 hover:fill-white rounded m-1">
                        <svg
                          viewBox="0 0 24 24"
                          fill="current"
                          xmlns="http://www.w3.org/2000/svg"
                          stroke=""
                          className="m-1"
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
                    <div
                      className="absolute hidden group-hover:flex mt-40 w-40 sm:w-40 sm:mt-40 md:w-48 md:mt-48 lg:w-52 lg:mt-52 xl:w-58 xl:mt-52 2xl:w-72 2xl:mt-72 justify-end"
                      onClick={() => setViewPdfId(file.id)}
                    >
                      <div className="w-8 h-8 hover:bg-secundary fill-secundary hover:fill-white rounded m-1">
                        <svg
                          fill="current"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="View"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 494.907 494.907"
                          className="mx-auto my-1.5"
                        >
                          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            {" "}
                            <g>
                              {" "}
                              <path d="M70.571,459.196c-6.131,0-11.114-4.983-11.114-11.106V105.993c0-6.123,4.983-11.104,11.114-11.104H308.28 c6.131,0,11.115,4.98,11.115,11.104v147.911c10.565-3.519,21.644-5.855,33.132-6.844V105.993c0-24.396-19.849-44.236-44.247-44.236 H121.157V44.236c0-6.124,4.982-11.104,11.113-11.104h237.711c6.13,0,11.113,4.98,11.113,11.104V247.36 c11.517,1.279,22.586,4.013,33.131,7.839V44.236C414.225,19.841,394.378,0,369.981,0H132.27c-24.397,0-44.245,19.841-44.245,44.236 v17.521H70.571c-24.397,0-44.246,19.841-44.246,44.236V448.09c0,24.395,19.849,44.238,44.246,44.238h190.666 c-9.543-9.811-17.714-20.943-24.203-33.132H70.571z"></path>{" "}
                              <path d="M126.913,190.86h95.61c9.158,0,16.565-7.418,16.565-16.565c0-9.149-7.407-16.566-16.565-16.566h-95.61 c-9.153,0-16.561,7.418-16.561,16.566C110.352,183.442,117.759,190.86,126.913,190.86z"></path>{" "}
                              <path d="M268.514,247.846c0-9.148-7.407-16.566-16.566-16.566H126.913c-9.153,0-16.561,7.418-16.561,16.566 c0,9.149,7.407,16.566,16.561,16.566h125.035C261.107,264.412,268.514,256.995,268.514,247.846z"></path>{" "}
                              <path d="M249.055,304.808H126.913c-9.153,0-16.561,7.417-16.561,16.565c0,9.148,7.407,16.566,16.561,16.566h103.521 C235.172,326.022,241.483,314.926,249.055,304.808z"></path>{" "}
                              <path d="M126.913,378.342c-9.153,0-16.561,7.418-16.561,16.565c0,9.148,7.407,16.566,16.561,16.566h94.737 c-0.907-6.584-1.552-13.267-1.552-20.103c0-4.4,0.274-8.728,0.664-13.029H126.913z"></path>{" "}
                              <path d="M365.047,357.148c-28.438,0-53.614,23.563-63.545,34.223c9.931,10.655,35.107,34.209,63.545,34.209 c28.553,0,53.658-23.547,63.545-34.199C418.675,380.728,393.504,357.148,365.047,357.148z M365.047,416.22 c-13.718,0-24.846-11.128-24.846-24.849c0-13.732,11.128-24.847,24.846-24.847s24.846,11.114,24.846,24.847 C389.893,405.092,378.765,416.22,365.047,416.22z"></path>{" "}
                              <path d="M365.047,287.837c-57.186,0-103.536,46.349-103.536,103.534c0,57.173,46.35,103.536,103.536,103.536 c57.186,0,103.535-46.363,103.535-103.536C468.582,334.185,422.233,287.837,365.047,287.837z M365.047,442.143 c-44.681,0-79.594-43.791-81.064-45.652c-2.345-3.008-2.345-7.23,0-10.23c1.471-1.868,36.384-45.678,81.064-45.678 c44.679,0,79.592,43.809,81.064,45.678c2.345,3,2.345,7.223,0,10.23C444.639,398.353,409.726,442.143,365.047,442.143z"></path>{" "}
                            </g>{" "}
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 px-4 pb-4 w-full">
                    <div className="flex justify-between">
                      <div className="w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 text-ellipsis overflow-hidden truncate">
                        <h1 className="text-sm md:text-sm 2xl:text-xl font-semibold text-gray-800 mt-2">
                          {file.title.replace(/[-_]/g, " ")}
                        </h1>
                        <p className="text-sm text-gray-600">
                          {file.description}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-2">
                          Owner: {file.owner_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center">
                    <div>
                      {/* <!-- Button to open the modal --> */}
                      <button className="w-40 sm:w-40 md:w-48 lg:w-52 xl:w-58 2xl:w-72 text-sm py-1 text-white font-medium bg-red-500 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-red-500">
                        {" "}
                        Delete {file.title.replace(/[-_]/g, " ")}{" "}
                      </button>
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        {/* <!-- Modal content --> */}
                        <div className="flex flex-col">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:h-16 sm:w-16 sm:my-5">
                            {/* <!-- Heroicon name: outline/exclamation --> */}
                            <svg
                              width="64px"
                              height="64px"
                              className="h-6 w-6 text-red-600"
                              fill="none"
                              viewBox="0 0 24.00 24.00"
                              xmlns="http://www.w3.org/2000/svg"
                              stroke="#ef4444"
                              strokeWidth="0.45600000000000007"
                            >
                              <g key="SVGRepo_bgCarrier" strokeWidth="0"></g>
                              <g
                                key="SVGRepo_tracerCarrier"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              ></g>
                              <g id="SVGRepo_iconCarrier">
                                <path
                                  d="M12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13V8C11.25 7.58579 11.5858 7.25 12 7.25Z"
                                  fill="#ef4444"
                                ></path>
                                <path
                                  d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z"
                                  fill="#ef4444"
                                ></path>
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M8.2944 4.47643C9.36631 3.11493 10.5018 2.25 12 2.25C13.4981 2.25 14.6336 3.11493 15.7056 4.47643C16.7598 5.81544 17.8769 7.79622 19.3063 10.3305L19.7418 11.1027C20.9234 13.1976 21.8566 14.8523 22.3468 16.1804C22.8478 17.5376 22.9668 18.7699 22.209 19.8569C21.4736 20.9118 20.2466 21.3434 18.6991 21.5471C17.1576 21.75 15.0845 21.75 12.4248 21.75H11.5752C8.91552 21.75 6.84239 21.75 5.30082 21.5471C3.75331 21.3434 2.52637 20.9118 1.79099 19.8569C1.03318 18.7699 1.15218 17.5376 1.65314 16.1804C2.14334 14.8523 3.07658 13.1977 4.25818 11.1027L4.69361 10.3307C6.123 7.79629 7.24019 5.81547 8.2944 4.47643ZM9.47297 5.40432C8.49896 6.64148 7.43704 8.51988 5.96495 11.1299L5.60129 11.7747C4.37507 13.9488 3.50368 15.4986 3.06034 16.6998C2.6227 17.8855 2.68338 18.5141 3.02148 18.9991C3.38202 19.5163 4.05873 19.8706 5.49659 20.0599C6.92858 20.2484 8.9026 20.25 11.6363 20.25H12.3636C15.0974 20.25 17.0714 20.2484 18.5034 20.0599C19.9412 19.8706 20.6179 19.5163 20.9785 18.9991C21.3166 18.5141 21.3773 17.8855 20.9396 16.6998C20.4963 15.4986 19.6249 13.9488 18.3987 11.7747L18.035 11.1299C16.5629 8.51987 15.501 6.64148 14.527 5.40431C13.562 4.17865 12.8126 3.75 12 3.75C11.1874 3.75 10.4379 4.17865 9.47297 5.40432Z"
                                  fill="#ef4444"
                                ></path>
                              </g>
                            </svg>
                          </div>
                          <div className="mt-3 text-center">
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                {" "}
                                Are you sure you want to delete? This action
                                cannot be undone.{" "}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 flex flex-col-reverse justify-center w-100 mx-3">
                        <button
                          type="button"
                          className="mt-2 md:mt-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                          onClick={() => handleRemove()}
                        >
                          {" "}
                          Delete{" "}
                        </button>
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:text-sm "
                          onClick={() => {
                            setRemoveModeFileId(null);
                          }}
                        >
                          {" "}
                          Cancel{" "}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {/* item */}
        </div>
      )}
      {totalPages > 0 && (
        <div className="flex justify-between mt-4 bg-white rounded-xl mx-10 my-5 md:my-2">
          <button
            className="px-4 py-2 text-slate-800 rounded disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
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
          <span className="text-slate-800 p-2">
            {currentPage} / {totalPages}
          </span>
          <button
            className="px-4 py-2 text-slate-800 rounded disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
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
        </div>
      )}
    </div>
  );
}
