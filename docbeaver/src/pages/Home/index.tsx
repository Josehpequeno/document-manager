import { Link, Navigate, useNavigate } from "react-router-dom";
import logo from "../../logo.png";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { logout } from "../../store/userSlice";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.userState.user);
  const [uploadMode, setUploadMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logout());
    return <Navigate to="/login" replace={true} />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
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

  const handleUpload = async (file: File) => {
    try {
      const form = new FormData();
      form.append("description", "description test");
      form.append("owner_id", user!.id);
      form.append("owner_name", user!.name);
      form.append("title", "title test");
      form.append("file", file);
      const response = await axios.post("/documents", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: user!.accessToken
        }
      });
      console.log(response.status, response.data);
    } catch (error) {
      console.error(error);
      setError("Error uploading file");
    }
  };

  useEffect(() => {
    setFiles([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="flex">
      <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 h-100 w-full max-w-[2.5rem] md:max-w-[12rem] p-1 md:p-4 shadow-xl shadow-blue-gray-900/5">
        <div className="mb-4 p-1 md:p-4 flex gap-2 items-center">
          <Link to="/home">
            <img src={logo} className="w-6 md:w-8 rounded" alt="logo" />
          </Link>
          <h5 className="hidden md:block antialiased tracking-normal font-sans text-base md:text-xl font-semibold leading-snug text-gray-900">
            DocBeaver
          </h5>
        </div>
        <nav className="capitalize flex flex-col gap-4 min-w-[200px] p-0 md:p-2 font-sans text-base font-normal text-gray-700">
          <div
            role="button"
            tabIndex={0}
            className="flex items-center w-8 md:w-3/4 p-1 md:p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-slate-950 focus:text-slate-950 active:text-slate-950 outline-none"
          >
            <div className="grid place-items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-6 w-6 md:h-5 md:w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <h6 className="hidden md:block">{user?.name}</h6>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center w-8 md:w-3/4 p-1 md:p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-slate-950 focus:text-slate-950 active:text-slate-950 outline-none"
          >
            <div className="grid place-items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-6 w-6 md:h-5 md:w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <h6 className="hidden md:block">Settings</h6>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="flex items-center w-8 md:w-3/4 p-1 md:p-3 rounded-lg text-start leading-tight transition-all hover:bg-blue-50 hover:bg-opacity-80 focus:bg-blue-50 focus:bg-opacity-80 active:bg-blue-50 active:bg-opacity-80 hover:text-slate-950 focus:text-slate-950 active:text-slate-950 outline-none"
            onClick={() => handleLogout()}
          >
            <div className="grid place-items-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-6 w-6 md:h-5 md:w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a.75.75 0 01.75.75v9a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM6.166 5.106a.75.75 0 010 1.06 8.25 8.25 0 1011.668 0 .75.75 0 111.06-1.06c3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788a.75.75 0 011.06 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <h6 className="hidden md:block">Log Out</h6>
          </div>
        </nav>
      </div>
      <div className="h-100 bg-slate-950 text-white flex-1">
        <div className="flex flex-row gap-4 items-center justify-center align-middle mt-4">
          <h1 className="text-2xl font-bold">Files</h1>
          <button className="bg-slate-950 hover:bg-white text-white hover:text-slate-950 font-bold py-2 px-4 rounded inline-flex items-center">
            {uploadMode ? (
              <svg
                className="fill-current w-4 h-4 mr-2 "
                viewBox="0 0 16.00 16.00"
                fill="#000000"
                xmlns="http://www.w3.org/2000/svg"
                strokeWidth="0.00016"
                transform="rotate(90)"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path d="m 4.496094 0 c -0.832032 0 -1.5 0.671875 -1.5 1.5 s 0.667968 1.5 1.5 1.5 c 0.828125 0 1.5 -0.671875 1.5 -1.5 s -0.671875 -1.5 -1.5 -1.5 z m 6 0 c -0.832032 0 -1.5 0.671875 -1.5 1.5 s 0.667968 1.5 1.5 1.5 c 0.828125 0 1.5 -0.671875 1.5 -1.5 s -0.671875 -1.5 -1.5 -1.5 z m -6 6 c -0.832032 0 -1.5 0.671875 -1.5 1.5 s 0.667968 1.5 1.5 1.5 c 0.828125 0 1.5 -0.671875 1.5 -1.5 s -0.671875 -1.5 -1.5 -1.5 z m 6 0 c -0.832032 0 -1.5 0.671875 -1.5 1.5 s 0.667968 1.5 1.5 1.5 c 0.828125 0 1.5 -0.671875 1.5 -1.5 s -0.671875 -1.5 -1.5 -1.5 z m -6 6 c -0.832032 0 -1.5 0.671875 -1.5 1.5 s 0.667968 1.5 1.5 1.5 c 0.828125 0 1.5 -0.671875 1.5 -1.5 s -0.671875 -1.5 -1.5 -1.5 z m 6 0 c -0.832032 0 -1.5 0.671875 -1.5 1.5 s 0.667968 1.5 1.5 1.5 c 0.828125 0 1.5 -0.671875 1.5 -1.5 s -0.671875 -1.5 -1.5 -1.5 z m 0 0"></path>{" "}
                </g>
              </svg>
            ) : (
              <svg
                className="fill-current w-4 h-4 mr-2"
                fill="#000000"
                height="200px"
                width="200px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 266 266"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <path d="M235.829,213.645c-0.038-0.676-0.088-1.35-0.153-2.018c-0.008-0.078-0.012-0.157-0.021-0.236 c-0.075-0.731-0.17-1.455-0.277-2.176c-0.029-0.195-0.06-0.389-0.091-0.583c-0.097-0.607-0.204-1.211-0.323-1.811 c-0.026-0.131-0.048-0.263-0.075-0.394c-0.144-0.695-0.305-1.384-0.477-2.068c-0.05-0.197-0.103-0.393-0.155-0.589 c-0.144-0.542-0.297-1.081-0.459-1.615c-0.053-0.176-0.103-0.353-0.158-0.528c-0.205-0.65-0.424-1.295-0.654-1.933 c-0.074-0.206-0.153-0.409-0.23-0.613c-0.18-0.479-0.368-0.955-0.563-1.427c-0.087-0.211-0.172-0.423-0.262-0.632 c-0.257-0.601-0.526-1.195-0.806-1.783c-0.104-0.219-0.214-0.435-0.322-0.652c-0.205-0.414-0.415-0.824-0.63-1.231 c-0.128-0.241-0.255-0.483-0.387-0.723c-0.301-0.546-0.61-1.086-0.931-1.619c-0.141-0.235-0.29-0.465-0.435-0.697 c-0.218-0.348-0.439-0.694-0.665-1.037c-0.174-0.263-0.349-0.526-0.527-0.786c-0.258-0.375-0.522-0.744-0.79-1.111 c-0.267-0.366-0.54-0.729-0.817-1.087c-0.218-0.282-0.436-0.563-0.66-0.839c-0.223-0.276-0.448-0.551-0.677-0.822 c-0.216-0.256-0.437-0.507-0.657-0.759c-0.394-0.448-0.795-0.89-1.205-1.324c-0.202-0.214-0.404-0.429-0.61-0.64 c-0.274-0.28-0.551-0.557-0.832-0.83c-0.189-0.185-0.382-0.366-0.575-0.548c-0.51-0.482-1.03-0.953-1.56-1.413 c-0.174-0.151-0.347-0.304-0.523-0.453c-0.32-0.27-0.644-0.534-0.971-0.796c-0.177-0.142-0.357-0.282-0.536-0.421 c-0.635-0.495-1.281-0.974-1.94-1.438c-0.12-0.084-0.237-0.171-0.357-0.254c-0.359-0.248-0.723-0.489-1.089-0.728 c-0.177-0.116-0.356-0.229-0.534-0.343c-0.811-0.515-1.635-1.01-2.477-1.478l0,0c-7.11-3.95-15.29-6.208-24-6.208 c-27.338,0-49.5,22.162-49.5,49.5c0,21.257,13.402,39.379,32.214,46.392c0.502,0.187,1.013,0.359,1.523,0.53 c0.215,0.072,0.427,0.148,0.643,0.218c0.458,0.147,0.922,0.281,1.387,0.416c0.279,0.081,0.558,0.163,0.839,0.238 c0.432,0.116,0.868,0.224,1.304,0.329c0.326,0.078,0.652,0.155,0.981,0.226c0.41,0.09,0.821,0.174,1.234,0.253 c0.37,0.071,0.743,0.137,1.116,0.199c0.384,0.065,0.769,0.128,1.156,0.184c0.422,0.061,0.846,0.112,1.272,0.162 c0.35,0.042,0.7,0.085,1.052,0.119c0.501,0.048,1.006,0.082,1.512,0.115c0.286,0.019,0.57,0.044,0.857,0.058 c0.799,0.039,1.602,0.061,2.411,0.061c0.806,0,1.607-0.023,2.403-0.061c0.267-0.013,0.531-0.036,0.797-0.053 c0.527-0.034,1.053-0.07,1.576-0.12c0.316-0.03,0.63-0.069,0.944-0.105c0.468-0.054,0.935-0.111,1.398-0.178 c0.332-0.048,0.662-0.101,0.992-0.155c0.441-0.073,0.881-0.151,1.318-0.235c0.336-0.065,0.67-0.132,1.003-0.203 c0.429-0.092,0.855-0.192,1.28-0.295c0.33-0.08,0.66-0.159,0.988-0.246c0.43-0.114,0.856-0.239,1.282-0.364 c0.312-0.092,0.626-0.179,0.935-0.276c0.491-0.155,0.975-0.324,1.459-0.494c0.235-0.082,0.474-0.157,0.707-0.243 c1.49-0.548,2.947-1.164,4.366-1.848h0c0.028-0.014,0.056-0.029,0.085-0.042c0.615-0.297,1.22-0.61,1.82-0.932 c0.187-0.1,0.373-0.203,0.558-0.306c0.482-0.267,0.959-0.541,1.431-0.823c0.152-0.091,0.306-0.179,0.457-0.271 c0.596-0.365,1.185-0.742,1.764-1.131c0.138-0.092,0.272-0.189,0.409-0.283c0.459-0.315,0.912-0.637,1.359-0.967 c0.171-0.126,0.341-0.252,0.51-0.38c0.511-0.386,1.015-0.781,1.51-1.186c0.053-0.044,0.108-0.085,0.161-0.129 c0.54-0.446,1.067-0.907,1.587-1.375c0.152-0.136,0.301-0.276,0.451-0.414c0.399-0.368,0.792-0.742,1.178-1.123 c0.132-0.13,0.267-0.259,0.397-0.391c0.491-0.495,0.974-0.999,1.444-1.515c0.096-0.105,0.188-0.214,0.283-0.32 c0.384-0.427,0.76-0.862,1.128-1.302c0.135-0.161,0.269-0.323,0.402-0.486c0.383-0.47,0.759-0.947,1.125-1.431 c0.064-0.085,0.131-0.167,0.194-0.252c0.419-0.562,0.824-1.135,1.22-1.716c0.11-0.161,0.217-0.325,0.325-0.488 c0.302-0.454,0.597-0.914,0.884-1.378c0.102-0.165,0.205-0.329,0.305-0.495c0.364-0.604,0.717-1.215,1.055-1.835 c0.052-0.095,0.1-0.193,0.152-0.289c0.288-0.538,0.566-1.082,0.835-1.631c0.092-0.188,0.183-0.377,0.272-0.566 c0.254-0.535,0.498-1.075,0.733-1.621c0.052-0.122,0.108-0.241,0.16-0.364c0.276-0.657,0.537-1.322,0.786-1.992 c0.064-0.173,0.124-0.347,0.186-0.521c0.189-0.529,0.37-1.062,0.541-1.599c0.061-0.192,0.124-0.383,0.183-0.576 c0.212-0.691,0.412-1.388,0.594-2.092c0.016-0.061,0.029-0.123,0.044-0.184c0.165-0.649,0.314-1.303,0.453-1.962 c0.043-0.206,0.084-0.413,0.125-0.62c0.115-0.582,0.219-1.167,0.313-1.755c0.025-0.156,0.053-0.31,0.077-0.466 c0.109-0.727,0.202-1.46,0.279-2.197c0.018-0.175,0.031-0.352,0.048-0.528c0.055-0.588,0.1-1.179,0.135-1.772 c0.012-0.213,0.025-0.427,0.035-0.641c0.034-0.755,0.058-1.513,0.058-2.277c0-0.76-0.023-1.515-0.057-2.266 C235.85,214.037,235.84,213.841,235.829,213.645z M201.416,247h-34c-4.143,0-7.5-3.357-7.5-7.5s3.357-7.5,7.5-7.5h34 c4.143,0,7.5,3.357,7.5,7.5S205.559,247,201.416,247z M208.148,206.321c-2.936,2.922-7.85,2.91-10.774-0.023l-4.291-4.144V217 c0,4.143-3.357,7.5-7.5,7.5s-7.5-3.357-7.5-7.5v-14.917l-4.066,4.226c-2.933,2.926-7.596,2.92-10.524-0.01 c-2.926-2.932-2.88-7.681,0.051-10.607l17.012-16.96c0.373-0.377,0.798-0.717,1.248-1.011c0.002-0.002,0.009-0.002,0.011-0.004 c0.536-0.35,1.115-0.377,1.713-0.577c0.78-0.262,1.588-0.14,2.386-0.14c0.008,0,0.016,0,0.023,0c0.765,0,1.534-0.129,2.281,0.112 c0.677,0.218,1.325,0.408,1.923,0.816c0.002,0,0.003-0.062,0.005-0.06c0.406,0.277,0.781,0.562,1.122,0.908l16.898,16.944 C211.09,198.656,211.081,203.397,208.148,206.321z M205.057,49h-46.974V3.731L205.057,49z M121.917,216.5 c0-35.565,28.768-64.5,64.333-64.5c8.48,0,16.833,1.661,23.833,4.649V64h-59.167c-4.143,0-7.833-3.357-7.833-7.5V0H37.916 c-4.143,0-7.833,3.357-7.833,7.5v247.465c0,4.133,3.509,7.486,7.642,7.5l103.77,0.336 C129.384,251.069,121.917,234.654,121.917,216.5z M69.416,93h99c4.143,0,7.5,3.357,7.5,7.5s-3.357,7.5-7.5,7.5h-99 c-4.143,0-7.5-3.357-7.5-7.5S65.274,93,69.416,93z M61.916,131.5c0-4.143,3.357-7.5,7.5-7.5h99c4.143,0,7.5,3.357,7.5,7.5 s-3.357,7.5-7.5,7.5h-99C65.274,139,61.916,135.643,61.916,131.5z"></path>{" "}
                </g>
              </svg>
            )}
            <span onClick={() => setUploadMode(!uploadMode)}>
              {uploadMode ? "List Files" : "Upload File"}
            </span>
          </button>
        </div>
        {/* items */}
        {uploadMode ? (
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
        ) : (
          <div className="h-100 lg:h-svh w-full p-0 md:p-4">
            {files.length === 0 ? (
              <div className="h-100 text-center">
                <h6>No items found</h6>
              </div>
            ) : (
              // items
              <div className="h-100 mt-4 px-3 items-center grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-2">
                {/* item */}
                {files.map((file) => (
                  <div
                    id={file.toString()}
                    className="bg-white mx-auto rounded-xl m-4 border shadow-lg shadow-gray-600 overflow-hidden"
                  >
                    <div className="relative h-32 bg-gray-600">
                      <img
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        src={logo}
                        alt="Cover"
                      />
                    </div>
                    <div className="relative mt-2 px-4 pb-4">
                      <div className="flex justify-between">
                        <div>
                          <h1 className="text-lg md:text-2xl font-semibold text-gray-800 mt-2">
                            Kaleab Selamawi
                          </h1>
                          <p className="text-sm text-gray-600">
                            @coding4ethiopia
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Software Engineer at C4E Company
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
        )}
      </div>
    </div>
  );
}
